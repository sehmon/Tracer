// Required imports
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

// Graph Node class definitions
class GraphNode {
  id = "server-id" + Math.random().toString(16).slice(2);
  name = "Default Name";
  ip = "0.0.0.0";
  type = "default-type";
  children = []; // List of IP Children this node is parent of

  constructor(name, ip, type){
    this.name = name;
    this.ip = ip;
    this.type = type;
  }

  addChild(n) {
    this.children.push(n.ip);
  }

  removeChild(n) {
    this.children.splice(this.children.indexOf(n.ip), 1)
  }
}

class NetworkGraph {
  root = new GraphNode("Root Node", "1.1.1.1", "type-root");
  node_graph = {}

  constructor() {
    this.node_graph[this.root.ip] = this.root;
  }

  addNode(node) {
    this.node_graph[node.ip] = node;
  }

  addIntermediateNode(a, b, new_node) {
    // TODO: Insert node between a and b, with a being the grandparent and
    // b being the child
    //
    // Graph struture should look like:
    // a --> new_node --> b
    // and should remove b as a direct child of a
    // console.log("Adding Intermediate Node");
    a.addChild(new_node);
    a.removeChild(b);
    new_node.addChild(b);
  }
}

// Initialize list of users
let users = {};
users['SERVER'] = {
  x: 200, y: 200, screenName: "Toronto, CA - 159.223.132.92",
}
let server_graph = new NetworkGraph();

app.use(express.static('public'));

// Server Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/test-graph', (req, res) => {
  res.send(server_graph);
});

app.get('/add-node', (req, res) => {
  let n = new GraphNode("New User", "4.4.4.4", "type-user");
  server_graph.addNode(n);
  res.send(server_graph);
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Initialize individual user's info
  var id = "server-id" + Math.random().toString(16).slice(2)
  var screenName = "default_screenname";
  var deviceType = "desktop";
  var ip = socket.conn.remoteAddress.split(":")[3];
  var path = [];

  // Create graph node for user
  let user_node = new GraphNode(screenName, ip, deviceType);
  let prev = server_graph.root;
  server_graph.addNode(user_node);
  prev.addChild(user_node);
  console.log(prev);

  // Iterate through traceroute command
  const { spawn } = require('child_process');
  const child = spawn('traceroute', [ip]);
  const regex = /(\S+)\s+\((\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)\)/g;

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
  // data from standard output is here as buffers
    for (const match of chunk.toString().matchAll(regex)) {
      const serverName = match[1];
      const ipAddress = match[2];
      // console.log(`Server Name: ${serverName}, IP Address: ${ipAddress}`);

      let n = new GraphNode(serverName, ipAddress, 'intermediate-node');
      server_graph.addNode(n);
      server_graph.addIntermediateNode(prev, user_node, n);
      prev = n;

      path.push(`Server Name: ${serverName}, IP Address: ${ipAddress}`);
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



