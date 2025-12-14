
import React, { useState, useRef, useEffect } from 'react';
import { InboxThread, InboxMessage, MessageChannel } from '../types';
import { INITIAL_THREADS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateSmartReply, sendRealEmail } from '../services/geminiService';
import { Search, Send, MessageSquare, Mail, MessageCircle, MoreVertical, Paperclip, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface InboxProps {
    tenantId: string;
}

export const Inbox: React.FC<InboxProps> = ({ tenantId }) => {
    const [threads, setThreads] = useLocalStorage<InboxThread[]>('inbox_threads', INITIAL_THREADS);
    const tenantThreads = threads.filter(t => t.tenantId === tenantId);

    const [activeThreadId, setActiveThreadId] = useState<string | null>(tenantThreads.length > 0 ? tenantThreads[0].id : null);
    const [newMessage, setNewMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeThread = threads.find(t => t.id === activeThreadId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeThread?.messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !activeThread) return;

        setIsSending(true);

        // If email channel, try to send via real Gmail API
        if (activeThread.messages[0].channel === 'email') {
            const recipientEmail = "demo@example.com"; 
            const subject = `Re: Conversation with ${activeThread.contactName}`;
            sendRealEmail(recipientEmail, subject, newMessage).then(success => {
                if (success) console.log("Real email sent via Pica");
            });
        } 

        await new Promise(resolve => setTimeout(resolve, 600));

        const msg: InboxMessage = {
            id: Date.now().toString(),
            direction: 'outbound',
            channel: activeThread.messages[0].channel,
            content: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedThread = {
            ...activeThread,
            lastMessage: newMessage,
            lastMessageTime: 'Just now',
            messages: [...activeThread.messages, msg]
        };

        setThreads(threads.map(t => t.id === activeThread.id ? updatedThread : t));
        setNewMessage('');
        setIsSending(false);
    };

    const handleSmartReply = async () => {
        if (!activeThread) return;
        setIsGenerating(true);
        const reply = await generateSmartReply(activeThread);
        setNewMessage(reply);
        setIsGenerating(false);
    };

    const getChannelIcon = (channel: MessageChannel) => {
        switch (channel) {
            case 'sms': return <MessageSquare className="w-3 h-3 text-cyan-400" />;
            case 'email': return <Mail className="w-3 h-3 text-yellow-400" />;
            case 'whatsapp': return <MessageCircle className="w-3 h-3 text-lime-400" />;
            default: return <MessageSquare className="w-3 h-3 text-white" />;
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="mb-6 bg-zinc-950 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#000]">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Unified Inbox</h2>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Centralized Communications</p>
            </div>

            <div className="flex-1 flex gap-0 border-2 border-zinc-800 bg-black overflow-hidden shadow-[8px_8px_0px_0px_#000]">
                {/* Threads List */}
                <div className="w-96 border-r-2 border-zinc-800 flex flex-col bg-zinc-950">
                    <div className="p-6 border-b-2 border-zinc-800">
                        <div className="relative group">
                            <Search className="absolute left-4 top-4 w-4 h-4 text-zinc-500 group-focus-within:text-lime-400 transition-colors" />
                            <input 
                                placeholder="SEARCH THREADS..." 
                                className="w-full bg-black border-2 border-zinc-800 p-3 pl-10 text-white text-xs font-bold focus:border-lime-400 focus:outline-none transition-colors uppercase tracking-wide placeholder:text-zinc-700"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                        {tenantThreads.map(thread => (
                            <div 
                                key={thread.id}
                                onClick={() => setActiveThreadId(thread.id)}
                                className={`p-6 border-b-2 border-zinc-800 cursor-pointer transition-all group ${activeThreadId === thread.id ? 'bg-zinc-900 border-l-[6px] border-l-lime-400 pl-4' : 'bg-transparent border-l-[6px] border-l-transparent pl-6 hover:bg-zinc-900/50'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-black uppercase text-sm tracking-wide ${thread.unreadCount > 0 ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{thread.contactName}</h4>
                                    <span className="text-[10px] text-zinc-600 font-mono">{thread.lastMessageTime}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs truncate max-w-[200px] font-mono pr-2 ${thread.unreadCount > 0 ? 'text-zinc-300 font-bold' : 'text-zinc-600'}`}>{thread.lastMessage}</p>
                                    {thread.unreadCount > 0 && (
                                        <div className="bg-lime-400 text-black text-[9px] font-black w-6 h-6 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                                            {thread.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="bg-black border border-zinc-800 p-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                        {getChannelIcon(thread.messages[0].channel)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                {activeThread ? (
                    <div className="flex-1 flex flex-col bg-zinc-950 relative">
                        {/* Background Decoration */}
                        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

                        {/* Header */}
                        <div className="p-6 border-b-2 border-zinc-800 flex justify-between items-center bg-zinc-950 z-10 shadow-md">
                            <div>
                                <h3 className="font-black text-white uppercase text-xl tracking-tighter">{activeThread.contactName}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Via {activeThread.messages[0].channel}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 hover:bg-zinc-900 text-zinc-500 hover:text-white border-2 border-transparent hover:border-zinc-800 transition-all"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 z-0">
                            {activeThread.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[65%] group relative flex flex-col ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-5 text-sm font-medium ${
                                            msg.direction === 'outbound' 
                                                ? 'bg-lime-400 text-black border-2 border-lime-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]' 
                                                : 'bg-zinc-900 text-white border-2 border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[9px] text-zinc-600 mt-2 font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-bold">{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t-2 border-zinc-800 bg-zinc-950 z-10">
                            <div className="flex gap-4 items-end">
                                <button className="p-5 bg-black border-2 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000]">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <textarea 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={activeThread.messages[0].channel === 'email' ? "Subject: Re:..." : "Type your message..."}
                                        className="w-full bg-black border-2 border-zinc-800 p-5 text-white text-sm focus:border-lime-400 focus:outline-none resize-none h-20 pr-14 transition-colors font-sans placeholder:text-zinc-700 font-medium"
                                    />
                                    <button 
                                        onClick={handleSmartReply}
                                        disabled={isGenerating}
                                        className="absolute right-4 bottom-4 p-2 text-purple-400 hover:text-white transition-colors disabled:opacity-50 bg-purple-900/10 hover:bg-purple-500 border border-purple-500/30 hover:border-purple-500"
                                        title="AI Smart Reply"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button 
                                    onClick={() => handleSendMessage()}
                                    disabled={!newMessage.trim() || isSending}
                                    className="p-5 bg-lime-400 text-black font-bold border-2 border-lime-500 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_0px_#000] shadow-[8px_8px_0px_0px_#000] transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                                >
                                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
                        <MessageSquare className="w-20 h-20 mb-6 opacity-20" />
                        <span className="font-mono uppercase text-xs tracking-[0.2em]">Select conversation to initialize</span>
                    </div>
                )}
            </div>
        </div>
    );
};
