const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../model/errorModel");
const Post = require("../model/postModel");
const users = require("../model/userModel");
const { request } = require("http");

const createPost = (req, res, next) => {
  try {
    let { title, category, description } = req.body;
    if (!title || !category || !description) {
      return next(
        new HttpError("Fill in all required fields and choose thumbnail.", 422)
      );
    }
    const { thumbnail } = req.files;
    // check file Size
    if (thumbnail.size > 2000000) {
      return next(new HttpError("Thumbnail too big shoult less than 2mb."));
    }
    let fileName = thumbnail.name;
    let splittedFileName = fileName.split(".");
    let newFileName =
      splittedFileName[0] +
      uuid() +
      "." +
      splittedFileName[splittedFileName.length - 1];
    thumbnail.mv(
      path.join(__dirname, "..", "/uploads", newFileName),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        } else {
          const newPost = await Post.create({
            title,
            category,
            description,
            thumbnail: newFileName,
            creator: req.user.user.id,
          });
          if (!newPost) {
            return next(new HttpError("Post could not be created.", 422));
          }
          // find user and increase post count by 1
          const currentUser = await users.findById(req.user.user.id);
          const userPostCount = currentUser.posts + 1;
          await users.findByIdAndUpdate(req.user.user.id, {
            posts: userPostCount,
          });

          res.status(201).json(newPost);
        }
      }
    );
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};
const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post Not Found!", 404));
    }
    res.status(200).json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};
const getCatPost = async (req, res, next) => {
  try {
    const { category } = req.params;
    const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(catPosts);
  } catch (error) {
    return next(new HttpError(error));
  }
};
const getUserPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).send(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const EditPost = async (req, res, next) => {
  try {
    let fileName;
    let newFileName;
    let updatedPost;
    const postId = req.params.id;
    let { title, category, description } = req.body;
    if (!title || !category || description.length < 12) {
      return next(new HttpError("Fill in all required fields", 422));
    }
    // get old Post from database
    const oldPost = await Post.findById(postId);
    if (req.user.user.id == oldPost.creator) {
      if (!req.files) {
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description },
          { new: true }
        );
      } else {
        fs.unlink(
          path.join(__dirname, "..", "uploads", oldPost.thumbnail),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        const { thumbnail } = req.files;
        if (thumbnail.size > 2000000) {
          return next(
            new HttpError("Thumbnail too big. should be less than 2mb")
          );
        }
        fileName = thumbnail.name;
        let splittedFileName = fileName.split(".");
        newFileName =
          splittedFileName[0] +
          uuid() +
          "." +
          splittedFileName[splittedFileName.length - 1];
        thumbnail.mv(
          path.join(__dirname, "..", "uploads", newFileName),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description, thumbnail: newFileName },
          { new: true }
        );
      }
    }
    if (!updatedPost) {
      return next(new HttpError("Couldn't update post", 400));
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    return next(new HttpError(error));
  }
};
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("Post Unavailable", 400));
    }
    const post = await Post.findById(postId);
    const fileName = post?.thumbnail;
    if (req.user.user.id == post.creator) {
      fs.unlink(
        path.join(__dirname, "..", "uploads", fileName),
        async (err) => {
          if (err) {
            return next(new HttpError(err));
          } else {
            await Post.findByIdAndDelete(postId);
            const currentUser = await users.findById(req.user.user.id);
            const userPostCount = currentUser?.posts - 1;
            await users.findByIdAndUpdate(req.user.user.id, {
              posts: userPostCount,
            });
            res.json(`Post ${postId} deleted successfully.`);
          }
        }
      );
    } else {
      return next(new HttpError("Post Couldn't be deleted", 403));
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  createPost,
  getPosts,
  getUserPost,
  getPost,
  getCatPost,
  EditPost,
  deletePost,
};
