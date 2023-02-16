import { body } from "express-validator";

export const loginValidation = [
  body("email", "Format of email is wrong").isEmail(),
  body("password", "Password has to have at least 5 symbols").isLength({
    min: 5,
  }),
];

export const registerValidation = [
  body("email", "Format of email is wrong").isEmail(),
  body("password", "Password has to have at least 5 symbols").isLength({
    min: 5,
  }),
  body("fullName", "Write your name").isLength({ min: 3 }),
  body("avatarUrl", "Wrong url").optional().isURL(),
];

export const postCreateValidation = [
  body("title", "Write title of post").isLength({ min: 3 }).isString(),
  body("text", "Write text of post").isLength({ min: 3 }).isString(),
  body("tags", "Incorrect format of tags (specify an array)")
    .optional()
    .isArray(),
  body("imageUrl", "Wrong url").optional().isString(),
];

export const commentCreateValidation = [
  body("postId", "Incorrect format of id").isString(),
  body("text", "Field has not to be empty").isLength({ min: 1 }).isString(),
];
