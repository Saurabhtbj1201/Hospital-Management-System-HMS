import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  Sparkles,
  Minimize2,
} from 'lucide-react';
import { AI_QUICK_REPLIES, AI_RESPONSES, HOSPITAL } from '../../lib/constants';

/* ── Keyword → response key mapping ──────────────────────── */
const KEYWORD_MAP = [
  { keys: ['appointment', 'book', 'schedule', 'booking'], response: 'appointment' },
  { keys: ['doctor', 'physician', 'specialist', 'find doctor'], response: 'doctor' },
  { keys: ['department', 'specialt', 'unit', 'ward'], response: 'department' },
  { keys: ['emergency', 'urgent', 'ambulance', '108'], response: 'emergency' },
  { keys: ['hour', 'timing', 'open', 'close', 'opd', 'working'], response: 'hours' },
  { keys: ['location', 'address', 'direction', 'map', 'where'], response: 'location' },
  { keys: ['insurance', 'cashless', 'policy', 'cover'], response: 'insurance' },
  { keys: ['service', 'treatment', 'facilities'], response: 'service' },
  { keys: ['checkup', 'package', 'health check', 'executive'], response: 'checkup' },
  { keys: ['symptom', 'sick', 'pain', 'fever', 'headache', 'cough'], response: 'symptom' },
  { keys: ['blog', 'article', 'health tip', 'news'], response: 'blog' },
];

/* ── Quick-reply → response key mapping ─────────────────── */
const QUICK_REPLY_MAP = {
  '📅 Book Appointment': 'appointment',
  '👨‍⚕️ Find a Doctor': 'doctor',
  '🏥 Departments': 'department',
  '🚨 Emergency Info': 'emergency',
  '⏰ Working Hours': 'hours',
  '📍 Location & Directions': 'location',
};

function matchResponse(input) {
  const lower = input.toLowerCase();
  for (const { keys, response } of KEYWORD_MAP) {
    if (keys.some((k) => lower.includes(k))) {
      return AI_RESPONSES[response];
    }
  }
  return AI_RESPONSES.default;
}

/* ── Typing indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ── Single chat message ─────────────────────────────────── */
function ChatMessage({ msg }) {
  const isBot = msg.role === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={16} />
        </div>
      )}
      <div className={`max-w-[80%] space-y-2`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isBot
              ? 'bg-gray-100 text-dark-800 rounded-tl-sm'
              : 'bg-primary-600 text-white rounded-tr-sm'
          }`}
        >
          {msg.text}
        </div>
        {msg.action && (
          <Link
            to={msg.action.path}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors"
          >
            {msg.action.label}
            <ArrowRight size={12} />
          </Link>
        )}
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
          <User size={16} />
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Chat Widget ────────────────────────────────────── */
export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: `👋 Hi! I'm the ${HOSPITAL.shortName} AI Assistant. How can I help you today?`,
      action: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const addBotReply = useCallback((response) => {
    setIsTyping(true);
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'bot',
          text: response.text,
          action: response.action,
        },
      ]);
    }, delay);
  }, []);

  const handleSend = useCallback(
    (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed) return;

      // User message
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'user', text: trimmed },
      ]);
      setInput('');

      // Bot reply
      const response = matchResponse(trimmed);
      addBotReply(response);
    },
    [input, addBotReply]
  );

  const handleQuickReply = useCallback(
    (reply) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'user', text: reply },
      ]);

      const key = QUICK_REPLY_MAP[reply];
      const response = key ? AI_RESPONSES[key] : AI_RESPONSES.default;
      addBotReply(response);
    },
    [addBotReply]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 text-white shadow-xl shadow-primary-600/30 flex items-center justify-center hover:bg-primary-700 transition-colors"
            aria-label="Open AI Chat"
          >
            <MessageCircle size={24} />
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 flex flex-col overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="bg-hero-gradient px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">AI Health Assistant</h3>
                  <p className="text-white/70 text-[11px]">Powered by {HOSPITAL.shortName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              {isTyping && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick replies ── */}
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {AI_QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-medium hover:bg-primary-100 transition-colors whitespace-nowrap"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Input bar ── */}
            <div className="px-4 pb-4 pt-2 flex-shrink-0">
              <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message…"
                  className="flex-1 bg-transparent text-sm text-dark-900 placeholder-dark-400 outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[10px] text-dark-400 text-center mt-2">
                AI responses are for guidance only — not medical advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
