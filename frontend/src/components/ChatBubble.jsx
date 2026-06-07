import React from 'react';
import { User, Sparkles } from 'lucide-react';

function renderInline(text, keyPrefix) {
  // Bold **text** support
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

function FormattedContent({ content }) {
  const lines = content.split('\n');
  const blocks = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length) {
      blocks.push(
        <ul key={`ul-${key}`} style={{ margin: '6px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {listBuffer.map((item, i) => <li key={i}>{renderInline(item, `li-${key}-${i}`)}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
      return;
    }
    flushList(idx);
    if (trimmed === '') {
      blocks.push(<div key={`sp-${idx}`} style={{ height: '6px' }} />);
    } else {
      blocks.push(<p key={`p-${idx}`} style={{ margin: 0 }}>{renderInline(trimmed, `p-${idx}`)}</p>);
    }
  });
  flushList('end');

  return <>{blocks}</>;
}

export default function ChatBubble({ role, content, isLoading }) {
  const isUser = role === 'user';

  const bubbleStyle = {
    maxWidth: '85%',
    padding: '14px 18px',
    borderRadius: '20px',
    borderBottomRightRadius: isUser ? '4px' : '20px',
    borderBottomLeftRadius: !isUser ? '4px' : '20px',
    background: isUser ? 'var(--app-primary-gradient)' : 'var(--tg-secondary-bg-color)',
    color: isUser ? '#fff' : 'var(--tg-text-color)',
    fontSize: '15px',
    lineHeight: '1.5',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    boxShadow: isUser ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 2px 8px rgba(0,0,0,0.05)'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: isUser ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
    gap: '10px',
    marginBottom: '20px',
    animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    background: isUser ? 'var(--tg-hint-color)' : 'var(--app-primary-gradient)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    boxShadow: isUser ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.3)'
  };

  return (
    <div style={containerStyle}>
      <div style={avatarStyle}>
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>
      <div style={bubbleStyle}>
        {isLoading ? (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '22px' }}>
            <span className="skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
            <span className="skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }}></span>
            <span className="skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }}></span>
          </div>
        ) : isUser ? (
          content
        ) : (
          <FormattedContent content={content} />
        )}
      </div>
    </div>
  );
}
