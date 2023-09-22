const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const DeviceDetector = require('node-device-detector');

const UserManager = require('./managers/UserManager');
const NetworkGraphManager = require('./managers/NetworkGraphManager');
const getHostIPAddress = require('./utils/getHostIPAddress');
const getIPLocation = require('./utils/getIPLocation');

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

const PORT = process.env.PORT || 3000;


// Set the server's IP Address
getHostIPAddress()
  .then(ipAddress => {
    userManager.updateUser('SERVER', { screenName: `New York City - ${ipAddress}`});
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

  // send id back to user
  socket.emit('yourID', id);

  try {
    const path = await networkGraphManager.traceIPRoute(userManager.getUser(id));
    userManager.updateUser(id, { path: path });
  } catch (error) {
    console.error("Error during traceroute:", error);
  }

  try {
    const { city, country, query } = await getIPLocation(userIP);
    const screenName=`${city}, ${country} - ${query}`;
    userManager.updateUser(id, { screenName: screenName });
  } catch (error) {
    console.error("Error during IP Geolocation:", error);
  }

  // On connection, try to get device user agent (for linetype)
  socket.emit('getUserAgent');

  // Receive the UserAgent and store it in the User Database
  socket.on('setUserAgent', (agent) => {
    const deviceType = detector.detect(agent).device.type;
    userManager.setDeviceType(id, deviceType);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    userManager.removeUser(id);
  });

  // When receiveing a Mouse Update from a device, update position and broadcast to the rest of connected users
  socket.on('mouseUpdate', (mouseData) => {
    const { x, y, screenWidth, screenHeight } = mouseData
    userManager.updateUser(id, { x, y, screenWidth, screenHeight });

    io.emit("userUpdate", { 'users': userManager.users, 'count': userManager.userCount } );
    io.emit("serverGraphUpdate", networkGraphManager.networkGraph);
  })
});

server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
});



