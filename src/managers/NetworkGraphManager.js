const NetworkGraph = require('../models/NetworkGraph');
const GraphNode = require('../models/GraphNode');
const { spawn } = require('child_process')

class NetworkGraphManager {
  constructor() {
    this.networkGraph = new NetworkGraph();
  }

  // You should be able to do this in the NetworkGraph class, not here
  initializeServerGraph(ipAddress) {
    this.networkGraph.root = new GraphNode("Server", ipAddress, 'root-server-node');
  }

  async traceIPRoute(user) {
    // Create the new GraphNode and prep for the traceroute
    let userNode = new GraphNode(user.screenName, user.ip, user.deviceType);
    let path = [];
    let prev = this.networkGraph.root;
    path.push(`${this.networkGraph.root.name} (${this.networkGraph.root.ip})`);
    this.networkGraph.addNode(userNode);
    prev.addChild(userNode);

    console.log("Starting traceroute");
    const child = spawn('traceroute', ['-q', '1', user.ip]);

    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

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

          if(ipAddress == userNode.ip){
            continue;
          }

          let n = new GraphNode(serverName, ipAddress, 'intermediate-node');
          this.networkGraph.addIntermediateNode(prev, userNode, n);
          prev = n;

          path.push(`${serverName} (${ipAddress})`);
        }
      }
    });

    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    return path;
  }
}

module.exports = NetworkGraphManager;
