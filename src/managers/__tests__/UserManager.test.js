const UserManager = require('../UserManager');

describe("UserManager", () => {

  let userManager;

  beforeEach(() => {
    userManager = new UserManager();
  });

  // Initialization tests
  describe("Initialization", () => {
    test("should initialize UserManager correctly", () => {
        expect(userManager.userCount).toBe(0); // Since SERVER is already added
        expect(userManager.users).toHaveProperty('SERVER');
        expect(userManager.users['SERVER']).toEqual({
          x: 200,
          y: 200,
          screenName: "Toronto, CA - 159.223.132.92"
        });
      });
    });

  // User management tests
  describe("User Management", () => {

    describe("Add User", () => {
      test("should add a user correctly", () => {
        // your assertions here
      });
      // ... more add user tests
    });

    describe("Remove User", () => {
      test("should remove a user correctly", () => {
        // your assertions here
      });
      // ... more remove user tests
    });

    describe("Get User", () => {
      test("should get a user correctly", () => {
        // your assertions here
      });
      // ... more get user tests
    });
  });

  // User update tests
  describe("User Update", () => {
    test("should update a user's attributes correctly", () => {
      // your assertions here
    });
    // ... more user update tests
  });

  // ... any other categorized tests you want to add

});


