import CommentModel from "../models/Comment.js";

/////////////////////// - create

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      postId: req.body.postId,
      text: req.body.text,
      user: req.userId,
    });

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
