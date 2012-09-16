
// TODO : remove dependancy, include functions
var _ = require('lib/underscore');


/*
 * Expose `Watcher`
 */

exports.Watcher = Watcher;


var JSS_PROPERTIES = [
		// 'backgroundColor', 'backgroundDisableColor', 'borderColor', 'backgroundDisabledImage', 'backgroundFocusedColor',
		// 'backgroundFocusedImage', 'backgroundImage', 'backgroundLeftCap', 'backgroundPaddingBottom', 'backgroundPaddingLeft', 
		// 'backgroundPaddingRight', 'backgroundPaddingTop', 'backgroundRepeat', 'backgroundSelectedColor', 'backgroundSelectedImage', 
		// 'backgroundTopCap', 'borderColor', 'borderWidth', 'borderRadius', 'bottom', 'color', 'font', 'height', 'highlightedColor', 
		// 'left', 'minimumFontSize', 'opacity', 'right', 'shadowColor', 'shadowOffset', 'textAlign', 'top', 
		// 'verticalAlign', 'wordWrap', 'zIndex'
		'backgroundColor', 'borderColor', 'borderWidth', 'color', 'font', 'layout', 'top', 'bottom', 'left', 'right', 'height', 'width',
		'text', 'opacity', 'z-index'
	];

// Default style dictionnary for properties that doesn't consider undefined to reset the value.
var RESET_STYLE = {
	backgroundColor: 'transparent',
	borderColor: 'transparent',
	borderWidth: 0,
	font: {},
};


var TiObject = (function () {
	
	function handleLayout (object, callback) {
		try {
			if (!isAndroid()) {
				object.startLayout();
				callback();
				object.finishLayout();
			} else {
				callback();
			}
		} catch (ex) {
			Ti.API.error(ex);
		}
	}
	
	var tableUtil = {
		
		sections: function (table, fn) {
			_.each(table.data || [], fn)
		},

		rows: function (section, fn) {
			_.each(section.rows || [], fn);
		}
	};
	
	
	return {

		getResetStyle: function () {
			var self = this
				, style = {};
			_.each(JSS_PROPERTIES, function (property) {
				// Do not reset a property that is already reseted to avoid the reset of default Titanium layout.
				if (hasOwnProperty(self, property) && self[property] !== RESET_STYLE[property] && self[property] !== undefined) {
					style[property] = RESET_STYLE[property] ? RESET_STYLE[property] : 'RESET';
				}
			});
			return style;
		},

		getViewHierarchy: function () {
			var children = []
				, type = this.toString();

			// Handle TableView
			if (this.data) {
				tableUtil.sections(this, function (section) {
					children.push(section);
					tableUtil.rows(section, function (row) {
						children.push(row);
					});
				});

			// Handle Navigation group.
			} else if (type === '[object TiUIiPhoneNavigationGroup]') {
				children = [this.window];

			// Handle other components which are accessible with .getChildren().
			} else {
				// On Android, window children are accessible with win._children and win.children on IOS
				if (isAndroid() && type === '[object TiBaseWindow]') {
					children = this._children;
				} else {
					children = this.children;
				}
			}
			return _.compact(children);
		},

		update: function (style) {
			var self = this;
			
			handleLayout(this, function () {
				Ti.API.log('--------------------' + self.toString() + '--------------------');
				for (key in style) {
					if (hasOwnProperty(self, key) && _.include(JSS_PROPERTIES, key)) {
						if (self.frozenCss && _.include(self.frozenCss, key)) {
							Ti.API.log('[frozen] ' + key + ': ' + self[key]); // Do not update frozen property
						} else if (style[key] === 'RESET') {
							Ti.API.log('[reset]  ' + key + ': ' + self[key]);
							self[key] = RESET_STYLE[key]; // set default style value or undefined if not exists
						} else if (self[key] !== style[key]) {
							Ti.API.log('[update] ' + key + ': ' + self[key] + ' to ' + style[key]);
							self[key] = style[key];
						}
					} else {
						Ti.API.log('[warning]  property ' + key + ' not supported');
					}
				}
				Ti.API.log('-------------------------------------------------------\n');
			});
		}
		
	};
}());


function TiCollection () {
	this.data   = [];
	this.styles = {};
	this.baseStyles = {};
}

// Freeze properties that was defined into javascript file
// We can detect these properties by iterate over each ti object and test if their styles correspond to the
// styles received on initialization.
TiCollection.prototype.freezeJsCss = function () {
	var self = this;
	Ti.API.log(this.baseStyles);
	this.styles = _.clone(this.baseStyles);
	Ti.API.log(this.baseStyles);
	
	_.each(this.data, function (object) {
		object.frozenCss = [];
		
		_.each(self.getStyle(object), function (value, property) {
			if (!hasOwnProperty(object, property)) { return; }
			
			var objectValue = object[property];
			if (objectValue !== value && objectValue !== undefined) {
				object.frozenCss.push(property);
				Ti.API.log('freeze : '+object+'.'+property);
			}
		});
		
		Ti.API.log(object.frozenCss.length);
	});
	
	// WTF !!!!!!!!!!!!!!!!!!!
	_.each(this.data, function (obj) {
		Ti.API.log(obj.frozenCss.length);
	})
	
	return this;
} 

TiCollection.prototype.sync = function (windows) {
	var i = 0
		, self = this;
	
	this.data = _.clone(windows);
	
	// TODO : improve algorythme performance by implementing a memoizer on find children method
	for (i=0; i<this.data.length; i++) {
		this.data = _.union(this.data, TiObject.getViewHierarchy.apply(this.data[i]));
	}
	
	Ti.API.log(this.baseStyles);
	
	return this;
}

TiCollection.prototype.refreshAll = function (css) {
	var self = this;
	this.styles = css;
	
	_.each(this.data, function (object) {
		self.refresh(object);
	});
	
	return this;
}

TiCollection.prototype.refresh = function (object) {
	var style = {};
	
	// reset object which have a className of an id. 
	if (object.id || object.className || object.classNames) {
		style = TiObject.getResetStyle.apply(object);
	}

	_.extend(style, this.getStyle(object));
	TiObject.update.apply(object, [style]);
}

TiCollection.prototype.getStyle = function (object) {
	var classNames = object.classNames || []
		, id = object.id
		, css = {}
		, self = this
		, selectorStyle;
	
	if (object.className) { classNames.push(object.className); }

	// compute classes styles
	_.each(classNames, function (className) {
		selectorStyle = self.styles.classes[className] || {};
		extendCss(css, selectorStyle);
	});

	// compute id styles
	selectorStyle = this.styles.ids[id] || {};
	if (id) {
		extendCss(css, selectorStyle);
	}
	
	return css;
}


/**
 * Connection class for Titanium connection from TCP socket.
 * It provide useful api to register event on data receiving.
 */
function Connection () {
	
	var that = this;
	
	var _events         = {}
		, _socket         = null
		, _buffer         = ""
		, MAX_CHUNK_SIZE  = 1024; 

	/**
	 * Dispatch the action contained in the buffer and trigger the right connection event 
	 * This function is called each time the socket receive data from server (after pumping the buffer)
	 */
	function dispatchEventSocket (data) {
		var event = {};
		try {
			event = JSON.parse(data);
			that.fire(event.action, event);
		}
		catch (ex) { 
			Ti.API.error('Could not parse data : ' + ex);
		}
	}
	
	function pumpCallback (e) {
		// Is server ended connection ?
		if (e.bytesProcessed === -1) {
			e.source.close();
			return;
		}
		
		_buffer = _buffer + Ti.Codec.decodeString({ source: e.buffer, length: e.bytesProcessed });
		
		// Detect eof and dispatch to handler
		if (_buffer.slice(-3) === 'eof') {
			dispatchEventSocket(_buffer.slice(0, _buffer.length - 3));
			_buffer = "";
		}
	}
	
	this.send = function (action, data, callback) {
		var buf = Ti.createBuffer({
			value: JSON.stringify(_.extend(data, {action: action}))
		});
		
		Ti.Stream.write(_socket, buf, callback);
	}
	
	/**
	 * Fire a registered event
	 * @param [String] eventName  the registered event name to fire
	 * @param [Object] event  parameters to pass to the callback listener
	 */
	this.fire = function (eventName, event) {
		if (_.isFunction(_events[eventName])) {
			_events[eventName](event);
		}
	}
	
	/**
	 * Register a function to call when socket receive data to dispatch for event name registered
	 * @param [String] eventName  The event name to listen
	 * @param [Function] callback  The function that will be called when connection will trigger the event
	 */
	this.on = function (eventName, callback) {
		if (_.isFunction(callback)) {
			_events[eventName] = callback;
		}
	}
	
	/**
	 * Bind the connection with host and port
	 * @param [String] host
	 * @param [Integer] port
	 * @return The object itself
	 */
	this.bind = function (host, port) {
		_socket = Ti.Network.Socket.createTCP({
			host: host,
			port: port,
			
			connected : function (e) {
				Ti.API.info('Livemium client successfully connected.');
				that.send('register', { platform: Ti.Platform.osname }, function () {});
				
				Ti.Stream.pump(e.socket, pumpCallback, MAX_CHUNK_SIZE, true);
			},
			
			error : function (e) {
				Ti.API.error('Livemium socket error (' + e.errorCode + '): ' + e.error);
				// TODO : handle socket timeout and reconnect to server
			},
			
			close: function (e) {
				Ti.API.log('Livemium connection ended');
			}
		});
		
		return that;
	}
	
	/**
	 * Connect the socket to the configured remote. @see bind()
	 */
	this.connect = function () {
		Ti.API.info('Connecting to livemium server @'+_socket.host+':'+_socket.port+' ...');
		_socket.connect();
	}
	
	/**
	 * End socket
	 */
	this.close = function () {
		_socket.close();
	}
}


var watching = false;

/**
 * Watcher factory. It can watch for files changes throught a node.js server
 * @param host Host for server
 * @param port Port for server. Default is 8128
 */
function Watcher (host, port) {
	
	if (Ti.version < 2.1) {
		Ti.API.error("Livemium require Titanium 2.1 or later. Using version " + Ti.version);
	}
	
	this._connection  = new Connection();
	this._collection = new TiCollection();
	this._registeredWindows = [];
	this._callbackWindow = null;

	/**
	 * Start watching for file changes to be piped from nodejs server
	 * @param [String] host  remote host
	 * @param [Number] port  remote port number
	 */
	this.watch = function (host, port) {
		var self = this;
		
		// Avoid duplicating of watcher
		if (watching) {
			return false;
		} else {
			watching = true;
		}
		
		this._connection.on('jss:initialize', function (e) {
			self._collection.baseStyles = e.data.css;
			Ti.API.log(self._collection.baseStyles);
		});
		
		this._connection.on('jss:refresh', function (e) {
			self._collection
				.sync(_.isFunction(self._callbackWindow) ? [self._callbackWindow()] : self._registeredWindows)
				.freezeJsCss()
				.refreshAll(e.data.css);
		});
		
		this._connection.bind(host, port).connect();
	}
	
	this.register = function (win) {
		// TODO : test type of the callback returned value that should be a Ti Window
		if (_.isFunction(win)) {
			this._callbackWindow = win;
		} else {
			this._registeredWindows.push(win);
		}
	}
}


function isAndroid() {
	return Ti.Platform.osname === 'android';
}

function hasOwnProperty (object, key) {
	return object['set' + key.charAt(0).toUpperCase() + key.slice(1)] !== undefined;
}

function extendCss (destination, source) {
	destination.font = destination.font || {};
	_.extend(destination.font, source.font);
	_.extend(destination, source);
}
