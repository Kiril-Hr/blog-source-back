import CommentModel from "../models/Comment.js";
import PostModel from "../models/Post.js";

/////////////////////// - create

export const create = async (req, res) => {
  try {
    const postId = req.body.postId;
    const doc = new CommentModel({
      postId,
      text: req.body.text,
      user: req.userId,
    });

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { commentsCount: 1 },
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

    const comment = await doc.save();

    res.json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to create comment",
    });
  }
};

//////////////////////// - read

export const getAll = async (req, res) => {
  try {
    const comments = await CommentModel.find().populate("user").exec();
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get comments",
    });
  }
};

export const getCommentsByPostId = async (req, res) => {
  try {
    const postId = req.params.id;

    const commentsInPost = await CommentModel.find({ postId: postId })
      .populate("user")
      .exec();

    res.json(commentsInPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get comments",
    });
  }
};

export const getCommentsGroupsSortedById = async (req, res) => {
  try {
    const commentsGroup = await CommentModel.aggregate([
      {
        $group: { _id: "$postId", count: { $sum: 1 } },
      },
    ]).exec();
    res.json(commentsGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get comments",
    });
  }
};
