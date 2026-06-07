import React from 'react';
import { User, Bot } from 'lucide-react';

export default function ChatBubble({ role, content }) {
  const isUser = role === 'user';

  const bubbleStyle = {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '16px',
    borderBottomRightRadius: isUser ? '4px' : '16px',
    borderBottomLeftRadius: !isUser ? '4px' : '16px',
    backgroundColor: isUser ? 'var(--button-color)' : 'var(--secondary-bg-color)',
    color: isUser ? 'var(--button-text-color)' : 'var(--text-color)',
    fontSize: '15px',
    lineHeight: '1.4',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
    gap: '8px',
    marginBottom: '16px'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: isUser ? 'var(--hint-color)' : '#e0f2fe',
    color: isUser ? '#fff' : 'var(--button-color)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  };

  return (
    <div style={containerStyle}>
      <div style={avatarStyle}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div style={bubbleStyle}>
        {content}
      </div>
    </div>
  );
}
