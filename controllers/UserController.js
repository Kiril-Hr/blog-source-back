import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserModel from "../models/User.js";
import PostModel from "../models/Post.js";

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "User has not found",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: "Login or password is wrong",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to auth",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User has not found",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "No access",
    });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(userId).exec();

    const userPosts = await PostModel.find({ user: userId });

    res.json([user, userPosts]);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get user and posts",
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await UserModel.find({ postsCount: { $gt: 0 } }).exec();
    res.json(blogs);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get list of blogs",
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.params.id;

    const avatarUrl = `/uploads/user/${req.file.originalname}`;

    const user = await UserModel.findById(userId);

    if (user.avatarUrl) {
      const filePath = path.join(__dirname, "..", user.avatarUrl);
      fs.unlinkSync(filePath);
    }

    user.avatarUrl = avatarUrl;

    await user.save();

    res.json({ avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Problem to update user avatar",
    });
  }
};
