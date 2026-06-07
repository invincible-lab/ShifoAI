import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { api } from '../api';

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

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await api.chat(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Kechirasiz, xatolik yuz berdi. Qayta urinib ko'ring." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '70px', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--hint-color)' }}>
            ShifoAI ga xush kelibsiz! Savolingizni yozing.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatBubble key={idx} role={msg.role} content={msg.content} />
          ))
        )}
        {isLoading && (
          <ChatBubble role="assistant" content="..." />
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', position: 'fixed', bottom: '65px', left: '16px', right: '16px', backgroundColor: 'var(--bg-color)', zIndex: 10 }}>
        <input
          type="text"
          className="input-field"
          style={{ marginBottom: 0 }}
          placeholder="Xabar yozing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn" style={{ width: 'auto', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={isLoading}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
