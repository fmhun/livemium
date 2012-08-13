
/**
 * Module dependencies.
 */
var _ = require('underscore')
	, net = require ('net')
	, fs = require('fs')
	, sys = require('util')
	, exec    = require('child_process').exec
	, events = require('events');


/**
 * Expose `Watcher`.
 */
exports.Watcher = Watcher;

/**
 * Expose `Server`.
 */
exports.Server = Server;

/**
 * Expose `CssCompiler`.
 */
exports.CssCompiler = CssCompiler;


/**
 * `Watcher` class constructor.
 */
function Watcher () {
	this.watchingFiles = {};
}


function watchFile (file, callback) {
	fs.watchFile(file, { interval: 100, persistent: true }, function (curr, prev) {
		if(curr.mtime.getTime() != prev.mtime.getTime()){	
			fs.readFile(file, function (err, data) {
				if (data) { callback({file: file, content: data}); }
			});
		}
	});
}

Watcher.prototype.watch = function (path, callback) {
	var self = this;
	
	_.each(getJssFiles(path), function (file) {
		if (!self.watchingFiles[file]) {
			self.watchingFiles[file] = true;
			watchFile(file, callback);
		}
	});
}

function Server () {
	var self = this;

	this.subscribers = { iphone: [], android: []};
	this._server = net.createServer(onNewClient);
	
	events.EventEmitter.call(this);
	
	function dispatch (stream, data) {
		switch (data.action) {
			case 'register':
			if (self.subscribers.hasOwnProperty(data.platform)) {
				sys.puts('registered client ' + stream.remoteAddress + ' as ' + data.platform + ' device');
				
				stream.platform = data.platform;
				self.subscribers[data.platform].push(stream);
				
				self.emit('register', stream);
			}
			break;
		}
	}
	
	function onNewClient (stream) {
		stream.setTimeout(0);
		stream.setEncoding('utf8');

		stream.on('connect', function () {
			console.log('New subscriber: ' + stream.remoteAddress)
		});
		
		stream.on('data', function (data) {
			dispatch(stream, JSON.parse(data));
		});

		stream.on('end', function () {
			self.subscribers[stream.platform] = _.without(self.subscribers[stream.platform], stream);
			sys.puts('Client ' + stream.remoteAddress + ' left');
			stream.end();
		});
	};
}

/**
 * Inherits `Server` from `EventEmitter`
 */
sys.inherits(Server, events.EventEmitter);


Server.prototype.listen = function (port) {
	this._server.listen(port);
	console.log("\nListening on port " + port + "\n");
}

Server.prototype.send = function (stream, message) {
	sys.puts(' > Sending data to ' + stream.platform + ' ('+stream.remoteAddress+')');
	stream.write(JSON.stringify(message) + 'eof');
}

Server.prototype.broadcast = function (message, platform) {
	var self = this;
	
	_.each(self.subscribers[platform], function (stream) {
		self.send(stream, message);
	});
}


function CssCompiler (projectPath) {
	this._executable = __dirname + '/../vendor/titanium/compiler.py';
	this.projectPath = projectPath;
}

CssCompiler.prototype.compile = function (platform, callback) {
	var start_time = new Date().getTime();
	sys.puts('Compiling jss for '+platform+'...');
	
	function cleanOutput (out) {
		var lines = out.split("\n");
		return lines[lines.length - 2];
	}
	
	sys.puts('[DEBUG] ' + [this._executable, this.projectPath, platform].join(' '));
	
	var proc = exec([this._executable, this.projectPath, platform].join(' '), function (err, out, err) {
		try {
			var data = JSON.parse(cleanOutput(out));
			sys.puts(platform+" jss compiled in " +  ( ((new Date().getTime()) - start_time )/1000) +" seconds");
			
			callback(data);
		} catch (ex) {
			console.log("Could not compile jss for %s : %s", platform, sys.inspect(ex));
		}
	});
}

CssCompiler.prototype.compileAsync = function (platform, callback) {
	var self = this;
	setTimeout(function () { self.compile(platform, callback) }, 0);
}


var JSS_EXTENSIONS = /\.(jss|jssi)$/;

function getJssFiles (path) {
	var readdir = function (dir, arr) {
		arr = arr || [];
		fs.readdirSync(dir).forEach(function (file) {
			var f = dir + '/' + file;
			fs.statSync(f).isDirectory() ? readdir(f, arr) : JSS_EXTENSIONS.test(f) && arr.push(f);
		});
		return arr;
	}
	return readdir(path);
}