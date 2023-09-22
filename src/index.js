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
const networkGraphManager = new NetworkGraphManager();


// Set up Network Graph and add server as root
getHostIPAddress()
  .then(ipAddress => {
    // This is bad, create a function
    userManager.users['SERVER'].screenName = `New York City - ${ipAddress}`; 
    networkGraphManager.initializeServerGraph(ipAddress);})
  .catch(error => {console.error(`Failed to get Server IP address: ${error.message}`)});

// Server Routes
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});
app.get('/visualize', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/graph.html'));
});

app.get('/test-graph', (req, res) => { res.send(networkGraphManager.networkGraph)});

io.on('connection', async (socket) => {
  // Initialize individual user's info
  const id = userManager.addUser();
  const userIP = userManager.setIP(id, socket);

  let screenName, deviceType;
  let path = [];

  // send id back to user
  socket.emit('yourID', id);

  path = await networkGraphManager.traceIPRoute(userManager.getUser(id));

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
    userManager.setDeviceType(id, deviceType);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    userManager.removeUser(id);
  });

  // When receiveing a Mouse Update from a device, update position and broadcast to the rest of connected users
  socket.on('mouseUpdate', (mouseData) => {
    userManager.updateUser(id, 
      { x: mouseData.x, y: mouseData.y, screenWidth: mouseData.screenWidth, screenHeight: mouseData.screenHeight, screenName: screenName, deviceType: deviceType, path: path}
    );
    io.emit("userUpdate", { 'users': userManager.users, 'count': userManager.userCount } );
    io.emit("serverGraphUpdate", networkGraphManager.networkGraph);
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});



