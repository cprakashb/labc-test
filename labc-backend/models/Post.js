const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  hashtags: [{ type: Schema.Types.ObjectId, ref: 'Hashtag' }],
  filename: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

PostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

PostSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Post', PostSchema);
