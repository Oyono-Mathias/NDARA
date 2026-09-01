import { useState, useCallback } from 'react';
import { ForumService, ForumTopic, ForumTopicDetail, ForumCategory, CreatePostPayload } from '../services/forumService';

export function useForum() {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<ForumTopicDetail | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  const fetchTopics = useCallback(async (category?: ForumCategory, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ForumService.getTopics(category, search);
      setTopics(response.topics);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau inconnue.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopicById = useCallback(async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ForumService.getTopicById(topicId);
      setCurrentTopic(response.topic);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de récupération du sujet.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitPost = async (payload: CreatePostPayload): Promise<boolean> => {
    try {
      const newPost = await ForumService.createPost(payload);
      
      // Update local state if the topic matches
      if (currentTopic && currentTopic.id === payload.topicId) {
        setCurrentTopic(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            posts: [...prev.posts, newPost],
            repliesCount: prev.repliesCount + 1,
            lastActivity: newPost.createdAt
          };
        });
      }
      return true;
    } catch (err) {
      throw err; // Let the UI handle the specific error (like TOPIC_LOCKED)
    }
  };

  return {
    topics,
    currentTopic,
    loading,
    error,
    isMockData,
    fetchTopics,
    fetchTopicById,
    submitPost
  };
}
