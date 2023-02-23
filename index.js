import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";

import mongoose from "mongoose";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  commentCreateValidation,
} from "./validations.js";

import { handleValidationErrors, checkAuth } from "./utils/index.js";

import {
  UserController,
  PostController,
  CommentController,
} from "./controllers/index.js";

mongoose
  .connect(
    "mongodb+srv://admin:wwwwww@cluster0.jqssztq.mongodb.net/blog?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

const app = express();

const postStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads/post")) {
      fs.mkdirSync("uploads/post");
    }
    cb(null, "uploads/post");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const userStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads/user")) {
      fs.mkdirSync("uploads/user");
    }
    cb(null, "uploads/user");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const postUpload = multer({ storage: postStorage });
const userUpload = multer({ storage: userStorage });

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

///////////////////////////////////////////////////// - auth
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.get("/auth/me", checkAuth, UserController.getMe);
app.get("/blogs", checkAuth, UserController.getAllBlogs);
app.get("/user/:id", UserController.getOneUser);

/////////////////////////////////////////////////////

///////////////////////////////////////////////////// - upload files
app.post("/uploads/post", checkAuth, postUpload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/post/${req.file.originalname}`,
  });
});

app.patch(
  "/avatar-update/:id",
  checkAuth,
  userUpload.single("image"),
  UserController.uploadAvatar
);
/////////////////////////////////////////////////////

///////////////////////////////////////////////////// - posts, tags, comments
////////////////////// - create
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);

/// - comments of post
app.post(
  "/posts/comments",
  checkAuth,
  commentCreateValidation,
  handleValidationErrors,
  CommentController.create
);

////////////////////// - read
app.get("/posts", PostController.getAll);
app.get("/posts/popular", PostController.getSortedPopularAll);
app.get("/posts/:id", PostController.getOne);
app.get("/posts/user/:id", PostController.getPostsByUserId);

/// - tags of post
app.get("/tags", PostController.getLastTags);

/// - comments of post
app.get("/comments", CommentController.getAll);
app.get("/comments/groupById", CommentController.getCommentsGroupsSortedById);
app.get("/comments/:id", CommentController.getCommentsByPostId);

////////////////////// - update
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

////////////////////// - delete
app.delete("/posts/:id/:userId", checkAuth, PostController.remove);
app.delete("/comments/:id/:postId", checkAuth, CommentController.removeComment);
/////////////////////////////////////////////////////

///////////////////////////////////////////////////// - get requests from
app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server is OK");
});
