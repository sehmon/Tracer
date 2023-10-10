class SocketManager {
  constructor(userManager) {
    this.socket = io();
    this.userManager = userManager;
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.socket.on("connect", () => console.log("socket connected!"));
    this.socket.on("userUpdate", data => this.userManager.updateUser(data));
    this.socket.on("newUserEvent", () => console.log("New User Connected!"));
    this.socket.on("getUserAgent", () => this.socket.emit('setUserAgent', navigator.userAgent));
    this.socket.on("yourID", id => { um.userID = id });
    this.socket.on("serverGraphUpdate", data => um.serverGraph = data);
  }

  sendMouseUpdateToServer() {
    this.socket.emit('mouseUpdate', {
      x: mouseX,
      y: mouseY,
      screenWidth: windowWidth,
      screenHeight: windowHeight,
    });
  }
}
