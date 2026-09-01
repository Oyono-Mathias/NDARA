import React from 'react';
import { ForumPostType } from '../../services/forumService';
import { CornerDownRight } from 'lucide-react';

interface CommentThreadProps {
  posts: ForumPostType[];
}

export const CommentThread: React.FC<CommentThreadProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
        Aucune réponse pour le moment.
      </div>
    );
  }

  // Find root posts (those not replying to another) and map children
  const roots = posts.filter(p => !p.replyToId);
  const replies = posts.filter(p => p.replyToId);

  // Helper to render a post securely
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (!line.trim()) return <br key={index} />;
      return <p key={index} className="mb-2 last:mb-0 break-words">{line}</p>;
    });
  };

  const PostItem = ({ post, isReply = false }: { post: ForumPostType, isReply?: boolean }) => {
    // Determine depth explicitly: we only support 1 level of visual indentation to avoid broken mobile layouts
    const indentClass = isReply ? "ml-4 sm:ml-12 border-l-2 border-primary/20 pl-4" : "";

    return (
      <div className={`flex flex-col gap-3 py-4 ${indentClass}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-gray-500 dark:text-gray-400">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {post.author.name}
              </span>
              {isReply && <CornerDownRight className="w-3 h-3 text-gray-400" />}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleString('fr-FR', { 
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
        
        {/* SAFE CONTENT RENDERING */}
        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 pl-1">
          {renderContent(post.content)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/50">
      {roots.map(rootPost => {
        const rootReplies = replies.filter(r => r.replyToId === rootPost.id);
        return (
          <div key={rootPost.id} className="py-2">
            <PostItem post={rootPost} />
            {rootReplies.map(reply => (
              <PostItem key={reply.id} post={reply} isReply={true} />
            ))}
          </div>
        );
      })}
      
      {/* Fallback for orphaned replies that somehow lost their parent (robustness) */}
      {replies.filter(r => !roots.find(root => root.id === r.replyToId)).map(orphan => (
        <div key={orphan.id} className="py-2">
           <PostItem post={orphan} />
        </div>
      ))}
    </div>
  );
};
