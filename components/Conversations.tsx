
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat } from '@google/genai';
import { Bot, Mic, Square, Send, MessageSquare, Mic2, Settings2, Trash2, Save, ChevronDown, Activity, Clock, Heart, BarChart3, TrendingUp, RefreshCw, Link, FileText, Upload, AlertCircle, Star, X, CheckCircle2, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChatMessage, AgentConfiguration, KnowledgeSource } from '../types';
import { INITIAL_AGENT_CONFIGS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- TYPES ---
export interface AgentSession {
  id: string;
  agentName: string;
  type: 'text' | 'voice';
  startTime: string; // ISO string
  duration: number; // seconds
  avgLatency?: number; // ms (text only)
  rating?: number; // 1-5
  status: 'completed' | 'aborted';
}

// --- UTILS ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- SHARED COMPONENTS ---

const RatingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[8px_8px_0px_0px_#27272a] max-w-sm w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white uppercase">Session Feedback</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
                </div>
                <p className="text-zinc-400 text-sm mb-6 font-mono">How would you rate the agent's performance?</p>
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-lime-400' : 'text-zinc-700'}`}
                        >
                            <Star className="w-8 h-8 fill-current" />
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => onSubmit(rating)}
                    disabled={rating === 0}
                    className="w-full bg-lime-400 text-black py-3 font-black uppercase tracking-wider border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Submit Rating
                </button>
            </div>
        </div>
    );
};

const ConfigManager: React.FC<{
    savedConfigs: AgentConfiguration[];
    setSavedConfigs: React.Dispatch<React.SetStateAction<AgentConfiguration[]>>;
    onLoad: (config: AgentConfiguration) => void;
    currentConfigData: Omit<AgentConfiguration, 'id' | 'name'>;
    type: 'text' | 'voice';
    activeConfigId: string | null;
    setActiveConfigId: (id: string | null) => void;
    agentName: string;
}> = ({ savedConfigs, setSavedConfigs, onLoad, currentConfigData, type, activeConfigId, setActiveConfigId, agentName }) => {
    const [newConfigName, setNewConfigName] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const activeConfig = savedConfigs.find(c => c.id === activeConfigId);

    const handleSaveNew = () => {
        if (!newConfigName) return;
        const newConfig: AgentConfiguration = {
            id: Date.now().toString(),
            name: newConfigName,
            ...currentConfigData
        };
        setSavedConfigs(prev => [...prev, newConfig]);
        setNewConfigName('');
        setActiveConfigId(newConfig.id);
    };

    const handleUpdate = () => {
        if (!activeConfigId) return;
        setSavedConfigs(prev => prev.map(c => 
            c.id === activeConfigId 
                ? { ...c, ...currentConfigData, name: agentName } 
                : c
        ));
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedConfigs(prev => prev.filter(c => c.id !== id));
        if (activeConfigId === id) setActiveConfigId(null);
    };

    const filteredConfigs = savedConfigs.filter(c => c.type === type);

    return (
        <div className="border-b-2 border-zinc-800 pb-4 mb-6">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-xs font-black uppercase text-zinc-500 hover:text-white mb-2"
            >
                <span>Saved Personas ({filteredConfigs.length})</span>
                {isExpanded ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                    {/* Controls for Active vs New */}
                    <div className="flex flex-col gap-2">
                        {activeConfigId && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleUpdate}
                                    className="flex-1 bg-zinc-800 border border-lime-400 text-lime-400 p-2 text-xs font-bold uppercase hover:bg-lime-400 hover:text-black transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-3 h-3" /> Update "{activeConfig?.name || agentName}"
                                </button>
                                <button 
                                    onClick={() => setActiveConfigId(null)}
                                    className="bg-zinc-900 border border-zinc-700 text-zinc-500 p-2 hover:text-white"
                                    title="Deselect"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <input 
                                value={newConfigName}
                                onChange={(e) => setNewConfigName(e.target.value)}
                                placeholder="Save as new persona..."
                                className="flex-1 bg-zinc-950 border border-zinc-700 p-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                            />
                            <button 
                                onClick={handleSaveNew}
                                disabled={!newConfigName}
                                className="bg-zinc-800 text-zinc-300 p-2 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 hover:text-white"
                                title="Save New"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredConfigs.map(config => (
                            <div 
                                key={config.id} 
                                onClick={() => onLoad(config)}
                                className={`group flex justify-between items-center p-2 border cursor-pointer text-xs transition-colors ${
                                    activeConfigId === config.id 
                                    ? 'bg-lime-900/20 border-lime-500/50 text-lime-400' 
                                    : 'bg-zinc-900 border-zinc-800 hover:border-lime-400 text-zinc-300'
                                }`}
                            >
                                <span className="font-bold">{config.name}</span>
                                <button onClick={(e) => handleDelete(config.id, e)} className="text-zinc-600 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const KnowledgeBaseConfig: React.FC<{
    sources: KnowledgeSource[];
    setSources: React.Dispatch<React.SetStateAction<KnowledgeSource[]>>;
}> = ({ sources, setSources }) => {
    const [inputUrl, setInputUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const addSource = (type: 'url' | 'file', title: string) => {
        setIsAdding(true);
        setTimeout(() => {
            setSources(prev => [...prev, {
                id: Date.now().toString(),
                type,
                title,
                status: 'active',
                addedAt: new Date().toLocaleDateString()
            }]);
            setIsAdding(false);
            setInputUrl('');
        }, 1000);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Knowledge Base</label>
                <div className="flex gap-2 mb-2">
                    <input 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                    />
                    <button 
                        onClick={() => addSource('url', inputUrl)}
                        disabled={!inputUrl || isAdding}
                        className="bg-zinc-800 p-2 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
                    >
                        {isAdding ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" /> : <Link className="w-4 h-4 text-zinc-400" />}
                    </button>
                    <button 
                        onClick={() => addSource('file', 'Company_Policy.pdf')}
                        disabled={isAdding}
                        className="bg-zinc-800 p-2 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>
                
                <div className="space-y-1">
                    {sources.map(src => (
                        <div key={src.id} className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-800">
                            {src.type === 'url' ? <Link className="w-3 h-3 text-cyan-400" /> : <FileText className="w-3 h-3 text-orange-400" />}
                            <span className="flex-1 text-[10px] font-mono text-zinc-300 truncate">{src.title}</span>
                            <span className="text-[9px] uppercase text-green-500 font-bold">{src.status}</span>
                            <button onClick={() => setSources(s => s.filter(i => i.id !== src.id))} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    ))}
                    {sources.length === 0 && <div className="text-[10px] text-zinc-600 italic text-center py-2">No data sources connected</div>}
                </div>
            </div>
        </div>
    );
};

// --- ANALYTICS DASHBOARD ---

const AgentAnalytics: React.FC<{ sessions: AgentSession[] }> = ({ sessions }) => {
    // Basic Calculations
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    // Average Latency (Only text sessions have valid latency tracking in this impl)
    const sessionsWithLatency = sessions.filter(s => s.avgLatency && s.avgLatency > 0);
    const avgLatencyMs = sessionsWithLatency.length > 0
        ? sessionsWithLatency.reduce((acc, curr) => acc + (curr.avgLatency || 0), 0) / sessionsWithLatency.length
        : 0;
    
    // Average Duration
    const avgDurationSec = totalSessions > 0
        ? sessions.reduce((acc, curr) => acc + curr.duration, 0) / totalSessions
        : 0;

    // CSAT
    const ratedSessions = sessions.filter(s => s.rating);
    const avgRating = ratedSessions.length > 0
        ? ratedSessions.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedSessions.length
        : 0;

    // Charts Data
    const sentimentData = [
        { name: 'Positive', value: ratedSessions.filter(s => (s.rating || 0) >= 4).length, color: '#a3e635' }, // lime-400
        { name: 'Neutral', value: ratedSessions.filter(s => (s.rating || 0) === 3).length, color: '#fbbf24' }, // amber-400
        { name: 'Negative', value: ratedSessions.filter(s => (s.rating || 0) <= 2).length, color: '#f87171' }, // red-400
    ];

    // Last 7 days performance
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d,
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            isoDate: d.toISOString().split('T')[0]
        };
    });

    const performanceData = last7Days.map(day => {
        const daySessions = sessions.filter(s => s.startTime.startsWith(day.isoDate));
        const dayLatency = daySessions.filter(s => s.avgLatency).length > 0
            ? daySessions.filter(s => s.avgLatency).reduce((acc, s) => acc + (s.avgLatency || 0), 0) / daySessions.filter(s => s.avgLatency).length / 1000 // to seconds for chart
            : 0;
        
        return {
            name: day.label,
            latency: parseFloat(dayLatency.toFixed(2)),
            conversations: daySessions.length
        };
    });

    const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}m ${s}s`;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto pr-2 pb-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-zinc-500 font-bold uppercase text-xs">Avg. Response Time</h3>
                        <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono">{(avgLatencyMs / 1000).toFixed(2)}s</div>
                    <div className="text-[10px] text-zinc-500 font-bold mt-1">Based on {sessionsWithLatency.length} text sessions</div>
                </div>

                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-zinc-500 font-bold uppercase text-xs">Avg. Duration</h3>
                        <Clock className="w-4 h-4 text-lime-400" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono">{formatDuration(avgDurationSec)}</div>
                    <div className="text-[10px] text-zinc-500 font-bold mt-1">Total {totalSessions} sessions</div>
                </div>

                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-zinc-500 font-bold uppercase text-xs">CSAT Score</h3>
                        <Heart className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono">{avgRating.toFixed(1)}/5</div>
                    <div className="text-[10px] text-zinc-500 font-bold mt-1">Based on {ratedSessions.length} ratings</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <h3 className="text-sm font-black text-white uppercase mb-6">Latency & Volume (7 Days)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                                <YAxis stroke="#71717a" tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '2px solid #3f3f46', borderRadius: '0px' }}
                                    itemStyle={{ fontFamily: 'monospace' }}
                                    cursor={{ fill: '#27272a' }}
                                />
                                <Bar dataKey="conversations" fill="#a3e635" barSize={30} />
                                <Line type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={2} dot={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <h3 className="text-sm font-black text-white uppercase mb-6">Sentiment Analysis</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        {ratedSessions.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', border: '2px solid #3f3f46' }} itemStyle={{ fontFamily: 'monospace' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-zinc-600 font-mono text-xs uppercase">No ratings yet</div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {sentimentData.map((d) => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3" style={{ backgroundColor: d.color }}></div>
                                <span className="text-xs text-zinc-400 uppercase font-bold">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                <h3 className="text-sm font-black text-white uppercase mb-4">Recent Sessions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold">
                                <th className="pb-2">Date</th>
                                <th className="pb-2">Agent Name</th>
                                <th className="pb-2">Type</th>
                                <th className="pb-2">Duration</th>
                                <th className="pb-2">Rating</th>
                                <th className="pb-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-mono text-zinc-300">
                            {sessions.slice().reverse().slice(0, 5).map(session => (
                                <tr key={session.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-3 text-zinc-500">{new Date(session.startTime).toLocaleString()}</td>
                                    <td className="py-3 text-white font-bold">{session.agentName}</td>
                                    <td className="py-3 uppercase text-[10px]">{session.type}</td>
                                    <td className="py-3">{formatDuration(session.duration)}</td>
                                    <td className="py-3 text-lime-400">
                                        {session.rating ? '★'.repeat(session.rating) + '☆'.repeat(5 - session.rating) : '-'}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-1 py-0.5 border ${session.status === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900' : 'bg-red-900/30 text-red-400 border-red-900'}`}>
                                            {session.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-zinc-600 italic">No sessions recorded yet. Start talking!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- AGENT BUILDERS ---

const TextAgentBuilder: React.FC<{
    savedConfigs: AgentConfiguration[];
    setSavedConfigs: React.Dispatch<React.SetStateAction<AgentConfiguration[]>>;
    onSessionComplete: (session: AgentSession) => void;
}> = ({ savedConfigs, setSavedConfigs, onSessionComplete }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Config
    const [instruction, setInstruction] = useState('You are a helpful assistant for a digital marketing agency.');
    const [temp, setTemp] = useState(0.7);
    const [model, setModel] = useState('gemini-2.5-flash');
    const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
    const [agentName, setAgentName] = useState('My Text Agent');
    const [activeConfigId, setActiveConfigId] = useState<string | null>(null);

    // Session State
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [latencies, setLatencies] = useState<number[]>([]);
    const [showRating, setShowRating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Initialize session on first message
        if (!sessionId) {
            setSessionId(Date.now().toString());
            setStartTime(Date.now());
        }

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const msgStartTime = Date.now();

        try {
            const chat: Chat = ai.chats.create({
                model: model,
                config: {
                    systemInstruction: instruction,
                    temperature: temp,
                },
                history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
            });

            const result = await chat.sendMessage({ message: userMsg.text });
            const latency = Date.now() - msgStartTime;
            setLatencies(prev => [...prev, latency]);

            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: result.text || "No response",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
             const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: "Error: Could not connect to agent.", timestamp: new Date() };
             setMessages(prev => [...prev, errorMsg]);
        }
        setIsTyping(false);
    };

    const loadConfig = (c: AgentConfiguration) => {
        setInstruction(c.systemInstruction);
        setTemp(c.temperature);
        setModel(c.model || 'gemini-2.5-flash');
        setKnowledgeSources(c.knowledgeSources);
        setAgentName(c.name);
        setActiveConfigId(c.id);
    };

    const handleEndSession = () => {
        if (!sessionId) return;
        setShowRating(true);
    };

    const submitRating = (rating: number) => {
        if (!sessionId || !startTime) return;
        const duration = (Date.now() - startTime) / 1000;
        const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
        
        const session: AgentSession = {
            id: sessionId,
            agentName,
            type: 'text',
            startTime: new Date(startTime).toISOString(),
            duration,
            avgLatency,
            rating,
            status: 'completed'
        };

        onSessionComplete(session);
        // Reset
        setMessages([]);
        setSessionId(null);
        setStartTime(null);
        setLatencies([]);
        setShowRating(false);
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 pb-10">
                <ConfigManager 
                    savedConfigs={savedConfigs} 
                    setSavedConfigs={setSavedConfigs} 
                    onLoad={loadConfig} 
                    currentConfigData={{ type: 'text', systemInstruction: instruction, temperature: temp, model, knowledgeSources }}
                    type="text"
                    activeConfigId={activeConfigId}
                    setActiveConfigId={setActiveConfigId}
                    agentName={agentName}
                />

                <div className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Agent Name</label>
                        <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white focus:border-lime-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Model</label>
                        <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white focus:border-lime-400">
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">System Instruction</label>
                        <textarea 
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            className="w-full h-48 bg-zinc-950 border border-zinc-800 p-2 text-sm text-zinc-300 focus:border-lime-400 focus:outline-none resize-y"
                            placeholder="Enter the system prompt here..."
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Temperature: {temp}</label>
                        <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
                            className="w-full accent-lime-400 bg-zinc-800 h-1 appearance-none rounded-lg cursor-pointer"
                        />
                    </div>
                    <KnowledgeBaseConfig sources={knowledgeSources} setSources={setKnowledgeSources} />
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-zinc-900 border-2 border-zinc-800 shadow-[4px_4px_0px_0px_#27272a] h-[600px] relative">
                {/* Header */}
                <div className="bg-zinc-950 border-b border-zinc-800 p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${sessionId ? 'bg-lime-400 animate-pulse' : 'bg-zinc-700'}`}></div>
                         <span className="text-xs font-bold text-zinc-300 uppercase">{sessionId ? 'Session Active' : 'Idle'}</span>
                    </div>
                    {sessionId && (
                         <button onClick={handleEndSession} className="text-[10px] font-bold uppercase bg-red-900/30 text-red-400 border border-red-900 px-3 py-1 hover:bg-red-900 hover:text-white transition-colors">
                             End Session
                         </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
                    {messages.length === 0 && (
                        <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm uppercase">
                            Configure agent and start chatting
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 text-sm ${
                                msg.role === 'user' 
                                ? 'bg-zinc-800 text-white border border-zinc-700' 
                                : 'bg-lime-900/20 text-lime-100 border border-lime-500/30'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && <div className="text-xs text-zinc-500 animate-pulse">Agent is typing...</div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 bg-zinc-900 border-t-2 border-zinc-800 flex gap-2">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-lime-400"
                        placeholder="Type a message..."
                    />
                    <button onClick={handleSend} disabled={!input || isTyping} className="bg-lime-400 text-black px-4 font-bold hover:bg-lime-300 disabled:opacity-50">
                        <Send className="w-5 h-5" />
                    </button>
                </div>

                <RatingModal 
                    isOpen={showRating} 
                    onClose={() => setShowRating(false)} 
                    onSubmit={submitRating} 
                />
            </div>
        </div>
    );
};

const VoiceAgentBuilder: React.FC<{
    savedConfigs: AgentConfiguration[];
    setSavedConfigs: React.Dispatch<React.SetStateAction<AgentConfiguration[]>>;
    onSessionComplete: (session: AgentSession) => void;
}> = ({ savedConfigs, setSavedConfigs, onSessionComplete }) => {
    // Config
    const [instruction, setInstruction] = useState('You are a helpful voice assistant.');
    const [voiceName, setVoiceName] = useState('Puck');
    const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
    const [agentName, setAgentName] = useState('My Voice Agent');
    const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
    
    // Live State
    const [isConnected, setIsConnected] = useState(false);
    const [audioVolume, setAudioVolume] = useState(0); 
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [showRating, setShowRating] = useState(false);

    // Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const closeSessionRef = useRef<(() => void) | null>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const connectLive = async () => {
        try {
            setError(null);
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = inputAudioContext;
            
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            // Init Session Tracking
            setSessionId(Date.now().toString());
            setStartTime(Date.now());

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
                    },
                    systemInstruction: instruction,
                },
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            let sum = 0;
                            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                            const rms = Math.sqrt(sum / inputData.length);
                            setAudioVolume(Math.min(100, rms * 400)); 

                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                outputAudioContext,
                                24000,
                                1
                            );
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => sources.delete(source));
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                        setAudioVolume(0);
                    },
                    onerror: (e) => {
                        console.error(e);
                        setError("Connection error.");
                        setIsConnected(false);
                    }
                }
            });

            // Cleanup function
            closeSessionRef.current = () => {
                sessionPromise.then(s => s.close());
                inputAudioContext.close();
                outputAudioContext.close();
                stream.getTracks().forEach(t => t.stop());
                handleDisconnect(); // Trigger logic
            };

        } catch (err) {
            console.error(err);
            setError("Failed to access microphone or connect.");
        }
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setAudioVolume(0);
        setShowRating(true);
    };

    const submitRating = (rating: number) => {
        if (!sessionId || !startTime) return;
        const duration = (Date.now() - startTime) / 1000;
        
        const session: AgentSession = {
            id: sessionId,
            agentName,
            type: 'voice',
            startTime: new Date(startTime).toISOString(),
            duration,
            rating,
            status: 'completed'
        };

        onSessionComplete(session);
        setSessionId(null);
        setStartTime(null);
        setShowRating(false);
    };

    const loadConfig = (c: AgentConfiguration) => {
        setInstruction(c.systemInstruction);
        setVoiceName(c.voiceName || 'Puck');
        setKnowledgeSources(c.knowledgeSources);
        setAgentName(c.name);
        setActiveConfigId(c.id);
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 pb-10">
                 <ConfigManager 
                    savedConfigs={savedConfigs} 
                    setSavedConfigs={setSavedConfigs} 
                    onLoad={loadConfig} 
                    currentConfigData={{ type: 'voice', systemInstruction: instruction, temperature: 0.7, voiceName, knowledgeSources }}
                    type="voice"
                    activeConfigId={activeConfigId}
                    setActiveConfigId={setActiveConfigId}
                    agentName={agentName}
                />
                 <div className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Agent Name</label>
                        <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white focus:border-lime-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Voice Personality</label>
                        <select value={voiceName} onChange={e => setVoiceName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white focus:border-lime-400">
                            <option value="Puck">Puck</option>
                            <option value="Charon">Charon</option>
                            <option value="Kore">Kore</option>
                            <option value="Fenrir">Fenrir</option>
                            <option value="Zephyr">Zephyr</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">System Instruction</label>
                        <textarea 
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            className="w-full h-48 bg-zinc-950 border border-zinc-800 p-2 text-sm text-zinc-300 focus:border-lime-400 focus:outline-none resize-y"
                            placeholder="Enter the voice agent's persona and instructions..."
                        />
                    </div>
                    <KnowledgeBaseConfig sources={knowledgeSources} setSources={setKnowledgeSources} />
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-zinc-900 border-2 border-zinc-800 shadow-[4px_4px_0px_0px_#27272a] h-[600px] relative overflow-hidden">
                {/* Visualizer Background */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none opacity-20">
                     {[...Array(20)].map((_, i) => (
                         <div 
                            key={i} 
                            className="w-4 bg-lime-400 transition-all duration-75"
                            style={{ height: `${Math.max(10, Math.random() * (isConnected ? audioVolume * 2 + 20 : 10))}%` }}
                         />
                     ))}
                </div>

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-8 transition-all duration-300 ${isConnected ? 'border-lime-400 shadow-[0_0_30px_rgba(163,230,53,0.3)]' : 'border-zinc-700'}`}>
                        {isConnected ? <Mic2 className="w-12 h-12 text-lime-400 animate-pulse" /> : <Mic className="w-12 h-12 text-zinc-600" />}
                    </div>
                    
                    <h2 className="text-2xl font-black text-white uppercase mb-2">{isConnected ? 'Agent Active' : 'Ready to Connect'}</h2>
                    <p className="text-zinc-500 font-mono text-sm max-w-md mb-8">
                        {isConnected 
                            ? "Listening... Speak naturally to the agent. Silence will trigger a response." 
                            : "Configure your agent's voice and personality, then connect to start a real-time conversation."}
                    </p>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-red-400 text-xs font-bold uppercase bg-red-900/20 px-4 py-2 border border-red-500/50">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {!isConnected ? (
                        <button 
                            onClick={connectLive}
                            className="bg-lime-400 text-black px-8 py-4 font-black uppercase tracking-wider text-lg border-2 border-lime-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] transition-all flex items-center gap-2"
                        >
                            <Activity className="w-5 h-5" />
                            Connect Live API
                        </button>
                    ) : (
                        <button 
                            onClick={() => closeSessionRef.current?.()} 
                            className="bg-red-500 text-white px-8 py-4 font-black uppercase tracking-wider text-lg border-2 border-red-600 hover:bg-red-600 transition-all flex items-center gap-2"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            End Call
                        </button>
                    )}
                </div>

                <RatingModal 
                    isOpen={showRating} 
                    onClose={() => setShowRating(false)} 
                    onSubmit={submitRating} 
                />
            </div>
        </div>
    );
};

// --- MAIN WRAPPER ---

export const Conversations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'analytics'>('text');
  
  // Persist configs
  const [savedConfigs, setSavedConfigs] = useLocalStorage<AgentConfiguration[]>('agent_configs', INITIAL_AGENT_CONFIGS);
  
  // Persist sessions
  const [sessions, setSessions] = useLocalStorage<AgentSession[]>('agent_sessions', []);

  const handleSessionComplete = (newSession: AgentSession) => {
      setSessions(prev => [...prev, newSession]);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">AI Agents</h2>
           <p className="text-zinc-500 font-mono text-sm">Deploy custom text and voice bots.</p>
        </div>
        <div className="flex bg-zinc-950 border-2 border-zinc-800 p-1">
            <button 
                onClick={() => setActiveTab('text')}
                className={`px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 transition-all ${activeTab === 'text' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'}`}
            >
                <MessageSquare className="w-4 h-4" /> Text Agent
            </button>
            <button 
                onClick={() => setActiveTab('voice')}
                className={`px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 transition-all ${activeTab === 'voice' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'}`}
            >
                <Mic2 className="w-4 h-4" /> Voice Agent
            </button>
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'}`}
            >
                <BarChart3 className="w-4 h-4" /> Performance
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
          {activeTab === 'text' && <TextAgentBuilder savedConfigs={savedConfigs} setSavedConfigs={setSavedConfigs} onSessionComplete={handleSessionComplete} />}
          {activeTab === 'voice' && <VoiceAgentBuilder savedConfigs={savedConfigs} setSavedConfigs={setSavedConfigs} onSessionComplete={handleSessionComplete} />}
          {activeTab === 'analytics' && <AgentAnalytics sessions={sessions} />}
      </div>
    </div>
  );
};
