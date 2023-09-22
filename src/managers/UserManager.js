class UserManager {
  constructor() {
    this.userCount = 0;
    this.users = {};
    this.users['SERVER'] = {
      x: 200, y: 200, screenName: "Toronto, CA - 159.223.132.92",
    }
  }

  addUser() {
    const id = generateID();
    this.users[id] = {
      screenName: "new_user",
      deviceType: "desktop",
      path: [],
    };
    this.userCount += 1;
    return id;
  }

  getUser(userID) {
    if (!this.users[userID]) {
      throw new Error('User not found');
    }
    return this.users[userID];
  }

  updateUser(userID, updatedFields) {
    if (!this.users[userID]) {
      throw new Error('User not found');
    }
    this.users[userID] = { ...this.users[userID], ...updatedFields };
  }

  setDeviceType(userID, deviceType) {
    this.users[userID].deviceType = deviceType;
  }

  removeUser(userID) {
    delete this.users[userID];
    this.userCount -= 1;
  }

  setIP(userID, socket) {
    const userIP = socket.conn.remoteAddress.split(":")[3];
    this.updateUser(userID, { ip: userIP });
    return userIP;
  }
}

function generateID() {
  return "server-id" + Math.random().toString(16).slice(2);
}

module.exports = UserManager;
