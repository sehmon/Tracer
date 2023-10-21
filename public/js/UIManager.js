class UIManager {
  constructor() {
    this.infoBtn = null;
    this.infoDiv = null;
    this.infoTitle = null;
    this.infoParagraph = null;

    this.setupHTMLElements();
  }

  setupHTMLElements() {
    this.infoBtn = createButton("?");
    this.infoBtn.position(windowWidth - 40, 20);
    this.infoBtn.mousePressed(() => this.togglePopup());


    this.infoDiv = createDiv();
    for(let s in INFO_DIV_STYLES) {
      this.infoDiv.style(s, INFO_DIV_STYLES[s]);
    }
    this.infoDiv.hide();


    this.infoTitle = createElement('h1', 'Connections');
    this.infoTitle.parent(this.infoDiv);

    this.infoParagraph = createP(projectText);
    this.infoParagraph.style('text-align', 'left');
    this.infoParagraph.parent(this.infoDiv);
  }

  togglePopup() {
    console.log('button clicked');
    console.log(this.infoDiv);
    if (this.infoDiv.style('display') === 'none') {
      this.infoDiv.show();
    } else {
      this.infoDiv.hide();
    }
  }

  drawUI(userManager) {
    noStroke();
    fill(0);
    let countString = userManager.userCount == 1 ?
      `${userManager.userCount} active user` :
      `${userManager.userCount} active users`;
    textAlign(RIGHT);
    text(countString, windowWidth-20, windowHeight-20);
    textAlign(LEFT);
  }

  drawServerGraphAndUsers(userManager) {
    textSize(12);
    for (let u in userManager.users) {
      // If the server, just draw in the middle of the screen
      // proceed to the rest of the nodes in the user graph
      fill(0);
      if(u == 'SERVER') {
        noStroke();
        textAlign(CENTER);
        text(userManager.users[u].screenName, windowWidth/2, windowHeight/2);
        continue
      }

      // Calculate the user's screen positional ratio to place them correctly on
      // the screen. This may not work as intended but worth a try.
      let userXRatio = userManager.users[u].x / userManager.users[u].screenWidth;
      let userYRatio = userManager.users[u].y / userManager.users[u].screenHeight;
      let xPos = userXRatio * windowWidth;
      let yPos = userYRatio * windowHeight;

      // Draw lines between users and server
      stroke(180);
      let linetype = userManager.users[u].deviceType == 'smartphone' ? [5, 15] : []; // dashed line if smartphone
      drawingContext.setLineDash(linetype);
      if(u == userManager.userID) {
        fill(100, 0, 0);
        line(windowWidth/2, windowHeight/2, mouseX, mouseY)
      } else {
        fill(0);
        line(windowWidth/2, windowHeight/2, xPos, yPos)
      }

      // Draw each user and list their IP path below their name
      noStroke();
      textAlign(LEFT);
      if(u == userManager.userID) {
        fill(100, 0, 0);
        const displayName = userManager.users[u].screenName == "new_user" ? "Loading..." : userManager.users[u].screenName;
        text(displayName, mouseX, mouseY);
      } else {
        fill(0);
        text(userManager.users[u].screenName, xPos, yPos);
      }
    }

    if(userManager.userID && userManager.users[userManager.userID]) {
      // List the user's IP path at the bottom of the screen
      let commonNode = "";
      let commonNodeIp = "";
      for(let i=0; i<userManager.users[userManager.userID].path.length; i++){
        let { name, ip } = userManager.users[userManager.userID].path[i];
        if(userManager.serverGraph && userManager.serverGraph.userNodeMap && userManager.serverGraph.userNodeMap[ip].connectedUsers.length > 1) {
          fill(100, 0, 0);
          commonNode = name;
          commonNodeIp = ip;
        } else {
          fill(140);
        }
        text(`${name} (${ip})`, 0, windowHeight - (12 * (1+i)) - 20);
      }
      fill(40);
      text("Your Path to Server:", 0, windowHeight - (12 * (1+userManager.users[userManager.userID].path.length)) - 20)
      if(commonNode) {
        text(`Common Node: ${commonNode}`, 20, 20);
        text(`Region: ${userManager.serverGraph.userNodeMap[commonNodeIp].country}`, 20, 32);
      }
    }
  }

  showLoadingScreen() {
    textAlign(CENTER);
    textSize(24);
    text("Loading...", windowWidth/2, windowHeight/2);
  }
}

