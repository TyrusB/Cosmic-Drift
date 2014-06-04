$(function() {
  var host = location.origin.replace(/^http/, 'ws')
  var socket = io(host);
  var connection = new Connection(socket);
  window.openConnection = connection;
});
