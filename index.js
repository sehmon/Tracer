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

// Initialize list of users
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

  // Initialize individual user's info
  var id = "server-id" + Math.random().toString(16).slice(2)
  var screenName = "default_screenname";
  var deviceType = "desktop";
  var ip = socket.conn.remoteAddress.split(":")[3];

  const { spawn } = require('child_process');
  const child = spawn('traceroute', [ip]);

  // use child.stdout.setEncoding('utf8'); if you want text chunks
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
  // data from standard output is here as buffers
    console.log(chunk.toString());
    console.log("New Buffer Chunk");
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  // Grab location information from IP Address
  fetch(`http://ip-api.com/json/${ip}`)
    .then((response) => response.json())
    .then((data) => screenName=`${data.city}, ${data.region} - ${data.query}`);
  users[id] = { x: 0, y: 0 , name: screenName, deviceType: deviceType};

  // On connection, try to get device user agent (for linetype)
  socket.emit('getUserAgent');

  // Receive the UserAgent and store it in the User Database
  socket.on('setUserAgent', (agent) => {
    const result = detector.detect(agent);
    deviceType = result.device.type;
    users[id].deviceType = deviceType
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete users[id];
    console.log(`${id} deleted`)
  });

  // When receiveing a Mouse Update from a device, update position and broadcast to the rest of connected users
  socket.on('mouseUpdate', (mouseData) => {
    users[id] = { x: mouseData.x, y: mouseData.y , screenName: screenName, deviceType: deviceType}
    io.emit("userUpdate", users);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
