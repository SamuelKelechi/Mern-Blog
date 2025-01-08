const Post = require('../models/postModel')
const path = require('path')
const fs = require('fs')
const HttpError = require('../models/errorModel')
const cloudinary = require('cloudinary').v2;


// CREATE A POST
// POST: api/posts
// PROTECTED
const createPost = async (req, res, next) => {
    try {
        const { title, description, story } = req.body;

        if (!title || !description || !story) {
            return res.status(400).json({ message: "Title, description, and story are required fields." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image is required." });
        }

        const avatar = req.file.path;

        const newPost = new Post({
            title,
            description,
            story,
            avatar,
            timestamp: Date.now(),
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: savedPost,
        });
    } catch (error) {
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: "Unexpected file field. Ensure the key for the file is 'image'." });
        }

        console.error(error);
        return res.status(500).json({ message: "Failed to create the post. Please try again." });
    }
};


// GET ALL POSTS
// GET: api/posts
// UNPROTECTED
const getPosts = async (req, res, next) => {
    try{
        const posts = await Post.find().sort({updatedAt: -1})
        res.status(200).json(posts)
    }catch (error) {
        return next(new HttpError(error))
    }
}


// GET SINGLE POST
// GET: api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) {
            return next(new HttpError("Post not found", 404))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}


// EDIT POST
// PATCH: api/posts/:id
// PROTECTED
const editPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, story } = req.body;

        // Check if required fields are present
        if (!title || !description || !story) {
            return next(new HttpError('Title, description, and story are required fields.', 422));
        }

        // Find the post by ID
        const post = await Post.findById(id);
        if (!post) {
            return next(new HttpError('Post not found.', 404));
        }

        // If a new image is provided, upload to Cloudinary and replace the old image
        if (req.file) {
            // Delete the old image from Cloudinary
            if (post.image) {
                const publicId = post.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            // Upload the new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'blog-images',
            });
            post.image = result.secure_url;
        }

        // Update the post fields
        post.title = title;
        post.description = description;
        post.story = story;

        // Save the updated post
        await post.save();

        res.status(200).json({
            message: 'Post updated successfully!',
            post,
        });
    } catch (error) {
        console.error(error);
        next(new HttpError('Failed to update the post. Please try again.', 500));
    }
}


// DELETE POST
// DELETE: api/posts/:id
// PROTECTED
const deletePost = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Find the post by ID
        const post = await Post.findById(id);

        if (!post) {
            return next(new HttpError("Post not found", 404));
        }

        // Delete the image from Cloudinary (if it exists)
        if (post.avatar && post.avatar.public_id) {
            await cloudinary.uploader.destroy(post.avatar.public_id);
        }

        // Delete the post from the database
        await Post.findByIdAndDelete(id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        return next(new HttpError("Failed to delete the post. Please try again.", 500));
    }
}


module.exports = {createPost, getPosts, getPost,  editPost, deletePost}