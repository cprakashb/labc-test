'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Textarea,
  Button,
  Badge,
  Card,
  Toast,
  Spinner,
  TextInput,
} from 'flowbite-react';
import { Post, Hashtag, PostId } from '@/types/post';
import { fetchPostById, updatePost } from '@/lib/api/post';

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalHashtags, setOriginalHashtags] = useState<Hashtag[]>([]);
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [newManualTag, setNewManualTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#[\w]+/g) || [];
    return [...new Set(matches.map(t => t))];
  };

  useEffect(() => {
    if (!id) return;
    fetchPostById(id as PostId)
      .then((post: Post) => {
        setTitle(post.title || '');
        setContent(post.body || '');
        setOriginalHashtags(post.hashtags || []);
      })
      .catch(() => setErrorMsg('Failed to fetch post'))
      .finally(() => setLoading(false));
  }, [id]);

  const getMergedHashtags = (): Hashtag[] => {
    const bodyTags = extractHashtags(content);
    const allTags = [...new Set([...bodyTags, ...manualTags.map(t => t)])];

    return allTags.map(tag => {
      const existing = originalHashtags.find(h => h.tag === tag);
      return existing ? { _id: existing._id, tag } : { tag };
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and content are required');
      return;
    }

    try {
      const updatedData: Post = {
        title: title.trim(),
        body: content.trim(),
        hashtags: getMergedHashtags(),
      };

      await updatePost(id as string, updatedData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/posts');
      }, 2000);
    } catch {
      setErrorMsg('Failed to update post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <Button onClick={handleSubmit}>Update Post</Button>
      </div>

      <Card>
        <TextInput
          placeholder="Edit title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />

        <Textarea
          rows={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Update your post..."
          className="mb-2"
        />

        <div className="mb-2">
          <span className="text-sm font-semibold">Hashtags:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {getMergedHashtags().map(ht => (
              <Badge key={ht._id || ht.tag} color="info">{ht.tag}</Badge>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <span className="text-sm font-semibold">Add Manual Hashtags:</span>
          <div className="mt-1 flex gap-2">
            <TextInput
              placeholder="Add hashtag"
              value={newManualTag}
              addon="#"
              onChange={(e) => setNewManualTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const tag = newManualTag.trim().replace(/^#/, '');
                  if (tag && !manualTags.includes(tag)) {
                    setManualTags(prev => [...prev, tag]);
                    setNewManualTag('');
                  }
                }
              }}
            />
            <Button size="sm" onClick={() => {
              const tag = newManualTag.trim().replace(/^#/, '');
              if (tag && !manualTags.includes(tag)) {
                setManualTags(prev => [...prev, tag]);
                setNewManualTag('');
              }
            }}>
              Add
            </Button>
          </div>
          {manualTags.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Click to remove:
              <div className="flex flex-wrap gap-2 mt-1">
                {manualTags.map(tag => (
                  <Badge
                    key={tag}
                    color="gray"
                    className="cursor-pointer"
                    onClick={() => setManualTags(prev => prev.filter(t => t !== tag))}
                  >
                    {tag} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {success && (
        <Toast className="fixed top-18 right-6 z-50">
          <div className="text-green-700 font-semibold">Post updated successfully!</div>
        </Toast>
      )}

      {errorMsg && (
        <Toast className="fixed bottom-6 right-6 z-50 bg-red-100">
          <div className="text-red-700 font-semibold">{errorMsg}</div>
        </Toast>
      )}
    </div>
  );
}
