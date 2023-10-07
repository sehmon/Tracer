const GraphNode = require('./GraphNode');
const getIPLocation = require('../utils/getIPLocation');

class NetworkGraph {
  root = null;
  nodeGraph = {}
  userNodeMap = {};

  constructor(root) {
    if(root) {
      this.nodeGraph[this.root.ip] = root;
    }
  }

  addNode(node) {
    // If the node already exists in the graph, just merge it's info
    // in this case, it'd just be merging the children array
    if(node.ip in this.nodeGraph){ 
      let child_list = this.nodeGraph[node.ip].children
      child_list.concat(node.children) // Should only be a single child
      this.nodeGraph[node.ip].children = [...new Set(child_list)]
    } else {
      this.nodeGraph[node.ip] = node;
    }

  }

  addIntermediateNode(a, b, new_node) {
    // Graph struture should look like:
    // a --> new_node --> b
    // and should remove b as a direct child of a
    a.addChild(new_node);
    a.removeChild(b);
    new_node.addChild(b);
    this.addNode(new_node);
  }

  // Adds a userIP-> nodeIP pair to the userNodeMap
  // This will keep state of all nodes and the corresponding
  // server IDs that are connected.
  //
  // With this information, we should be able to decode what
  // intermediate nodes should be drawn on the frontend, and
  // what servers connect two users together.
  //
  // Only geo-locate if an entry in the userNodeMap has more
  // than one child.
  async addNodeUserPair(serverID, nodeIP) {
    if(nodeIP in this.userNodeMap) {
      this.userNodeMap[nodeIP].connectedUsers.push(serverID);
      if(!this.userNodeMap[nodeIP].hasOwnProperty('regionInfo')) {
        const regionInfo = await getIPLocation(nodeIP);
        this.userNodeMap[nodeIP] = { ...this.userNodeMap[nodeIP], ...regionInfo }
      }
    } else {
      const nodeMapEntry = { connectedUsers: [serverID] }
      this.userNodeMap[nodeIP] = nodeMapEntry;
    }
  }


  // When a user disconnects, clean their paths from the network graph
  removeUserFromNetworkGraph(user) {
    // TODO:
    console.log("Faking removing the user from the Network Graph");
  }

  // Takes a user, and iterates through their path to clean
  // the server IDs from the userNodeMap
  removeNodeUserPairs(user) {
    for(let i=0; i<user.path.length; i++) {
      let { ip } = user.path[i];
      if(this.userNodeMap[ip].connectedUsers.length == 1) {
        delete this.userNodeMap[ip];
      } else {
        const index = this.userNodeMap[ip].connectedUsers.indexOf(user.userID);
        const removedUser = this.userNodeMap[ip].connectedUsers.splice(index, 1);
      }
    }
  }

  printUserNodeMap() {
    console.log(this.userNodeMap);
  }
}

module.exports = NetworkGraph;
