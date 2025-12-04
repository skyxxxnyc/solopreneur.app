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
            // In a real app we'd need the actual contact email, here we assume thread ID or mock
            // For demo, we'll try to send to a placeholder if contact doesn't have a real email in this view
            const recipientEmail = "demo@example.com"; 
            const subject = `Re: Conversation with ${activeThread.contactName}`;
            
            // Try to use real service, but don't block UI on it
            sendRealEmail(recipientEmail, subject, newMessage).then(success => {
                if (success) console.log("Real email sent via Pica");
            });
        } 

        // Simulate network delay for UI consistency
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
            <div className="mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Unified Inbox</h2>
                <p className="text-zinc-500 font-mono text-sm">Manage SMS, Email, and Social chats in one stream.</p>
            </div>

            <div className="flex-1 flex gap-0 border-2 border-zinc-800 bg-zinc-950 overflow-hidden shadow-[4px_4px_0px_0px_#27272a]">
                {/* Threads List */}
                <div className="w-80 border-r-2 border-zinc-800 flex flex-col bg-zinc-900">
                    <div className="p-4 border-b-2 border-zinc-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <input 
                                placeholder="Search conversations..." 
                                className="w-full bg-zinc-950 border border-zinc-700 p-2 pl-9 text-white text-sm focus:border-lime-400 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {tenantThreads.map(thread => (
                            <div 
                                key={thread.id}
                                onClick={() => setActiveThreadId(thread.id)}
                                className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors ${activeThreadId === thread.id ? 'bg-zinc-800 border-l-4 border-l-lime-400' : 'bg-transparent border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold text-sm ${thread.unreadCount > 0 ? 'text-white' : 'text-zinc-400'}`}>{thread.contactName}</h4>
                                    <span className="text-[10px] text-zinc-600 font-mono">{thread.lastMessageTime}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-xs truncate max-w-[180px] ${thread.unreadCount > 0 ? 'text-zinc-200 font-bold' : 'text-zinc-500'}`}>{thread.lastMessage}</p>
                                    {thread.unreadCount > 0 && (
                                        <div className="bg-lime-400 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                                            {thread.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="bg-zinc-950 border border-zinc-700 p-1 rounded-sm">
                                        {getChannelIcon(thread.messages[0].channel)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                {activeThread ? (
                    <div className="flex-1 flex flex-col bg-zinc-950">
                        {/* Header */}
                        <div className="p-4 border-b-2 border-zinc-800 flex justify-between items-center bg-zinc-900">
                            <div>
                                <h3 className="font-black text-white uppercase text-lg">{activeThread.contactName}</h3>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    via {activeThread.messages[0].channel.toUpperCase()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-zinc-800 text-zinc-400"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {activeThread.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] group relative ${msg.direction === 'outbound' ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className={`p-4 text-sm font-medium ${
                                            msg.direction === 'outbound' 
                                                ? 'bg-lime-400 text-black border-2 border-lime-500' 
                                                : 'bg-zinc-900 text-white border-2 border-zinc-800'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-zinc-600 mt-1 font-mono">{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t-2 border-zinc-800 bg-zinc-900">
                            <div className="flex gap-2 items-end">
                                <button className="p-3 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors">
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
                                        placeholder={activeThread.messages[0].channel === 'email' ? "Compose email..." : "Type a message..."}
                                        className="w-full bg-zinc-950 border border-zinc-700 p-3 text-white text-sm focus:border-lime-400 focus:outline-none resize-none h-14 pr-10"
                                    />
                                    <button 
                                        onClick={handleSmartReply}
                                        disabled={isGenerating}
                                        className="absolute right-2 bottom-2 p-1.5 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                        title="Generate AI Reply"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button 
                                    onClick={() => handleSendMessage()}
                                    disabled={!newMessage.trim() || isSending}
                                    className="p-3 bg-lime-400 text-black font-bold border-2 border-lime-500 hover:bg-lime-300 transition-colors disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono uppercase">Select a conversation</div>
                )}
            </div>
        </div>
    );
};