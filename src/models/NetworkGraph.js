const GraphNode = require('./GraphNode');

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
      // console.log(`${node.ip} already in graph!`);
      let child_list = this.nodeGraph[node.ip].children
      child_list.concat(node.children) // Should only be a single child
      this.nodeGraph[node.ip].children = [...new Set(child_list)]
    } else {
      // console.log(`Adding ${node.ip} to graph`);
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
  addNodeUserPair(serverID, nodeIP) {
    // console.log(`Adding pair ${serverID}-${nodeIP} to userNodeMap`);
    if(nodeIP in this.userNodeMap) {
      // console.log("Node already exists, adding to list");
      this.userNodeMap[nodeIP].push(serverID);
    } else {
      // console.log("New Node, creating list and adding user ID");
      this.userNodeMap[nodeIP] = [serverID];
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
    console.log(user);
    for(let i=0; i<user.path.length; i++) {
      let { ip } = user.path[i];
      console.log(`Removing ${user.userID} from NodeMapIP: ${ip}`);
      if(this.userNodeMap[ip].length == 1) {
        delete this.userNodeMap[ip];
      } else {
        const index = this.userNodeMap[ip].indexOf(user.userID);
        const removedUser = this.userNodeMap[ip].splice(index, 1);
      }
    }
  }

  printUserNodeMap() {
    console.log(this.userNodeMap);
  }
}

module.exports = NetworkGraph;
