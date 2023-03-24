import express from "express";
import dotenv from "dotenv";

import multer from "multer";
import cors from "cors";

import mongoose from "mongoose";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4444;

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  commentCreateValidation,
} from "./validations.js";

import {
  handleValidationErrors,
  checkAuth,
  checkAdminQuery,
} from "./utils/index.js";

import {
  UserController,
  PostController,
  CommentController,
} from "./controllers/index.js";

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
      console.log("DB ok");
    }
  }
);

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
app.get("/", (req, res) => {
  res.send("Main page");
});

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.post(
  "/auth-admin",
  checkAdminQuery,
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

app.delete("/image-delete/:directory/:filename", (req, res) => {
  const filename = req.params.filename;
  const directory = req.params.directory;

  const filePath = path.join(__dirname, `uploads/${directory}`, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  } else {
    return console.log(
      "File deleted (changing file when create or update post)"
    );
  }
  return res.send({
    message: "File deleted successfully",
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

app.post(
  "/posts/check",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.createCheck
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
app.get("/posts/check/all", PostController.getAllCheck);
app.get("/posts/portion", PostController.getPortion);
app.get("/posts/popular", PostController.getSortedPopularAll);
app.get("/posts/:id", PostController.getOne);
app.get("/posts/check/:id", PostController.getOneCheck);
app.get("/posts/user/:id", PostController.getPostsByUserId);
app.get(
  "/posts/check/user-posts/:id",
  checkAuth,
  PostController.getCheckPostsByUserId
);

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
app.patch(
  "/posts/check/edit/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.updateCheck
); // checkAuth
////////////////////// - delete
app.delete("/posts/:id/:userId", checkAuth, PostController.remove);
app.delete("/comments/:id/:postId", checkAuth, CommentController.removeComment);
app.delete("/posts/check/remove/:id", checkAuth, PostController.removeCheck);
/////////////////////////////////////////////////////

///////////////////////////////////////////////////// - get requests from
app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server is OK");
});
