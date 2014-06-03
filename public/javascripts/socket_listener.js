$(function() {
  var socket = io('http://localhost:8080');
  var connection = new Connection(socket);
  window.openConnection = connection;
  
});
