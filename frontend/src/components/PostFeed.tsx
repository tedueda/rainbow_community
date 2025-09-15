import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: number;
  user_id: number;
  title?: string;
  body: string;
  visibility: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  display_name: string;
}

const PostFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
        
        const userIds = [...new Set(postsData.map((post: Post) => post.user_id))];
        const usersData: { [key: number]: User } = {};
        
        for (const userId of userIds) {
          try {
            const userResponse = await fetch(`${API_URL}/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              usersData[userId] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
        
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    try {
      await fetch(`${API_URL}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_type: 'post',
          target_id: postId,
          reaction_type: reactionType,
        }),
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-purple-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Community Feed</h1>
        <p className="text-purple-600">Share your thoughts and connect with others</p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No posts yet. Be the first to share something!</p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="border-purple-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">
                      {users[post.user_id]?.display_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {users[post.user_id]?.display_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
              )}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.body}</p>
              
              <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(post.id, 'like')}
                  className="text-gray-600 hover:text-red-500"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Like
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-500"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Comment
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-green-500"
                >
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PostFeed;
