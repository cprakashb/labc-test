import axios, { AxiosResponse } from 'axios';
import { Comment, PostId, CommentId } from '@/types/post';

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
                error.message;
            return Promise.reject(new Error(message));
        }
        return Promise.reject(new Error('Unexpected error occurred'));
    }
);

/**
 * Create a comment or reply
 */
export const createComment = async (commentData: {
    postId: PostId;
    comment: string;
    author: string;
    parentCommentId?: CommentId | null;
}): Promise<Comment> => {
    const { postId, comment, author, parentCommentId } = commentData;

    if (!postId || !comment.trim() || !author.trim()) {
        throw new Error('Post ID, comment, and author are required');
    }

    const res = await api.post<Comment>('/comments', {
        postId,
        comment: comment.trim(),
        author: author.trim(),
        parentCommentId: parentCommentId ?? null,
    });

    return res.data;
};

/**
 * Get all comments (with nested replies) for a post
 */
export const fetchCommentsForPost = async (postId: PostId): Promise<Comment[]> => {
    if (!postId) throw new Error('Post ID is required');
    const res = await api.get<Comment[]>(`/comments/${postId}`);
    return res.data;
};

/**
 * Delete a comment by ID
 */
export const deleteComment = async (commentId: CommentId): Promise<{ message: string }> => {
    if (!commentId) throw new Error('Comment ID is required');
    const res = await api.delete<{ message: string }>(`/comments/${commentId}`);
    return res.data;
};
