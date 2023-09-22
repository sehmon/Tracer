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
    // If the node already exists in the graph, just merge it's info
    // in this case, it'd just be merging the children array
    if(node.ip in this.node_graph){ 
      let child_list = this.node_graph[node.ip].children
      child_list.concat(node.children) // Should only be a single child
      this.node_graph[node.ip].children = [...new Set(child_list)]
    } else {
      this.node_graph[node.ip] = node;
    }

  }

  addIntermediateNode(a, b, new_node) {
    // TODO: Insert node between a and b, with a being the grandparent and
    // b being the child
    //
    // Graph struture should look like:
    // a --> new_node --> b
    // and should remove b as a direct child of a
    // console.log(`Adding node: ${new_node.name} between (A): ${a.name} and (B): ${b.name}`);
    a.addChild(new_node);
    a.removeChild(b);
    new_node.addChild(b);
    this.addNode(new_node);
  }
}

module.exports = NetworkGraph;
