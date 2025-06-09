import axios, { AxiosResponse } from 'axios';
import { Post, Comment, PostId } from "../../types/post";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const message =
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'API error occurred';
            return Promise.reject(new Error(message));
        }
        return Promise.reject(new Error('An unknown error occurred'));
    }
);

/**
 * Fetch all posts
 */
export const fetchPosts = async (): Promise<Post[]> => {
    const res = await api.get<Post[]>('/posts');
    return res.data;
};

/**
 * Fetch a post by ID
 */
export const fetchPostById = async (id: PostId): Promise<Post> => {
    if (!id) throw new Error("Post ID is required");
    const res = await api.get<Post>(`/posts/${id}`);
    return res.data;
};

/**
 * Create a new post
 */
export const createPost = async (formData: FormData): Promise<Post> => {
    const res = await api.post<Post>('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

/**
 * Update a post
 */
export const updatePost = async (id: string, updatedData: Partial<Post>): Promise<Post> => {
    const res = await api.put<Post>(`/posts/${id}`, updatedData);
    return res.data;
};

/**
 * Delete a post
 */
export const deletePost = async (id: PostId): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/posts/${id}`);
    return res.data;
};

/**
 * Add a comment
 */
export const addComment = async (
    postId: PostId,
    content: string,
    parentCommentId: string | null = null
): Promise<Comment> => {
    if (!postId || !content.trim()) {
        throw new Error("Post ID and comment content are required");
    }

    const res = await api.post<Comment>(`/posts/${postId}/comments`, {
        content: content.trim(),
        parentCommentId,
    });

    return res.data;
};
