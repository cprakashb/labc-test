'use client';

import { useEffect, useState } from 'react';
import { Comment } from '@/types/post';
import { fetchCommentsForPost, createComment, deleteComment } from '@/lib/api';
import { Spinner, Button, Card, TextInput, Textarea } from 'flowbite-react';
import { MdOutlineReply, MdDeleteOutline } from 'react-icons/md';

type Props = {
  postId: string;
};

export default function CommentThread({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [author, setAuthor] = useState<string>('');
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchCommentsForPost(postId);
        setComments(result);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [postId]);

  const handleAddComment = async () => {
    if (!author.trim() || !content.trim()) return;

    try {
      await createComment({ postId, author: author.trim(), comment: content.trim() });
      setAuthor('');
      setContent('');
      setShowForm(false);
      const updated = await fetchCommentsForPost(postId);
      setComments(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add comment.');
    }
  };

  if (loading) return <Spinner size="md" className="mt-4" />;
  if (error) return <p className="text-red-600 mt-4">{error}</p>;

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>Add Comment</Button>
      ) : (
        <Card className="p-4">
          <TextInput placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <Textarea
            className="mt-2"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleAddComment}>Submit</Button>
            <Button size="sm" color="gray" onClick={() => { setShowForm(false); setAuthor(''); setContent(''); }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {comments.map(comment => (
        <CommentNode
          key={comment._id}
          comment={comment}
          depth={0}
          parentPostId={postId}
          refreshComments={async () => {
            const updated = await fetchCommentsForPost(postId);
            setComments(updated);
          }}
        />
      ))}
    </div>
  );
}

type CommentNodeProps = {
  comment: Comment;
  depth: number;
  parentPostId: string;
  refreshComments: () => void;
};

function CommentNode({ comment, depth, parentPostId, refreshComments }: CommentNodeProps) {
  const [replying, setReplying] = useState<boolean>(false);
  const [replyAuthor, setReplyAuthor] = useState<string>('');
  const [replyContent, setReplyContent] = useState<string>('');

  const handleReply = async () => {
    if (!replyAuthor.trim() || !replyContent.trim()) return;

    try {
      await createComment({
        postId: parentPostId,
        author: replyAuthor.trim(),
        comment: replyContent.trim(),
        parentCommentId: comment._id
      });

      setReplying(false);
      setReplyAuthor('');
      setReplyContent('');
      await refreshComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add reply.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment and all its replies?')) return;

    try {
      await deleteComment(comment._id);
      await refreshComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete comment.');
    }
  };

  return (
    <div style={{ marginLeft: depth * 20 }} className="mb-2">
      <div className="border border-gray-200 rounded-md p-3 bg-white">
        <p className="text-sm text-gray-800 whitespace-pre-line mb-1">{comment.comment}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="font-medium">{comment.author}</span>
          <div className="flex gap-2">
            {!replying && (
              <Button size="xs" color="gray" onClick={() => setReplying(true)}>
                <MdOutlineReply className="mr-1 inline" /> Reply
              </Button>
            )}
            <Button size="xs" color="light" onClick={handleDelete}>
              <MdDeleteOutline className="mr-1 inline" /> Delete
            </Button>
          </div>
        </div>

        {replying && (
          <div className="mt-3 space-y-2">
            <TextInput
              placeholder="Your name"
              value={replyAuthor}
              onChange={(e) => setReplyAuthor(e.target.value)}
            />
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply}>Submit</Button>
              <Button size="sm" color="gray" onClick={() => setReplying(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 mt-2">
          {comment.replies.map(reply => (
            <CommentNode
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              parentPostId={parentPostId}
              refreshComments={refreshComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
