const projectText = `In the pursuit of frictionless technology we have abstracted away the underlying infrastructure powering our world. Instant messaging, video calling, online gaming, and realtime streaming all introduce interaction models that attempt to replicate an idea of shared presence similar to how its experienced in the real world. <br><br>

Through this project, the visitor experiences shared presence while replicating the underlying network topology that makes the experience possible. By interacting with the screen, the user explores ideas of connection through modeling the physical connection of digital devices.<br><br>

This project takes inspiration from various interactive web experiences, specifically the work of pioneers in this space like Myron Kruger's VIDEOPLACE. Similar to Myron, this project attempts to explore how technology can be a medium for connection by replicating a user's identity and modeling shared space in a way that feels tangible.`

const INFO_DIV_STYLES = {
  background: 'white',
  textAlign: 'center',
  padding: '20px',
  border: '1px solid #666',
  width: '80vw',
  maxWidth: '600px',
  height: 'auto',
  maxHeight: '80vh',
  overflowY: 'auto',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};

const USER_UPDATE_INTERVAL = 50;

class UserManager {
  constructor() {
    this.users = {};
    this.userCount = 0;
    this.serverGraph = {};
    this.userID = null;
  }

  updateUser(data) {
    this.users = data.users;
    this.userCount = data.count;
  }
}

let um = new UserManager();
let lastUpdate = 0;
let socket = io();
let agent = navigator.userAgent;
let smallestScreenDimension;
let largestScreenDimension;
let minIntermediateRings = 6;
let maxIntermediateRings = 12;
let ringPadding = 40;

function setupSocketEvents(socket) {
  socket.on("connect", () => console.log("socket connected!"));

  socket.on("userUpdate", data => um.updateUser(data));

  socket.on("newUserEvent", () => console.log("New User Connected!"));

  socket.on("getUserAgent", () => socket.emit('setUserAgent', navigator.userAgent));

  socket.on("yourID", id => { um.userID = id });

  socket.on("serverGraphUpdate", data => um.serverGraph = data);
}

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

let infoBtn, infoDiv, infoTitle, infoP, infoLink;
function setupHTMLElements() {
  infoBtn = createButton("?");
  infoBtn.position(windowWidth - 40, 20);
  infoBtn.mousePressed(togglePopup);

  infoDiv = createDiv();
  for(style in INFO_DIV_STYLES) {
    infoDiv.style(style, INFO_DIV_STYLES[style]);
  }
  infoDiv.hide();


  infoTitle = createElement('h1', 'Connections');
  infoTitle.parent(infoDiv);

  infoParagraph = createP(projectText);
  infoParagraph.style('text-align', 'left');
  infoParagraph.parent(infoDiv);

}

function drawUI() {
  noStroke();
  fill(0);
  let countString = um.userCount == 1 ? 
    `${um.userCount} active user` :
    `${um.userCount} active users`;
  textAlign(RIGHT);
  text(countString, windowWidth-20, windowHeight-20);
  textAlign(LEFT);
  // textSize(32);
  // text("Connections", 20, 40);
  textSize(12);
}

function drawServerGraphAndUsers() {
  // I don't like the circles anymore
  /**
  for(let i=1; i < maxIntermediateRings+1; i++) {
    noFill();
    stroke(200);
    drawingContext.setLineDash([]);
    circle(width/2, height/2, (i*(largestScreenDimension/maxIntermediateRings)));
  }
  **/

  for (let u in um.users) {
    // If the server, just draw in the middle of the screen
    // proceed to the rest of the nodes in the user graph
    fill(0);
    if(u == 'SERVER') {
      noStroke();
      textAlign(CENTER);
      text(um.users[u].screenName, windowWidth/2, windowHeight/2);
      continue
    }

    // Calculate the user's screen positional ratio to place them correctly on
    // the screen. This may not work as intended but worth a try.
    userXRatio = um.users[u].x / um.users[u].screenWidth;
    userYRatio = um.users[u].y / um.users[u].screenHeight;
    xPos = userXRatio * windowWidth;
    yPos = userYRatio * windowHeight;

    // Draw lines between users and server
    stroke(180);
    linetype = um.users[u].deviceType == 'smartphone' ? [5, 15] : []; // dashed line if smartphone
    drawingContext.setLineDash(linetype);
    if(u == um.userID) {
      fill(100, 0, 0);
      line(windowWidth/2, windowHeight/2, mouseX, mouseY)
    } else {
      fill(0);
      line(windowWidth/2, windowHeight/2, xPos, yPos)
    }

    // Draw each user and list their IP path below their name
    noStroke();
    textAlign(LEFT);
    if(u == um.userID) {
      fill(100, 0, 0);
      text(um.users[u].screenName, mouseX, mouseY);
    } else {
      fill(0);
      text(um.users[u].screenName, xPos, yPos);
    }
  }
  
  if(um.userID && um.users[um.userID]) {
    // List the user's IP path at the bottom of the screen
    for(let i=0; i<um.users[um.userID].path.length; i++){
      let { name, ip } = um.users[um.userID].path[i];
      if(um.serverGraph.userNodeMap[ip].connectedUsers.length > 1) {
        fill(100, 0, 0);
      } else {
        fill(140);
      }
      text(`${name} (${ip})`, 0, windowHeight - (12 * (1+i)) - 20);
    }
    fill(40);
    text("Your Path to Server:", 0, windowHeight - (12 * (1+um.users[um.userID].path.length)) - 20)
  }

}

// ----------------------- Set up p5 sketch -----------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupHTMLElements();
  setupSocketEvents(socket);
  sendMouseUpdateToServer();

  smallestScreenDimension = min(windowWidth, windowHeight);
  smallestScreenDimension -= ringPadding;

  largestScreenDimension = max(windowWidth, windowHeight);
}

function draw() {
  const now = Date.now();
  if(now - lastUpdate > USER_UPDATE_INTERVAL) {
    sendMouseUpdateToServer();
    lastUpdate = now;
  }

  background(230);
  drawUI();
  drawServerGraphAndUsers()
}

function mousePressed() {
  console.log(um.serverGraph);
}
