const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const DeviceDetector = require('node-device-detector');
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});


let users = {};
users['SERVER'] = {
  x: 200, y: 200, screenName: "Toronto, CA - 159.223.132.92",
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  var id = "server-id" + Math.random().toString(16).slice(2)
  var screenName = "default_screenname";
  var ip = socket.conn.remoteAddress.split(":")[3];
  fetch(`http://ip-api.com/json/${ip}`)
    .then((response) => response.json())
    .then((data) => screenName=`${data.city}, ${data.region} - ${data.query}`);
  users[id] = { x: 0, y: 0 , name: screenName};


  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete users[id];
    console.log(`${id} deleted`)
  });

  socket.on('mouseUpdate', (mouseData) => {
    const result = detector.detect(mouseData.userAgent);
    users[id] = { x: mouseData.x, y: mouseData.y , screenName: screenName, deviceType: result.device.type}
    io.emit("userUpdate", users);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
