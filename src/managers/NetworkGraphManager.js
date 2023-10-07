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

  traceIPRoute(user) {
    return new Promise((resolve, reject) => {
      // Create the new GraphNode and prep for the traceroute
      let userNode = new GraphNode(user.screenName, user.ip, user.deviceType);
      let path = [];
      let hop = 0;
      let prev = this.networkGraph.root;
      let { name, ip } = this.networkGraph.root;
      path.push({
        name,
        ip,
        hop,
      });
      this.networkGraph.addNode(userNode);
      this.networkGraph.addNodeUserPair(user.userID, ip);
      prev.addChild(userNode);

      const child = spawn('traceroute', ['-q', '1', user.ip]);

      child.stderr.on('data', (data) => {
        reject(new Error(`stderr: ${data}`));
      });

      // Following regex gets each servername/ip pair from the traceroute output
      const regex = /(\S+)\s+\((\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)\)|(\*)/g;

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        for (const match of chunk.toString().matchAll(regex)) {
          hop += 1;
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
            this.networkGraph.addNodeUserPair(user.userID, ipAddress);
            prev = n;

            path.push({
              name: serverName,
              ip: ipAddress,
              hop,
            });
          }
        }
      });

      child.on('close', (code) => {
        if (code == 0) {
          // this.networkGraph.printUserNodeMap();
          resolve(path)
        } else {
          reject(new Error(`child process exited with code ${code}`));
        }
      });
    });
  }

  cleanNetworkGraph(user) {
    this.networkGraph.removeUserFromNetworkGraph(user);
    this.networkGraph.removeNodeUserPairs(user);
    // this.networkGraph.printUserNodeMap();
  }
}

module.exports = NetworkGraphManager;
