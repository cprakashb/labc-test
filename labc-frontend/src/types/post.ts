export type PostId = string | undefined;
export type CommentId = string | undefined;
export type HashtagId = string | undefined;

// Represents a single user comment
export interface Comment {
  _id?: CommentId;
  postId: PostId;
  parentCommentId: CommentId | null;
  author: string;
  comment: string;
  replies?: Comment[] | undefined;
  createdAt?: string;
}

// Represents a hashtag 
export interface Hashtag {
  _id?: HashtagId;
  tag: string;
}

// Represents a single post with its comments and hashtags
export interface Post {
  _id?: PostId;
  title: string;
  body: string;
  hashtags: Hashtag[];
  filename?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
