import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, type ChatResponse } from '../../services/api/agents';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  domain?: string;
  agent?: string;
  timestamp: Date;
}

const DOMAIN_LABELS: Record<string, { label: string; color: string }> = {
  executive: { label: 'Executivo', color: 'var(--color-primary)' },
  safety: { label: 'Seguranca', color: 'var(--color-error)' },
  planning: { label: 'Planejamento', color: 'var(--color-tertiary)' },
  workforce: { label: 'Equipes', color: 'var(--color-success)' },
  quality: { label: 'Qualidade', color: 'var(--color-warning)' },
  general: { label: 'Geral', color: 'var(--color-secondary-text)' },
};

interface AiChatProps {
  embedded?: boolean;
}

export default function AiChat({ embedded = false }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response: ChatResponse = await sendChatMessage({ message: trimmed });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        domain: response.domain,
        agent: response.metadata.agent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        domain: 'general',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating button (only when not embedded)
  if (!embedded && !isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-navbar-gradient-start), var(--color-navbar-gradient-end))',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(29, 92, 198, 0.4)',
          zIndex: 1000,
        }}
      >
        <Bot size={24} />
      </motion.button>
    );
  }

  const panelWidth = isExpanded ? 520 : 400;
  const panelHeight = isExpanded ? 600 : 480;

  const chatPanel = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        ...(embedded
          ? { width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }
          : {
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: panelWidth,
              height: panelHeight,
              borderRadius: 'var(--radius-lg)',
              zIndex: 1000,
            }),
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-secondary-bg)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid var(--color-alternate)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, var(--color-navbar-gradient-start), var(--color-navbar-gradient-end))',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={20} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Assistente IA</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {!embedded && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-secondary-text)', padding: '32px 16px' }}>
            <Bot size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, marginBottom: 4 }}>Ola! Sou o assistente IA do IndustryView.</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>
              Pergunte sobre projetos, seguranca, planejamento, equipes ou qualidade.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-primary-bg)',
                color: msg.role === 'user' ? '#fff' : 'var(--color-primary-text)',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {msg.role === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>

            {/* Domain pill */}
            {msg.role === 'assistant' && msg.domain && msg.domain !== 'general' && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 4,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: `${DOMAIN_LABELS[msg.domain]?.color || 'var(--color-alternate)'}15`,
                  color: DOMAIN_LABELS[msg.domain]?.color || 'var(--color-secondary-text)',
                  fontSize: 10,
                  fontWeight: 500,
                }}
              >
                {DOMAIN_LABELS[msg.domain]?.label || msg.domain}
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-secondary-text)', fontSize: 13 }}
          >
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                  }}
                />
              ))}
            </div>
            <span>Analisando...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid var(--color-alternate)',
          backgroundColor: 'var(--color-secondary-bg)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta..."
          disabled={loading}
          style={{
            flex: 1,
            border: '1px solid var(--color-alternate)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            fontSize: 13,
            outline: 'none',
            backgroundColor: 'var(--color-primary-bg)',
            color: 'var(--color-primary-text)',
            fontFamily: 'var(--font-family)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: input.trim() && !loading ? 'var(--color-primary)' : 'var(--color-alternate)',
            color: '#fff',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color var(--transition-fast)',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );

  if (embedded) {
    return chatPanel;
  }

  return <AnimatePresence>{isOpen && chatPanel}</AnimatePresence>;
}
