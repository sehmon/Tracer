console.log("Testing!");
var socket = io();
var id;

users = {}

socket.on("userUpdate", (u) => {
  console.log(users);
  users=u
})

function setup() {
  createCanvas(windowWidth, windowWidth);
}

function draw() {
  if (pmouseX !== mouseX || pmouseY !== mouseY) {
    socket.emit('mouseUpdate', {
      name: id,
      x: mouseX,
      y: mouseY,
    })
  }
  background(255, 255, 255);

  for (let u in users) {
    text(u, users[u].x, users[u].y);
  }

}