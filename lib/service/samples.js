'use strict';

const debug = require('debug')('service:sample');
const DEF_OPTS = {};

module.exports = (broker, db, opts) => {
	opts = { ...DEF_OPTS, opts };
};
