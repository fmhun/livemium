var net = require('net');
var util = require('util');

var client = net.connect(1337, function() {
  console.log('client connected');
  var msg = {
		action: 'hello',
		platform: 'iphone'
	}
	client.write(JSON.stringify(msg));
});

client.on('data', function(data) {
  var jss =JSON.parse(data.toString());
	
	console.log(util.inspect(jss.data));
});

client.on('end', function() {
  console.log('client disconnected');
});