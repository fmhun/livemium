var fs = require('fs')
	, exec = require('child_process').exec
	, sys = require('util')
	, spawn = require('child_process').spawn
	, SAMPLE_TI_PROJECT_PATH = __dirname+'/tests/integration/sample_ti_project'
	, TI_SDK_PATH = process.env['HOME']+'/Library/Application Support/Titanium/mobilesdk/osx'
	, TI_SDK_VERSION = '2.1.1';

namespace('test', function () {
	desc('Run Titanium demo application');
	namespace('integration', function () {
		
		desc('Prepare application for integration test');
		task('prepare', [], function () {
			console.log('Copying livemium client.js into Titanium project at Resources/lib/livemium.js ...');
			copyClientIntoTiProject();
		});
		
		desc('Run integration test for iPhone');
		task('iphone', ['prepare'], function (env) {
			console.log('Running application into iPhone Simulator...');
			var tiRunProc = spawn(
				TI_SDK_PATH + '/' + TI_SDK_VERSION + '/titanium.py',
				['run', '--platform=iphone', '--dir=' + SAMPLE_TI_PROJECT_PATH], 
				{ stdio: 'inherit' }
			);
			
			process.on('SIGINT', function () {
				if (tiRunProc) { tiRunProc.kill(); }
			});
		});
		
		desc('Run integration test for Android');
		task('androiddevice', ['prepare'], function (env) {
			console.log('Running application into Adnroid device...');
			var tiRunProc = spawn(
				TI_SDK_PATH + '/' + TI_SDK_VERSION + '/android/builder.py',
				['install', 'livemiumdemo', TI_SDK_PATH + '/../android', SAMPLE_TI_PROJECT_PATH, 'com.livemiumdemo', 8], 
				{ stdio: 'inherit' }
			);
			
			process.on('SIGINT', function () {
				if (tiRunProc) { tiRunProc.kill(); }
			});
		});
	});
});

function copyClientIntoTiProject () {
	fs.writeFileSync(
		SAMPLE_TI_PROJECT_PATH + '/Resources/lib/livemium.js', 
		fs.readFileSync(__dirname+'/client.js')
	);
}