import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentThread from './CommentThread';
import { Comment } from '@/types/post';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

const mockComments: Comment[] = [
    {
        _id: '1',
        postId: 'abc',
        author: 'Chandra Prakash',
        comment: 'This is a test comment',
        parentCommentId: null,
        replies: []
    }
];

describe('CommentThread', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading spinner initially', () => {
        (api.fetchCommentsForPost as jest.Mock).mockReturnValue(new Promise(() => { }));
        render(<CommentThread postId="abc" />);
        expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
    });

    it('shows error message on failure', async () => {
        (api.fetchCommentsForPost as jest.Mock).mockRejectedValue(new Error('Failed to load'));
        render(<CommentThread postId="abc" />);
        await waitFor(() => expect(screen.getByText(/Failed to load/i)).toBeInTheDocument());
    });

    it('displays comments when loaded', async () => {
        (api.fetchCommentsForPost as jest.Mock).mockResolvedValue(mockComments);
        render(<CommentThread postId="abc" />);
        expect(await screen.findByText(/This is a test comment/i)).toBeInTheDocument();
        expect(screen.getByText(/Chandra/)).toBeInTheDocument();
    });

    it('allows adding a new comment', async () => {
        (api.fetchCommentsForPost as jest.Mock).mockResolvedValue(mockComments);
        (api.createComment as jest.Mock).mockResolvedValue({});

        render(<CommentThread postId="abc" />);
        fireEvent.click(await screen.findByText('Add Comment'));

        fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Chandra' } });
        fireEvent.change(screen.getByPlaceholderText('Write a comment...'), { target: { value: 'New comment' } });

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => expect(api.createComment).toHaveBeenCalled());
        expect(api.createComment).toHaveBeenCalledWith(expect.objectContaining({
            author: 'Chandra',
            comment: 'New comment',
        }));
    });
});
