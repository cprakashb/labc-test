'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  Badge,
  Button,
  Spinner,
  Modal,
  Label,
  Textarea,
  TextInput,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'flowbite-react';
import { fetchPosts, deletePost, createComment } from '@/lib/api';
import { Post, PostId } from '@/types/post';
import { HiTrash, HiPencil } from 'react-icons/hi';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { FaRegComment } from 'react-icons/fa';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [commentingPostId, setCommentingPostId] = useState<PostId | null>(null);

  const router = useRouter();

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data);
    } catch {
      setError('Could not fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  const handleDelete = async (id: PostId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Failed to delete post');
    }
  };

  const openCommentModal = (postId: PostId) => {
    setCommentingPostId(postId);
    setShowModal(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentingPostId || !authorName.trim() || !commentText.trim()) return;

    try {
      await createComment({
        postId: commentingPostId,
        parentCommentId: null,
        author: authorName.trim(),
        comment: commentText.trim()
      });
      setShowModal(false);
      setAuthorName('');
      setCommentText('');
    } catch {
      alert('Failed to submit comment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center mt-8 text-red-600 font-medium">{error}</div>
    );
  }

  return (
    <div className="max-w-screen-xxl mx-auto mt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
        <Link href="/posts/add" passHref>
          <Button color="dark">
            <IoAddCircleOutline className="mr-2 text-white" />
            Add Post
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {posts && posts?.map((post) => (
          <Card key={post._id} className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-gray-800">{post.title}</h2>
              <div className="flex gap-2">
                <HiPencil
                  className="text-blue-600 cursor-pointer"
                  title="Edit"
                  onClick={() => router.push(`/posts/edit/${post._id}`)}
                />
                <HiTrash
                  className="text-red-600 cursor-pointer"
                  title="Delete"
                  onClick={() => handleDelete(post._id)}
                />
              </div>
            </div>

            <div className="flex-1 mt-2">
              <p
                className="mb-3 text-gray-800 overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {post.body}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {post.hashtags?.map((ht, index) => (
                  <Badge key={ht._id || ht.tag || index} color="info">
                    {ht.tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/posts/${post._id}`} aria-label={`View post ${post._id}`}>
                <Button size="sm" color="green">
                  <FaArrowUpRightFromSquare className="mr-2 w-5" />
                  View Post
                </Button>
              </Link>

              <Button size="sm" onClick={() => openCommentModal(post._id)}>
                <FaRegComment className="mr-2 w-5" />
                Comment
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>Add Comment</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="author">Your Name</Label>
              <TextInput
                id="author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCommentSubmit}>Submit</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
