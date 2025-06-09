// To demonstrate my skills and practical understanding of the assignment, I’ve built a mock demo site.
// https://labc-test.vercel.app/
// https://github.com/cprakashb/labc-test/tree/main


// Step 1: Select database
use LABC;

// Step 2: Insert hashtags only if they don't already exist
const tagsToInsert = ["#VictoriaBC", "#IslandWeather", "#MistyMoods"];
const tagIds = [];

tagsToInsert.forEach(tag => {
  const existing = db.hashtags.findOne({ tag });
  if (existing) {
    tagIds.push(existing._id);
  } else {
    const result = db.hashtags.insertOne({ tag, createdAt: new Date() });
    tagIds.push(result.insertedId);
  }
});

// Step 3: Create a post with resolved hashtag IDs
const postContent = "Victoria weather really said: here’s some sun… just kidding, enjoy this random drizzle with a side of wind. ☀️🌧️🌬️ #IslandWeather #VictoriaBC";

const postInsertResult = db.posts.insertOne({
  title: "Victoria’s Wild Weather",
  body: postContent,
  author: "Jane Doe",
  hashtags: tagIds,
  createdAt: new Date(),
  updatedAt: new Date()
});
const postId = postInsertResult.insertedId;

// Step 4: Add comments
const comment1 = db.comments.insertOne({
  postId: postId,
  comment: "That moment when you wear sunglasses and carry an umbrella… and need both within 10 minutes.",
  author: "Alex",
  createdAt: new Date(),
  parentCommentId: null
});
const comment1Id = comment1.insertedId;

const comment2 = db.comments.insertOne({
  postId: postId,
  comment: "Every day’s forecast in Victoria: 'yes.'",
  author: "Morgan",
  createdAt: new Date(),
  parentCommentId: null
});
const comment2Id = comment2.insertedId;

// Step 5: Add a reply to comment2
db.comments.insertOne({
  postId: postId,
  comment: "Honestly thinking of just layering a raincoat over my summer clothes from now on.",
  author: "Jane Doe",
  createdAt: new Date(),
  parentCommentId: comment2Id
});
