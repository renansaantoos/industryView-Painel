// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, Shield, CalendarRange, Users, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, type ChatResponse } from '../../services/api/agents';
import PageHeader from '../../components/common/PageHeader';
import { useAppState } from '../../contexts/AppStateContext';
import { staggerParent, fadeUpChild } from '../../lib/motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  domain?: string;
  agent?: string;
  processingTime?: number;
  timestamp: Date;
}

type DomainFilter = 'all' | 'executive' | 'safety' | 'planning' | 'workforce' | 'quality';

const DOMAIN_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  executive: { label: 'Executivo', icon: <Sparkles size={16} />, color: 'var(--color-primary)' },
  safety: { label: 'Seguranca', icon: <Shield size={16} />, color: 'var(--color-error)' },
  planning: { label: 'Planejamento', icon: <CalendarRange size={16} />, color: 'var(--color-tertiary)' },
  workforce: { label: 'Equipes', icon: <Users size={16} />, color: 'var(--color-success)' },
  quality: { label: 'Qualidade', icon: <CheckCircle size={16} />, color: 'var(--color-warning)' },
};

const SUGGESTED_QUESTIONS = [
  { text: 'Qual o status geral dos projetos?', domain: 'executive' as const },
  { text: 'Quantos incidentes de seguranca este mes?', domain: 'safety' as const },
  { text: 'Quais tarefas estao atrasadas?', domain: 'planning' as const },
  { text: 'Qual equipe tem mais tarefas pendentes?', domain: 'workforce' as const },
  { text: 'Resumo de nao-conformidades', domain: 'quality' as const },
];

export default function AiAssistant() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNavBarSelection(50); // Unique index for AI assistant
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = domainFilter !== 'all' ? { domain: domainFilter as ChatResponse['domain'] } : undefined;
      const response = await sendChatMessage({ message: msgText, context });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        domain: response.domain,
        agent: response.metadata.agent,
        processingTime: response.metadata.processing_time_ms,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        domain: 'general',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height) - 48px)' }}>
      <PageHeader
        title={t('nav.aiAssistant', 'Assistente IA')}
        subtitle="Converse com a IA sobre projetos, seguranca, planejamento, equipes e qualidade"
      />

      {/* Domain filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => setDomainFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${domainFilter === 'all' ? 'var(--color-primary)' : 'var(--color-alternate)'}`,
            backgroundColor: domainFilter === 'all' ? 'var(--color-primary)' : 'transparent',
            color: domainFilter === 'all' ? '#fff' : 'var(--color-secondary-text)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            transition: 'all var(--transition-fast)',
          }}
        >
          Todos
        </button>
        {Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setDomainFilter(key as DomainFilter)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${domainFilter === key ? cfg.color : 'var(--color-alternate)'}`,
              backgroundColor: domainFilter === key ? cfg.color : 'transparent',
              color: domainFilter === key ? '#fff' : 'var(--color-secondary-text)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'var(--font-family)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {cfg.icon}
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <Bot size={48} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary-text)', marginBottom: 4 }}>
                  Assistente IA do IndustryView
                </h3>
                <p style={{ fontSize: 14, color: 'var(--color-secondary-text)' }}>
                  Faca perguntas sobre seus projetos e operacoes
                </p>
              </div>

              {/* Suggested questions */}
              <motion.div
                variants={staggerParent}
                initial="initial"
                animate="animate"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 600 }}
              >
                {SUGGESTED_QUESTIONS.map((q) => (
                  <motion.button
                    key={q.text}
                    variants={fadeUpChild}
                    onClick={() => handleSend(q.text)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${DOMAIN_CONFIG[q.domain]?.color || 'var(--color-alternate)'}20`,
                      backgroundColor: `${DOMAIN_CONFIG[q.domain]?.color || 'var(--color-alternate)'}08`,
                      color: 'var(--color-primary-text)',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {q.text}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Sender label */}
                  <span style={{ fontSize: 11, color: 'var(--color-secondary-text)', marginBottom: 4 }}>
                    {msg.role === 'user' ? 'Voce' : 'Assistente IA'}
                    {msg.processingTime ? ` (${(msg.processingTime / 1000).toFixed(1)}s)` : ''}
                  </span>

                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-primary-bg)',
                      color: msg.role === 'user' ? '#fff' : 'var(--color-primary-text)',
                      fontSize: 14,
                      lineHeight: 1.6,
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
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: `${DOMAIN_CONFIG[msg.domain]?.color || 'var(--color-alternate)'}15`,
                        color: DOMAIN_CONFIG[msg.domain]?.color || 'var(--color-secondary-text)',
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {DOMAIN_CONFIG[msg.domain]?.icon}
                      {DOMAIN_CONFIG[msg.domain]?.label || msg.domain}
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--color-secondary-text)',
                    fontSize: 14,
                    padding: '8px 0',
                  }}
                >
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}
                      />
                    ))}
                  </div>
                  <span>Analisando sua pergunta...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 24px',
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
              padding: '10px 20px',
              fontSize: 14,
              outline: 'none',
              backgroundColor: 'var(--color-primary-bg)',
              color: 'var(--color-primary-text)',
              fontFamily: 'var(--font-family)',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: 44,
              height: 44,
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
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
