import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { chatResponses, quickReplies } from '../data/mockData';
import './ChatBot.css';

function getResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
        return chatResponses.greetings[Math.floor(Math.random() * chatResponses.greetings.length)];
    if (lower.includes('task') || lower.includes('todo') || lower.includes('backlog'))
        return chatResponses.task[Math.floor(Math.random() * chatResponses.task.length)];
    if (lower.includes('team') || lower.includes('member') || lower.includes('who'))
        return chatResponses.team[Math.floor(Math.random() * chatResponses.team.length)];
    if (lower.includes('meeting') || lower.includes('summary') || lower.includes('call'))
        return chatResponses.meeting[Math.floor(Math.random() * chatResponses.meeting.length)];
    if (lower.includes('deadline') || lower.includes('due') || lower.includes('urgent'))
        return chatResponses.deadline[0];
    if (lower.includes('performance') || lower.includes('sprint') || lower.includes('velocity'))
        return chatResponses.performance[0];
    if (lower.includes('help') || lower.includes('what can'))
        return chatResponses.help[0];
    return chatResponses.default[Math.floor(Math.random() * chatResponses.default.length)];
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hello! 👋 I'm your ProductFlow assistant. Ask me about tasks, team, meetings, or performance!" },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const sendMessage = (text) => {
        const userMsg = text || input;
        if (!userMsg.trim()) return;

        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const response = getResponse(userMsg);
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: response }]);
            setIsTyping(false);
        }, 800 + Math.random() * 700);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbot"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="chatbot__header">
                            <div className="chatbot__header-left">
                                <div className="chatbot__header-icon">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="chatbot__header-title">ProductFlow AI</h3>
                                    <span className="chatbot__header-status">● Online</span>
                                </div>
                            </div>
                            <button className="chatbot__close" onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="chatbot__messages">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    className={`chatbot__message chatbot__message--${msg.type}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="chatbot__message-avatar">
                                        {msg.type === 'bot' ? <Bot size={14} /> : <User size={14} />}
                                    </div>
                                    <div className="chatbot__message-bubble">
                                        <div dangerouslySetInnerHTML={{
                                            __html: msg.text
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                                .replace(/•/g, '<span style="color: #06b6d4">•</span>')
                                        }} />
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    className="chatbot__message chatbot__message--bot"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="chatbot__message-avatar"><Bot size={14} /></div>
                                    <div className="chatbot__message-bubble chatbot__typing">
                                        <span className="chatbot__typing-dot" />
                                        <span className="chatbot__typing-dot" />
                                        <span className="chatbot__typing-dot" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot__quick-replies">
                            {quickReplies.map((reply) => (
                                <button
                                    key={reply}
                                    className="chatbot__quick-reply"
                                    onClick={() => sendMessage(reply)}
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>

                        <div className="chatbot__input-area">
                            <input
                                type="text"
                                className="chatbot__input"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="chatbot__send"
                                onClick={() => sendMessage()}
                                disabled={!input.trim()}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className={`chatbot__fab ${isOpen ? 'chatbot__fab--active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                            <X size={22} />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                            <MessageCircle size={22} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isOpen && <span className="chatbot__fab-pulse" />}
            </motion.button>
        </>
    );
}
