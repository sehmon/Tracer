// Start Express server
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Start socket.io server
const { Server } = require("socket.io");
const io = new Server(server);

// Device detector (for linetypes
const DeviceDetector = require('node-device-detector');
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

// Local imports
const GraphNode = require('./GraphNode');
const NetworkGraph = require('./NetworkGraph');
const { getHostIPAddress } = require('./utils');

app.use(express.static('public'));

// Initialize list of users (for socket.io)
let users = {};
users['SERVER'] = {
  x: 200, y: 200, screenName: "Toronto, CA - 159.223.132.92",
}

// Set up Network Graph and add server as root
let server_graph = new NetworkGraph();
getHostIPAddress().then(ipAddress => { // Get Server's IPAddress
  users['SERVER'].screenName = `New York City - ${ipAddress}`;
  server_graph.root = new GraphNode("Server", ipAddress, 'root-server-node');
}).catch(error => {
  console.error(`Failed to get Server IP address: ${error.message}`);
});


// Server Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/test-graph', (req, res) => {
  res.send(server_graph);
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Initialize individual user's info
  var id = "server-id" + Math.random().toString(16).slice(2)
  var screenName = "new_user";
  var deviceType = "desktop";
  var ip = socket.conn.remoteAddress.split(":")[3];
  var path = [];

  // Create graph node for the new user
  let user_node = new GraphNode(screenName, ip, deviceType);
  let prev = server_graph.root;
  server_graph.addNode(user_node);
  prev.addChild(user_node);

  // Iterate through traceroute command
  const { spawn } = require('child_process');
  const child = spawn('traceroute', ['-q 1', ip]);
  // Following regex gets each servername/ip pair from the traceroute output
  const regex = /(\S+)\s+\((\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)\)|(\*)/g;


  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    for (const match of chunk.toString().matchAll(regex)) {
      if (match[3]) { // If the third capture group (asterisk) is matched
        // console.log(`Asterisk: ${match[3]}`);
      } else {
        const serverName = match[1];
        const ipAddress = match[2];

        if(ipAddress == user_node.ip){
          continue;
        }

        let n = new GraphNode(serverName, ipAddress, 'intermediate-node');
        server_graph.addIntermediateNode(prev, user_node, n);
        prev = n;

        path.push(`${serverName} (${ipAddress})`);
      }
    }
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  // Grab location information from IP Address
  fetch(`http://ip-api.com/json/${ip}`)
    .then((response) => response.json())
    .then((data) => screenName=`${data.city}, ${data.region} - ${data.query}`);
  users[id] = { x: 0, y: 0 , name: screenName, deviceType: deviceType, path: path};

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
    users[id] = { x: mouseData.x, y: mouseData.y , screenName: screenName, deviceType: deviceType, path: path}
    io.emit("userUpdate", users);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});



