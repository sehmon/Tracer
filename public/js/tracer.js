console.log("Testing!");
let agent = navigator.userAgent;
var socket = io();
var id;

users = {}

socket.on("userUpdate", (u) => {
  users=u
})

function setup() {
  createCanvas(windowWidth, windowWidth);
}

function draw() {
  if (pmouseX !== mouseX || pmouseY !== mouseY) {
    socket.emit('mouseUpdate', {
      userAgent: agent,
      x: mouseX,
      y: mouseY,
    })
  }
  background(255, 255, 255);

  for (let u in users) {
    text(users[u].screenName, users[u].x, users[u].y);
    if(u == 'SERVER') {
      continue
    }

    if(users[u].deviceType == 'smartphone') {
      drawingContext.setLineDash([5, 15]);
    } else {
      drawingContext.setLineDash([]);
    }
    line(users['SERVER'].x, users['SERVER'].y, users[u].x, users[u].y)
  }

}
