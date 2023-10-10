let um, sm, ui;
let lastUpdate = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  um = new UserManager();
  sm = new SocketManager(um);
  ui = new UIManager();

  sm.sendMouseUpdateToServer();
}

function draw() {
  background(230);

  if(um.serverGraphIsEmpty()) {
    console.log("Loading");
    ui.showLoadingScreen();
  } else {
    const now = Date.now();
    if(now - lastUpdate > USER_UPDATE_INTERVAL) {
      sm.sendMouseUpdateToServer();
      lastUpdate = now;
    }

    ui.drawUI(um);
    ui.drawServerGraphAndUsers(um);
  }
}

