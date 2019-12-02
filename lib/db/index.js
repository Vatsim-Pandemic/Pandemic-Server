'use strict';

const debug = require('debug')('db:index');
const Ajv = require('ajv');
const Loki = require('lokijs');
const LokiAdapter = require('lokijs/src/loki-fs-structured-adapter');
const broker = require('lib/broker');

const ValidationError = (errors) => {
	return Object.assign(Error, {
		message: 'Schema validation failed!',
		detail: errors
	});
};

const opts = {
	namespace: 'pandemic',
	filename: process.env.PANDEMIC_DB_FILENAME || 'pandemic.db',
	persist: Boolean(parseInt(process.env.PANDEMIC_DB_PERSIST))
};

const schema = new Ajv({ useDefaults: true });

// map of collection configuration settings
const configurations = {
	event: {
		schema: require('./schemas/event.schema.js'),
		transforms: require('./transforms/event.tx.js'),
		options: { unique: ['id', 'code'], asyncListeners: true }
	},
	zone: {
		schema: require('./schemas/zone.schema.js'),
		transforms: require('./transforms/zone.tx.js'),
		options: { unique: ['id', 'name', 'airport'], asyncListeners: true }
	},
	pilot: {
		schema: require('./schemas/pilot.schema.js'),
		transforms: require('./transforms/pilot.tx.js'),
		options: { unique: ['id', 'cid', 'did', 'callsign'], asyncListeners: true }
	},
	flight: {
		schema: require('./schemas/flight.schema.js'),
		transforms: require('./transforms/flight.tx.js'),
		options: { unique: ['id', 'sid'], indices: ['callsign', 'cid'], asyncListeners: true }
	},
	sample: {
		schema: require('./schemas/sample.schema.js'),
		transforms: require('./transforms/sample.tx.js'),
		options: { unique: ['id'], asyncListeners: true }
	},
	kpi: {
		schema: require('./schemas/kpi.schema.js'),
		transforms: require('./transforms/kpi.tx.js'),
		options: { unique: ['id'], asyncListeners: true }
	},
	log: {
		schema: require('./schemas/log.schema.js'),
		transforms: require('./transforms/log.tx.js'),
		options: { unique: ['id'], asyncListeners: true }
	}
};

Loki.Collection.prototype.validate = function(doc) {
	if (this.name in configurations) {
		const cfg = configurations[this.name];
		if (!schema.validate(cfg.schema, doc)) {
			return schema.errors;
		}
	}
};

Loki.Collection.prototype.insert = (function(original) {
	return function(doc) {
		const errors = this.validate(doc);
		if (errors) {
			throw ValidationError(errors);
		}
		return original.apply(this, arguments);
	};
})(Loki.Collection.prototype.insert);

Loki.Collection.prototype.update = (function(original) {
	return function(doc) {
		const errors = this.validate(doc);
		if (errors) {
			throw ValidationError(errors);
		}
		return original.apply(this, arguments);
	};
})(Loki.Collection.prototype.update);

module.exports = (() => {
	return new Promise((resolve, reject) => {
		// callback to initialize the database during loading
		const init = (db) => {
			for (const collectionName in configurations) {
				let cfg = configurations[collectionName];
				let dbc = db.getCollection(collectionName);

				// if the collection does not exist, create it with specified options
				if (!dbc) {
					dbc = db.addCollection(collectionName, cfg.options);
				}

				// publish get method for generated primary key
				broker.register(`${opts.namespace}.${collectionName}.get`, (value) => {
					return dbc.by('id', value);
				});

				// publish get method for alternate primary keys
				broker.register(`${opts.namespace}.${collectionName}.by`, (field, value) => {
					return dbc.by(field, value);
				});

				// publish standard CRUD procedures on broker
				const procs = ['validate', 'insert', 'update', 'delete'];
				for (const procName of procs) {
					broker.register(`${opts.namespace}.${collectionName}.${procName}`, (doc) => {
						return dbc[procName](doc);
					});
				}

				// publish transforms to the broker (not stored in the database)
				for (const txName in cfg.transforms) {
					const tx = cfg.transforms[txName];
					broker.register(`${opts.namespace}.${collectionName}.${txName}`, (params) => {
						const data = dbc.chain(tx, params).data();
						return data;
					});
				}
			}

			resolve(db);
		};

		// create a new database
		try {
			const dbOptions = opts.persist
				? {
						adapter: new LokiAdapter(),
						autoload: true,
						autoloadCallback: () => init(db),
						autosave: true,
						autosaveInterval: 5000
				  }
				: {};

			const db = new Loki(opts.filename, dbOptions);

			if (!opts.persist) {
				init(db);
			}
		} catch (e) {
			reject(e);
		}
	});
})();
