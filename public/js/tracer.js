console.log("Testing!");
let agent = navigator.userAgent;
var socket = io();
var id;

users = {}

socket.on("userUpdate", (u) => {
  users=u
})

socket.on("newUserEvent", (n) => {
  console.log("New User Conneted!");
})

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  if (pmouseX !== mouseX || pmouseY !== mouseY) {
    socket.emit('mouseUpdate', {
      userAgent: agent,
      x: mouseX,
      y: mouseY,
    })
  }
  background(230);

  for (let u in users) {
    stroke(120);
    text(users[u].screenName, users[u].x, users[u].y);
    if(u == 'SERVER') {
      continue
    }

    stroke(180);
    if(users[u].deviceType == 'smartphone') {
      drawingContext.setLineDash([5, 15]);
    } else {
      drawingContext.setLineDash([]);
    }
    line(users['SERVER'].x, users['SERVER'].y, users[u].x, users[u].y)
  }

}
