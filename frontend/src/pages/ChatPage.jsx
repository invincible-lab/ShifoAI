import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { api } from '../api';
import { haptic } from '../telegram';

const SUGGESTIONS = [
  "Qandli diabet uchun qaysi mevalarni iste'mol qilsam bo'ladi?",
  "Glyukoza ko'rsatkichim 11.5 — bu normalmi?",
  "Insulin va metformin o'rtasidagi farq nima?",
  "Jismoniy mashqlar shakar darajasiga qanday ta'sir qiladi?",
];

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

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    haptic('light');
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const res = await api.chat(text);
      haptic('success');
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (error) {
      haptic('error');
      setMessages(prev => [...prev, { role: 'assistant', content: "Kechirasiz, xatolik yuz berdi. Qayta urinib ko'ring." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input.trim());
  };

  const handleSuggestion = (text) => {
    haptic('light');
    sendMessage(text);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '90px', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '24px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'var(--app-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 28px rgba(79,70,229,0.32)' }}>
              <Sparkles size={28} color="#fff" />
            </div>
            <h3 style={{ fontWeight: '800', letterSpacing: '-0.4px' }}>ShifoAI ga xush kelibsiz!</h3>
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--tg-hint-color)' }}>
              Qandli diabet bo'yicha savolingizni yozing yoki quyidagi takliflardan birini tanlang.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px', alignItems: 'stretch' }}>
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  className="chip"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal', lineHeight: '1.4' }}
                  onClick={() => handleSuggestion(s)}
                >
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatBubble key={idx} role={msg.role} content={msg.content} />
            ))}
            {!isLoading && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginTop: '4px' }}>
                {SUGGESTIONS.slice(0, 3).map((s, idx) => (
                  <button key={idx} className="chip" style={{ flexShrink: 0 }} onClick={() => handleSuggestion(s)}>
                    {s.length > 36 ? s.slice(0, 36) + '…' : s}
                  </button>
                ))}
              </div>
            )}
          </>
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
          <button type="submit" className="btn btn-icon" disabled={isLoading}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
