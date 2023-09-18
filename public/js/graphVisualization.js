let display_graph = {}
let socket = io();

socket.on("serverGraphUpdate", (s) => {
  server_graph=s;
  for(let node in server_graph.node_graph) {
    if(node in display_graph) {
      continue;
    }
    x_pos = random(windowWidth);
    y_pos = random(windowHeight);

    display_graph[node] = {
      x: x_pos,
      y: y_pos,
      children: server_graph.node_graph[node].children,
    }
  }
})

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // draw nodes
  for(let node in display_graph) {
    ellipse(display_graph[node].x, display_graph[node].y, 40);
    text(node, display_graph[node].x, display_graph[node].y);
  }

  // draw edges
  for(let node in display_graph) {
    for(let child of display_graph[node].children) {
      if(display_graph[child]) {
        line(display_graph[node].x, display_graph[node].y, display_graph[child].x, display_graph[child].y);
      }
    }
  }
}
