// Initialize Server + Socket
let agent = navigator.userAgent;
var socket = io();
var id;

let users = {}
let user_count = 0
let server_graph = {}
let user_ip = null;

// ----------------------- Socket.io Events -----------------------
socket.on("userUpdate", (u) => {
  users=u.users;
  user_count = u.count;
})

// When a new user connects to the server
socket.on("newUserEvent", (n) => {
  console.log("New User Conneted!");
})

// Gets the device user agent to set the linetype
// (mobile --> dashed)
// (desktop --> solid)
socket.on("getUserAgent", () => {
  socket.emit('setUserAgent', agent);
});

// When a user's position is updated, send the new server graph
socket.on("serverGraphUpdate", (s) => {
  server_graph=s;
})

// ----------------------- p5 helper functions -----------------------

function togglePopup() {
  if (infoDiv.style('display') === 'none') {
      infoDiv.show();
  } else {
      infoDiv.hide();
  }
}

function sendMouseUpdateToServer() {
  socket.emit('mouseUpdate', {
    x: mouseX,
    y: mouseY,
    screenWidth: windowWidth,
    screenHeight: windowHeight,
  })
}

function drawUI() {
  noStroke();
  fill(0);
  let count_string = user_count == 1 ? 
    `${user_count} active user` :
    `${user_count} active users`;
  textAlign(RIGHT);
  text(count_string, windowWidth-40, windowHeight-20);
  textAlign(LEFT);
  textSize(32);
  text("Connections", 20, 40);
  textSize(12);
}

function drawInfoPopup() {
  fill(255);
  rect(width / 2 - 150, height / 2 - 100, 300, 200);
  fill(0);
  textAlign(CENTER, CENTER);
  text('This is some informational text.', width / 2, height / 2);
}

function drawServerGraphAndUsers() {
  for (let u in users) {
    // If the server, just draw in the middle of the screen
    // proceed to the rest of the nodes in the user graph
    fill(0);
    if(u == 'SERVER') {
      noStroke();
      textAlign(CENTER);
      text(users[u].screenName, windowWidth/2, windowHeight/2);
      continue
    }

    // Calculate the user's screen positional ratio to place them correctly on
    // the screen. This may not work as intended but worth a try.
    userXRatio = users[u].x / users[u].screenWidth;
    userYRatio = users[u].y / users[u].screenHeight;
    x_pos = userXRatio * windowWidth;
    y_pos = userYRatio * windowHeight;

    // Draw lines between users and server
    stroke(180);
    linetype = users[u].deviceType == 'smartphone' ? [5, 15] : []; // dashed line if smartphone
    drawingContext.setLineDash(linetype);
    line(windowWidth/2, windowHeight/2, x_pos, y_pos)

    // Draw each user and list their IP path below their name
    noStroke();
    textAlign(LEFT);
    text(users[u].screenName, x_pos, y_pos);
    // TODO: pre-build multi-line string to keep for loop out of draw()
    for(let i=0; i<users[u].path.length; i++){
      fill(140);
      text(users[u].path[i], x_pos + 10, y_pos + ((i+1)*12))
    }
  }
}

// ----------------------- Set up p5 sketch -----------------------

let projectText = `In the pursuit of frictionless technology we have abstracted away the underlying infrastructure powering our world. Instant messaging, video calling, online gaming, and realtime streaming all introduce interaction models that attempt to replicate an idea of shared presence similar to how its experienced in the real world. <br><br>

Through this project, the visitor experiences shared presence while replicating the underlying network topology that makes the experience possible. By interacting with the screen, the user explores ideas of connection through modeling the physical connection of digital devices.<br><br>

This project takes inspiration from various interactive web experiences, specifically the work of pioneers in this space like Myron Kruger VIDEOPLACE. Similar to Myron, this project attempts to explore how technology can be a medium for connection by replicating a user's identity and modeling shared space in a way that feels tangible.`
let infoBtn, infoDiv, infoTitle, infoP, infoLink;

function setup() {
  createCanvas(windowWidth, windowHeight);

  infoBtn = createButton("?");
  infoBtn.position(windowWidth - 60, 40);
  infoBtn.mousePressed(togglePopup);

  infoDiv = createDiv();
  infoDiv.position(width / 2 - 150, height / 2 - 100);
  infoDiv.style('background', 'white');
  infoDiv.style('text-align', 'center');
  infoDiv.style('padding', '20px');
  infoDiv.style('border', '1px solid black');
  infoDiv.hide();

  infoTitle = createElement('h1', 'Connections');
  infoTitle.parent(infoDiv);

  infoParagraph = createP(projectText);
  infoParagraph.style('text-align', 'left');
  infoParagraph.parent(infoDiv);
}

function draw() {
  if (pmouseX !== mouseX || pmouseY !== mouseY) {
    sendMouseUpdateToServer();
  }

  background(230);
  drawUI();
  drawServerGraphAndUsers()
}
