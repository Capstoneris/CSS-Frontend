const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
var user_counter = 0;

app.get('/', (req, res) => {
  res.send('<h1>Test Socket.io Server</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  user_counter++;
  console.log('user_counter=' + user_counter);
  socket.on('disconnect', () => {
    console.log('user disconnected');
    user_counter--;
    console.log('user_counter=' + user_counter);
  });
  socket.on('my message', (msg) => {
    console.log('message: ' + msg);
    // Emit from server side as broadcast to all connected users.
    io.emit('broadcast', `server: ${msg}`);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
