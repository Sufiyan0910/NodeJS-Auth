const User = require("../models/User");
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For token generation

// Register Controller
const registerUser = async (req, res) => {
  try {
    // Extract user information from request body
    const { username, email, password, role } = req.body;

    // Check if user already exists in our database
    const checkExistingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User is already exists either with same username or same email. Please try with a different username or email",
      });
    }

    // Hash User Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user and in your DB
    const newlyCreatedUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newlyCreatedUser.save();

    if (newlyCreatedUser) {
      res.status(201).json({
        success: true,
        message: "User registered successfully...!!!",
        data: newlyCreatedUser,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register user. Please try again...!!!",
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error Occured! Please try again.",
    });
  }
};

// Login Controller
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists in our database or not.
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: `User Doesn't exists. Please register first.`,
      });
    }

    //  If the password is correct or not
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials. Please try again.",
      });
    }

    // Create user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30m",
      }
    );

    res.status(200).json({
      success: true,
      message: "Logged In Successfully...!!!",
      accessToken,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error Occured! Please try again.",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    // Extract old and new password
    const { oldPassword, newPassword } = req.body;

    // Find current login User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        messgae: 'User not found'
      })
    }

    // Check If the old password is correct or not
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        messgae: 'Old password is not correct! Please try again'
      })
    }

    // Hash The new Password here
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password chnaged Successfully'
    })


  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error Occured! Please try again.",
    });
  }
}

module.exports = { registerUser, loginUser, changePassword };
