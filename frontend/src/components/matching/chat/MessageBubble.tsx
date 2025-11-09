import React from 'react';
import { API_URL } from '@/config';

type MessageBubbleProps = {
  isMe: boolean;
  avatarUrl?: string | null;
  myAvatarUrl?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  createdAt: string;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  isMe,
  avatarUrl,
  myAvatarUrl,
  body,
  imageUrl,
  createdAt,
}) => {
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className={`flex gap-2 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isMe ? (
          myAvatarUrl ? (
            <img
              src={getImageUrl(myAvatarUrl)}
              alt="My Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
          )
        ) : (
          avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
          )
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isMe
              ? 'bg-black text-white rounded-tr-sm'
              : 'bg-gray-100 border border-gray-200 rounded-tl-sm'
          }`}
        >
          {/* Image */}
          {imageUrl && (
            <div className="mb-2">
              <a href={getImageUrl(imageUrl)} target="_blank" rel="noopener noreferrer">
                <img
                  src={getImageUrl(imageUrl)}
                  alt="Attached"
                  className="max-w-full max-h-[40vh] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onLoad={() => {
                    // Scroll to bottom after image loads
                    setTimeout(() => {
                      const container = document.querySelector('[data-chat-messages]');
                      if (container) {
                        container.scrollTop = container.scrollHeight;
                      }
                    }, 100);
                  }}
                />
              </a>
            </div>
          )}

          {/* Text */}
          {body && (
            <div className={`text-base whitespace-pre-wrap ${isMe ? 'text-white' : 'text-gray-900'}`}>
              {body}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {formatTime(createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
