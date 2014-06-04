var static = require('node-static');
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var file = new static.Server('./public');

var server = http.createServer(function (request, response) {
  request.addListener('end', function() {
    file.serve(request, response, function(e, res) {
      if (e && (e.status === 404)) {
        file.serveFile('/not-found.html', 404, {}, request, response);
      }
    });
  }).resume();
}).listen(process.env.PORT || 8080);

require('./lib/socket_server').createConnection(server);

console.log("server running at localhost:8080");
