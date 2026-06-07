import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { api } from '../api';
import { haptic } from '../telegram';

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.history().then(res => {
      if (res.messages) {
        setMessages(res.messages);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    haptic('light');
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await api.chat(userMsg);
      haptic('success');
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (error) {
      haptic('error');
      setMessages(prev => [...prev, { role: 'assistant', content: "Kechirasiz, xatolik yuz berdi. Qayta urinib ko'ring." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '90px', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--tg-hint-color)', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
            <h3>ShifoAI ga xush kelibsiz!</h3>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Savolingizni yozing.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatBubble key={idx} role={msg.role} content={msg.content} />
          ))
        )}
        {isLoading && (
          <ChatBubble role="assistant" content="..." isLoading={true} />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ position: 'fixed', bottom: '65px', left: 0, right: 0, padding: '10px 16px', background: 'var(--app-glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--app-glass-border)', zIndex: 10 }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="input-field"
            style={{ marginBottom: 0, background: 'var(--tg-bg-color)', border: '1px solid var(--tg-secondary-bg-color)' }}
            placeholder="Xabar yozing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: 'auto', padding: '0 16px', borderRadius: '14px', flexShrink: 0 }} disabled={isLoading}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
