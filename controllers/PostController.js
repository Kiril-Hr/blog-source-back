import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

///////////////////////// - create

export const create = async (req, res) => {
  try {
    const user = req.userId;
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user,
    });

    UserModel.findOneAndUpdate(
      {
        _id: user,
      },
      {
        $inc: { postsCount: 1 },
      },
      {
        returnDocument: "after",
      },
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Failed to increase count",
          });
        }
      }
    );

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to create post",
    });
  }
};

///////////////////////// - read

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get posts",
    });
  }
};

export const getSortedPopularAll = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .limit(15)
      .sort({ viewsCount: -1, createdAt: 1 })
      .populate("user")
      .exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get posts",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const thisPost = await PostModel.findById(postId);

    const userId = thisPost.user._id;

    UserModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $inc: { totalViewsCount: 1 },
      },
      (err) => {
        if (err) {
          console.warn(err);
          return res.status(500).json({
            message: "Failed to get user or increase views",
          });
        }
      }
    );

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Failed to get post",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Post has not found",
          });
        }

        res.json(doc);
      }
    ).populate("user");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get post",
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(15).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 30);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get tags",
    });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    const posts = await PostModel.find({
      user: userId,
    }).exec();

    res.json(posts);
  } catch (err) {
    console.warn(err);
    res.status(500).json({
      message: "Failed to get user posts",
    });
  }
};

///////////////////////// - update

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findById(postId);

    if (post.imageUrl) {
      const filePath = path.join(__dirname, "..", post.imageUrl);
      fs.unlinkSync(filePath);
    }

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to update post",
    });
  }
};

///////////////////////// - delete

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.params.userId;

    const post = await PostModel.find({ _id: postId });
    const { imageUrl } = post[0];
    const filename = imageUrl.slice(14);

    if (imageUrl) {
      const filePath = path.join(__dirname, "../uploads/post", filename);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }

    UserModel.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $inc: { postsCount: -1 },
      },
      (err) => {
        if (err) {
          console.warn(err);
          return res.status(500).json({
            message: "Failed to decrease count",
          });
        }
      }
    );

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Failed to delete post",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Post has not found",
          });
        }

        res.json({
          success: true,
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to delete post",
    });
  }
};
