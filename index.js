require('app-module-path/register');
require('custom-env').env();

const package = require('./package.json');
const Listr = require('listr');

(async () => {
	try {
		console.log(`${package.description} ${package.version}`);

		const tasks = new Listr([
			{
				title: 'database',
				task: () => require('./lib/db')
			},
			{
				title: 'remote',
				task: () => require('./lib/remote')
			},
			{
				title: 'services',
				task: () => require('./lib/service')
			},
			{
				title: 'jobs',
				task: () => require('./lib/jobs')
			},
			{
				title: 'bot',
				task: () => require('./lib/bot')
			},
			{
				title: 'wss',
				task: (ctx) => require('./lib/wss')
			}
		]);

		await tasks.run();

		console.log('');
		console.log('Press CTRL-C to exit...');
	} catch (e) {
		console.error(e);
	}
})();
