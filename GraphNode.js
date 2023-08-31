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

module.exports = GraphNode;
