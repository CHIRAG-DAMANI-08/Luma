'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "@clerk/nextjs";
import styles from './community.module.css';

// Define the types for a community post and vote
interface Post {
  id: string;
  content: string;
  anonymousUsername: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

export default function CommunityPage() {
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/community/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();

      const postsWithCounts = data.map((post: any) => ({
        ...post,
        upvotes: post.votes.filter((v: any) => v.type === 'UPVOTE').length,
        downvotes: post.votes.filter((v: any) => v.type === 'DOWNVOTE').length,
      }));
      setPosts(postsWithCounts);
    } catch (error) {
      setError("Failed to load posts. Please try again later.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: newPostContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setNewPostContent("");
      await fetchPosts(); // Refresh posts after submission
    } catch (error) {
      setError("Failed to submit post. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      const token = await getToken();
      if (!token) {
        setError("You must be signed in to vote.");
        return;
      }

      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }
      await fetchPosts(); // Refresh posts to show new vote counts
    } catch (error) {
      setError('Failed to vote. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Community Forum
        </h1>
        <p className={styles.subtitle}>
          Share your thoughts, experiences, and questions with the community.
        </p>
      </header>

      <main className={styles.mainGrid}>
        <div className={styles.postsContainer}>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">
              No posts yet. Be the first to share your thoughts!
            </p>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className={styles.postCard}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {post.anonymousUsername}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 text-gray-700 leading-relaxed">
                  <p>{post.content}</p>
                </CardContent>
                <CardFooter className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-green-50 text-gray-700"
                    onClick={() => handleVote(post.id, 'UPVOTE')}
                  >
                    <ArrowUp className="mr-2 h-4 w-4 text-green-600" />
                    Upvote ({post.upvotes})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50 text-gray-700"
                    onClick={() => handleVote(post.id, 'DOWNVOTE')}
                  >
                    <ArrowDown className="mr-2 h-4 w-4 text-red-600" />
                    Downvote ({post.downvotes})
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <aside>
          <Card className={styles.formCard}>
            <CardHeader className={styles.formHeader}>
              <CardTitle className="flex items-center text-white">
                <MessageSquare className="mr-2 h-5 w-5" />
                Share your thoughts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handlePostSubmit}>
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="mb-4 min-h-[120px] rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-400"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  className={`w-full rounded-xl text-white ${styles.submitButton}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Anonymously"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

// PostSkeleton component for loading state
const PostSkeleton = () => (
  <Card className={styles.postCard}>
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/4 mt-2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5 mt-2" />
    </CardContent>
    <CardFooter className="flex gap-4">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </CardFooter>
  </Card>
);