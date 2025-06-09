const Post = require('../models/Post');
const Hashtag = require('../models/HashTag');
const Comment = require('../models/Comment');

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { title, body } = req.body;
    const rawTags = JSON.parse(req.body.hashtags || '[]');
    const file = req.file;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    let filename = null;

    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(415).json({ error: 'File must be PDF, JPG, or PNG' });
      }

      filename = file.originalname;
    }

    // Get or create hashtag ObjectIds
    const hashtagIds = [];

    for (const tag of rawTags) {
      if (!tag.trim()) continue;

      let existing = await Hashtag.findOne({ tag: tag.trim().toLowerCase() });
      if (existing) {
        hashtagIds.push(existing._id);
      } else {
        const newTag = new Hashtag({ tag: tag.trim().toLowerCase() });
        await newTag.save();
        hashtagIds.push(newTag._id);
      }
    }

    // Save new post
    const newPost = new Post({
      title,
      body,
      hashtags: hashtagIds,
      filename
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created', post: newPost });
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('hashtags', 'tag _id')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get single post
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('hashtags', 'tag _id');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: 'Invalid post ID' });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, body, hashtags } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (body) updates.body = body;

    if (Array.isArray(hashtags)) {
      const hashtagIds = [];

      for (const h of hashtags) {
        if (!h || !h.tag?.trim()) continue;

        if (h._id) {
          hashtagIds.push(h._id);
        } else {
          const tag = h.tag.trim().toLowerCase();
          let existing = await Hashtag.findOne({ tag });
          if (!existing) {
            existing = await new Hashtag({ tag }).save();
          }
          hashtagIds.push(existing._id);
        }
      }

      updates.hashtags = hashtagIds;
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('hashtags');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json({ message: 'Post updated', post });
  } catch (err) {
    console.error('Error in updatePost:', err);
    res.status(400).json({ error: 'Update failed or invalid ID' });
  }
};


// Delete post and clean orphaned hashtags & comments
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Delete associated comments
    await Comment.deleteMany({ postId: post._id });

    // Remove orphaned hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      for (const tagId of post.hashtags) {
        const tagInUse = await Post.exists({ hashtags: tagId });
        if (!tagInUse) await Hashtag.findByIdAndDelete(tagId);
      }
    }

    res.json({ message: 'Post and related data deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Delete failed or invalid ID' });
  }
};
