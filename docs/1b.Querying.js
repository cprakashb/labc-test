// To demonstrate my skills and practical understanding of the assignment, I’ve built a mock demo site.
// https://labc-test.vercel.app/
// https://github.com/cprakashb/labc-test/tree/main


// 1. single post
db.posts.findOne({ _id: ObjectId("68461c4da4ecdedce44d83b8") })


// 2. comments on that post
db.comments.find({ postId: ObjectId("68461c4da4ecdedce44d83b8") }).sort({ createdAt: 1 }).pretty();

// 3. all hashtags associated with the post
const post = db.posts.findOne({ _id: ObjectId("68461c4da4ecdedce44d83b8") });
db.hashtags.find({ _id: { $in: post.hashtags } });

//-------------------------------------------------------------------------------------------
// 4. Nesting logic for comments

// 4.1 Mongo Shell 
const postId = ObjectId("68461c4da4ecdedce44d83b8");

// Step 1: Fetch all comments for the post
const comments = db.comments.find({ postId }).sort({ createdAt: 1 }).toArray();

// Step 2: Create a map of comments and initialize replies
const map = {};
const roots = [];

comments.forEach(comment => {
  comment.replies = [];
  map[comment._id] = comment;  // Use .str to safely get the string version of ObjectId
});

// Step 3: Nest replies under their parent
comments.forEach(comment => {
  if (comment.parentCommentId) {
    const parentId = comment.parentCommentId;
    if (map[parentId]) {
      map[parentId].replies.push(comment);
    }
  } else {
    roots.push(comment);
  }
});

// Step 4: Output the nested comment tree
printjson(roots);



// 4.2 Node.js
exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Step 1: Fetch all comments for the given postId, sorted by creation time
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean();

    // Step 2: a map to hold each comment by its ID, and initialize a 'replies' array on each
    const map = {};      // map to access comments by their ID quickly
    const roots = [];    // this will hold the top-level comments (those without a parent)

    comments.forEach(comment => {
      comment.replies = []; // add a replies array to each comment
      if (comment._id) {
        // Use stringified _id as key for consistent access
        map[comment._id] = comment;
      }
    });

    // Step 3: Loop again to nest replies under their parent comments
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        // If the comment is a reply, find its parent and push this comment into the parent's replies
        const parentId = comment.parentCommentId
        map[parentId]?.replies?.push(comment); // safe chaining in case parent not found
      } else {
        // If it's a top-level comment (no parent), add it to the root list
        roots.push(comment);
      }
    });

    // Step 4: Return the nested comment structure
    res.json(roots);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
