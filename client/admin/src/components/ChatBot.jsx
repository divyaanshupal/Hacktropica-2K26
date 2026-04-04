import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { chatResponses, quickReplies } from '../data/mockData';

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
        <div className="fixed bottom-6 right-6 w-80 bg-[#1c1f2e] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
            <div className="bg-linear-to-r from-indigo-500/20 to-cyan-500/20 p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">ProductFlow AI</h3>
                        <span className="text-xs text-emerald-400 font-medium">● Online</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 h-80 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${msg.type === 'bot' ? 'self-start' : 'self-end flex-row-reverse'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'bot' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'}`}>
                            {msg.type === 'bot' ? <Bot size={14} /> : <User size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'bot' ? 'bg-white/5 text-slate-200 rounded-tl-sm' : 'bg-indigo-500 text-white rounded-tr-sm'}`}>
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
                        className="flex gap-3 max-w-[85%] self-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-indigo-500/20 text-indigo-400"><Bot size={14} /></div>
                        <div className="p-3 bg-white/5 text-slate-200 rounded-2xl rounded-tl-sm flex gap-1 items-center px-4">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 p-4 pt-0 overflow-x-auto scrollbar-none">
                {quickReplies.map((reply) => (
                    <button
                        key={reply}
                        className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                        onClick={() => sendMessage(reply)}
                    >
                        {reply}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2 items-center bg-black/20">
                <input
                    type="text"
                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-slate-500"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-indigo-400 cursor-pointer"
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
