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

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

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

/////////////////////////////////////////////////////

///////////////////////////////////////////////////// - upload files
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});
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
app.delete("/posts/:id", checkAuth, PostController.remove);
/////////////////////////////////////////////////////

///////////////////////////////////////////////////// - get requests from
app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server is OK");
});
