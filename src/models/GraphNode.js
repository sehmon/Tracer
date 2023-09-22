/**
 * Represents a GraphNode in a network.
 * @class
 */
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
    this.children.indexOf() == -1 ? this.children.push(n.ip) : console.log(`Node with IP ${n.ip} already child of parent ${this.ip}`);
  }

  removeChild(n) {
    this.children.splice(this.children.indexOf(n.ip), 1)
  }
}

module.exports = GraphNode;
