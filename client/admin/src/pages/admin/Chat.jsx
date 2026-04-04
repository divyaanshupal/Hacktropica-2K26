import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Paperclip, Sparkles } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { chatResponses, quickReplies } from '../../data/mockData';

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

export default function Chat() {
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hello! 👋 I'm your ProductFlow AI Assistant. Need information on tasks, meetings, team performance or codebase?" },
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
        <div className="h-full flex flex-col bg-zinc-950 text-white w-full overflow-hidden">
            <TopBar 
                title="AI Knowledge Base Chat"
                subtitle="Fetch information and interact directly with the model."
            />
            
            <div className="flex-1 flex overflow-hidden lg:p-6 p-4 max-w-5xl mx-auto w-full">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative shadow-xl">
                    {/* Header */}
                    <div className="h-16 shrink-0 border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md z-10 w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg">ProductFlow AI</h3>
                                <p className="text-xs text-emerald-400 font-medium tracking-wide">Model Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto w-full p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
                        
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex max-w-[85%] ${msg.type === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                                {msg.type === 'bot' && (
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex flex-shrink-0 items-center justify-center text-white text-xs font-bold mr-3 mt-auto shadow-sm">
                                        <Bot size={16} />
                                    </div>
                                )}
                                <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} max-w-full`}>
                                    <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-slate-200 border border-zinc-700/50 rounded-tl-sm'}`}>
                                        <div dangerouslySetInnerHTML={{
                                            __html: msg.text
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                                .replace(/•/g, '<span style="color: #06b6d4">•</span>')
                                        }} />
                                    </div>
                                </div>
                                {msg.type === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex flex-shrink-0 items-center justify-center text-white text-xs font-bold ml-3 mt-auto shadow-sm">
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex max-w-[85%] mr-auto justify-start">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex flex-shrink-0 items-center justify-center text-white text-xs font-bold mr-3 mt-auto shadow-sm">
                                    <Bot size={16} />
                                </div>
                                <div className="p-4 bg-zinc-800 text-slate-200 border border-zinc-700/50 rounded-2xl rounded-tl-sm flex gap-1.5 items-center px-5 h-[52px]">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies Area */}
                    {messages.length < 3 && !isTyping && (
                        <div className="flex gap-2 p-4 pt-0 overflow-x-auto scrollbar-none border-t border-zinc-800 bg-zinc-900/50">
                            {quickReplies.map((reply) => (
                                <button
                                    key={reply}
                                    className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-slate-300 transition-colors cursor-pointer"
                                    onClick={() => sendMessage(reply)}
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="shrink-0 p-4 lg:p-6 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 lg:gap-4 z-10 w-full relative">
                        <button className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors shrink-0 cursor-pointer">
                            <Paperclip size={22} />
                        </button>
                        
                        <div className="flex-1 flex gap-2 w-full min-w-0 bg-zinc-950 border border-zinc-800 rounded-2xl px-2 py-2 shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                            <input 
                                type="text"
                                className="flex-1 min-w-0 bg-transparent border-none px-4 py-2 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none"
                                placeholder="Message ProductFlow AI..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            
                            <button 
                                onClick={() => sendMessage()}
                                disabled={!input.trim()}
                                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shrink-0 shadow-lg shadow-indigo-500/20 cursor-pointer"
                            >
                                <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
