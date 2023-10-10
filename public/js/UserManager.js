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

  serverGraphIsEmpty() {
    return Object.keys(this.serverGraph).length === 0;
  }
}
