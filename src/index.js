const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const DeviceDetector = require('node-device-detector');

const GraphNode = require('./models/GraphNode');
const NetworkGraph = require('./models/NetworkGraph');
const getHostIPAddress = require('./utils/getHostIPAddress');
const UserManager = require('./managers/UserManager');
const NetworkGraphManager = require('./managers/NetworkGraphManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});
const userManager = new UserManager();


// Set up Network Graph and add server as root
let server_graph = new NetworkGraph();
getHostIPAddress()
  .then(ipAddress => {
    // This is bad, create a function
    userManager.users['SERVER'].screenName = `New York City - ${ipAddress}`; 
    server_graph.root = new GraphNode("Server", ipAddress, 'root-server-node')})
  .catch(error => {console.error(`Failed to get Server IP address: ${error.message}`)});

// Server Routes
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});
app.get('/visualize', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/graph.html'));
});

app.get('/test-graph', (req, res) => { res.send(server_graph)});

io.on('connection', async (socket) => {
  // Initialize individual user's info
  const id = userManager.addUser();
  const userIP = userManager.setIP(id, socket);

  let screenName, deviceType;
  let path = [];

  // send id back to user
  socket.emit('yourID', id);

  // Create graph node for the new user
  let user_node = new GraphNode(screenName, userIP, deviceType);
  let prev = server_graph.root;
  server_graph.addNode(user_node);
  prev.addChild(user_node);

  // Iterate through traceroute command
  const { spawn } = require('child_process');
  const child = spawn('traceroute', ['-q 1', userIP]);
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
  fetch(`http://ip-api.com/json/${userIP}`)
    .then((response) => response.json())
    .then((data) => screenName=`${data.city}, ${data.region} - ${data.query}`);
  userManager.updateUser(id, 
    { x: 0, y: 0 , name: screenName, deviceType: deviceType, path: path}
  );

  // On connection, try to get device user agent (for linetype)
  socket.emit('getUserAgent');

  // Receive the UserAgent and store it in the User Database
  socket.on('setUserAgent', (agent) => {
    const result = detector.detect(agent);
    deviceType = result.device.type;
    console.log(deviceType);
    userManager.setDeviceType(id, deviceType);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    userManager.removeUser(id);
    console.log(`${id} deleted`)
  });

  // When receiveing a Mouse Update from a device, update position and broadcast to the rest of connected users
  socket.on('mouseUpdate', (mouseData) => {
    userManager.updateUser(id, 
      { x: mouseData.x, y: mouseData.y, screenWidth: mouseData.screenWidth, screenHeight: mouseData.screenHeight, screenName: screenName, deviceType: deviceType, path: path}
    );
    io.emit("userUpdate", { 'users': userManager.users, 'count': userManager.userCount } );
    io.emit("serverGraphUpdate", server_graph);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});



