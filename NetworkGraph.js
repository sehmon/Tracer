const GraphNode = require('./GraphNode');

class NetworkGraph {
  root = null;
  node_graph = {}

  constructor(root) {
    if(root) {
      this.node_graph[this.root.ip] = root;
    }
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

module.exports = NetworkGraph;
