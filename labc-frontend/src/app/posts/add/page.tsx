'use client';

import { useState } from 'react';
import {
  Textarea,
  Button,
  Badge,
  Card,
  Toast,
  TextInput,
  FileInput,
} from 'flowbite-react';
import { Hashtag } from '@/types/post';
import { createPost } from '@/lib/api/post';
import { useRouter } from 'next/navigation';

export default function AddPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [newManualTag, setNewManualTag] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const extractHashtags = (text: string): Hashtag[] => {
    const matches = text.match(/#[\w]+/g) || [];
    const unique = [...new Set(matches.map((t) => t))];
    return unique.map((tag, index) => ({ id: index + 1, tag }));
  };

  const detectedHashtags = extractHashtags(content);

  const allHashtags: Hashtag[] = [
    ...detectedHashtags,
    ...manualTags
      .filter((tag) => !detectedHashtags.some((d) => d.tag === tag))
      .map((tag, i) => ({ id: 1000 + i, tag: tag })),
  ];

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and content are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('body', content.trim());

      const hashtagTags = allHashtags.map((ht) => ht.tag);
      formData.append('hashtags', JSON.stringify(hashtagTags));

      if (file) {
        formData.append('file', file);
      }

      await createPost(formData);
      setSuccess(true);

      router.push('/posts');
    } catch {
      setErrorMsg('Failed to submit post !!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add New Post</h1>
        <Button onClick={handleSubmit}>Submit Post</Button>
      </div>

      <Card>
        <TextInput
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
        <Textarea
          rows={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post with #hashtags..."
          className="mb-1"
        />

        <div className="mb-2">
          <span className="text-sm font-semibold">All Hashtags:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {allHashtags.length > 0 ? (
              allHashtags.map((ht) => (
                <Badge key={ht.tag} color="info">
                  {ht.tag}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 ml-2">None</span>
            )}
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
                    setManualTags((prev) => [...prev, tag]);
                    setNewManualTag('');
                  }
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                const tag = newManualTag.trim().replace(/^#/, '');
                if (tag && !manualTags.includes(tag)) {
                  setManualTags((prev) => [...prev, tag]);
                  setNewManualTag('');
                }
              }}
            >
              Add
            </Button>
          </div>

          {manualTags.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Click to remove:
              <div className="flex flex-wrap gap-2 mt-1">
                {manualTags.map((tag) => (
                  <Badge
                    key={tag}
                    color="gray"
                    className="cursor-pointer"
                    onClick={() => setManualTags((prev) => prev.filter((t) => t !== tag))}
                  >
                    {tag} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <span className="text-sm font-semibold">File Attachment (optional):</span>
          <FileInput
            className="mt-1"
            accept=".pdf,image/jpg,image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <p className="text-sm text-gray-700 mt-1">Selected: {file.name}</p>
          )}
        </div>
      </Card>

      {success && (
        <Toast className="fixed top-18 right-6 z-50">
          <div className="text-green-700 font-semibold">
            Post submitted successfully!
          </div>
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
