// Initialization
let agent = navigator.userAgent;
var socket = io();
var id;

users = {}
user_count = 0
server_graph = {}

// Socket.io Events

socket.on("userUpdate", (u) => {
  users=u.users;
  user_count = u.count;
  console.log(user_count);
})

socket.on("newUserEvent", (n) => {
  console.log("New User Conneted!");
})

socket.on("getUserAgent", () => {
  socket.emit('setUserAgent', agent);
});

socket.on("serverGraphUpdate", (s) => {
  server_graph=s;
})

// p5.js Setup and Draw
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function drawUI() {
  noStroke();
  fill(0);
  let count_string = user_count == 1 ? 
    `${user_count} current user` :
    `${user_count} current users`;
  text(count_string, 20, 20);
}

function draw() {
  if (pmouseX !== mouseX || pmouseY !== mouseY) {
    socket.emit('mouseUpdate', {
      x: mouseX,
      y: mouseY,
      screenWidth: windowWidth,
      screenHeight: windowHeight,
    })
  }
  background(230);

  drawUI();

  for (let u in users) {
    // If the server, just draw in the middle of the screen
    // proceed to the rest of the nodes in the user graph
    fill(0);
    if(u == 'SERVER') {
      noStroke();
      text(users[u].screenName, windowWidth/2, windowHeight/2);
      continue
    }

    // Calculate the user's screen positional ratio to place them correctly on
    // the screen. This may not work as intended but worth a try.
    userXRatio = users[u].x / users[u].screenWidth;
    userYRatio = users[u].y / users[u].screenHeight;
    x_pos = userXRatio * windowWidth;
    y_pos = userYRatio * windowHeight;

    // Draw each user and list their IP path below their name
    noStroke();
    text(users[u].screenName, x_pos, y_pos);
    for(let i=0; i<users[u].path.length; i++){
      fill(140);
      text(users[u].path[i], x_pos + 10, y_pos + ((i+1)*12))
    }

    // Draw lines between users and server
    stroke(180);
    if(users[u].deviceType == 'smartphone') {
      drawingContext.setLineDash([5, 15]);
    } else {
      drawingContext.setLineDash([]);
    }
    line(windowWidth/2, windowHeight/2, x_pos, y_pos)
  }
}
