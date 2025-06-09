'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Button, Spinner, Toast } from 'flowbite-react';
import { fetchPostById, deletePost } from '@/lib/api/post';
import { Post } from '@/types/post';
import CommentThread from '@/app/components/CommentThread';

export default function PostDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  
  useEffect(() => {
    if (id) {
      fetchPostById(id as string)
        .then(setPost)
        .catch(() => setError('Post not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/posts/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost(id as string);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/posts');
      }, 1500);
    } catch {
      setError('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-6">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto mt-6 text-center text-red-600 font-semibold">
        {error || 'Post not found'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6 px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        <div className="space-x-2 flex justify-between">
          <Button size="sm" onClick={handleEdit}>Edit</Button>
          <Button size="sm" color="light" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">{post.body}</p>

      {post.filename && (
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-semibold">Attached File:</span> {post.filename}
        </div>
      )}

      {post.hashtags?.length > 0 && (
        <div className="mt-6">
          <span className="text-sm font-semibold text-gray-600">Hashtags:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {post.hashtags.map(ht => (
              <Badge key={ht._id || ht.tag} color="info">
                {ht.tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <CommentThread postId={post._id!} />
      </div>

      {showSuccess && (
        <Toast className="fixed top-16 right-6 z-50 bg-green-100">
          <div className="text-green-700 font-semibold">Post deleted</div>
        </Toast>
      )}
    </div>
  );
}
