// tests/registerController.test.js

const { registerUser } = require("../controllers/authController");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Mock dependencies
jest.mock("../models/User");
jest.mock("../utils/generateToken");

describe("registerUser Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        name: "Akash",
        email: "akash@gmail.com",
        password: "123456",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should register a new user successfully", async () => {
    // User does not exist
    User.findOne.mockResolvedValue(null);

    // User created successfully
    User.create.mockResolvedValue({
      _id: "123",
      name: "Akash",
      email: "akash@gmail.com",
      plan: "free",
    });

    // Fake JWT token
    generateToken.mockReturnValue("fake-token");

    // Call controller
    await registerUser(req, res);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({
      email: "akash@gmail.com",
    });

    expect(User.create).toHaveBeenCalledWith({
      name: "Akash",
      email: "akash@gmail.com",
      password: "123456",
    });

    expect(generateToken).toHaveBeenCalledWith("123");

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      _id: "123",
      name: "Akash",
      email: "akash@gmail.com",
      plan: "free",
      token: "fake-token",
    });
  });

  test("should return 400 if user already exists", async () => {
    User.findOne.mockResolvedValue({
      _id: "123",
      email: "akash@gmail.com",
    });

    await registerUser(req, res);

    expect(User.create).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "User already exists",
    });
  });

  test("should return 500 if database throws an error", async () => {
    User.findOne.mockRejectedValue(new Error("Database Error"));

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Database Error",
    });
  });
});
