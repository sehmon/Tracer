// Initialization
let agent = navigator.userAgent;
var socket = io();
var id;

users = {}

// Socket.io Events

socket.on("userUpdate", (u) => {
  users=u
})

socket.on("newUserEvent", (n) => {
  console.log("New User Conneted!");
})

socket.on("getUserAgent", () => {
  socket.emit('setUserAgent', agent);
});

// p5.js Setup and Draw
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  if (pmouseX !== mouseX || pmouseY !== mouseY) {
    socket.emit('mouseUpdate', {
      x: mouseX,
      y: mouseY,
    })
  }
  background(230);

  // Draw text based on Users array
  for (let u in users) {
    stroke(120);
    text(users[u].screenName, users[u].x, users[u].y);
    if(u == 'SERVER') {
      continue
    }

    // Draw lines between users and server
    stroke(180);
    if(users[u].deviceType == 'smartphone') {
      drawingContext.setLineDash([5, 15]);
    } else {
      drawingContext.setLineDash([]);
    }
    line(users['SERVER'].x, users['SERVER'].y, users[u].x, users[u].y)
  }
}
