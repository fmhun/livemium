var sys     = require('util')
	, lm      = require('./lib/livemium.js')
	, fs      = require('fs')
	, _       = require('underscore');

exports.livemium = lm;

exports.run = run;


function run (projectPath, port) {
	console.log('watching project %s', projectPath);
	var server  = new lm.Server()
		, watcher = new lm.Watcher(projectPath)
		, platforms = ['android', 'iphone']
		, resourcesPath = projectPath + '/Resources'
		, tiAppXmlPath = projectPath + '/tiapp.xml'
		, cssc = new lm.CssCompiler(projectPath);
	
	// Create a jss snapshot and send it to registered client.
	server.on('register', function (stream) {
		cssc.compileAsync(stream.platform, function (data) {
			server.send(stream, { action: 'jss:initialize', data: data });
		});
	});

	// Start the watcher and broadcoast new jss on file change.
	watcher.watch(resourcesPath, function (e) {
		sys.puts('updated file '+e.file);
		_.each(platforms, function (platform) {
			cssc.compileAsync(platform, function (data) {
				server.broadcast({ action: 'jss:refresh', data: data }, platform);
			});
		});
	});

	server.listen(port);
}