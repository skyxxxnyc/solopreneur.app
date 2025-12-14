
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat } from '@google/genai';
import { Bot, Mic, Square, Send, MessageSquare, Mic2, Settings2, Trash2, Save, ChevronDown, Activity, Clock, Heart, BarChart3, TrendingUp, RefreshCw, Link, FileText, Upload, AlertCircle, Star, X, CheckCircle2, Plus, Volume2, Gauge } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChatMessage, AgentConfiguration, KnowledgeSource, AgentSession } from '../types';
import { INITIAL_AGENT_CONFIGS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-black border-2 border-zinc-800 p-10 shadow-[12px_12px_0px_0px_#27272a] max-w-sm w-full relative">
                <div className="absolute top-4 right-4">
                     <button onClick={onClose}><X className="w-6 h-6 text-zinc-600 hover:text-white" /></button>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">Session Feedback</h3>
                <p className="text-zinc-500 text-sm mb-10 font-mono text-center uppercase tracking-widest border-b-2 border-zinc-900 pb-6">Rate Agent Performance</p>
                <div className="flex justify-center gap-4 mb-12">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-2 transition-all hover:scale-110 ${rating >= star ? 'text-lime-400 drop-shadow-[0_0_12px_rgba(163,230,53,0.6)]' : 'text-zinc-800'}`}
                        >
                            <Star className="w-8 h-8 fill-current" />
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => onSubmit(rating)}
                    disabled={rating === 0}
                    className="w-full bg-lime-400 text-black py-4 font-black uppercase tracking-[0.2em] border-2 border-lime-500 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_#000] shadow-[6px_6px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:shadow-none disabled:transform-none"
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
    tenantId: string;
}> = ({ savedConfigs, setSavedConfigs, onLoad, currentConfigData, type, activeConfigId, setActiveConfigId, agentName, tenantId }) => {
    const [newConfigName, setNewConfigName] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const activeConfig = savedConfigs.find(c => c.id === activeConfigId);
    const filteredConfigs = savedConfigs.filter(c => c.type === type && c.tenantId === tenantId);

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
        if (confirm('Are you sure you want to delete this persona?')) {
            setSavedConfigs(prev => prev.filter(c => c.id !== id));
            if (activeConfigId === id) setActiveConfigId(null);
        }
    };

    return (
        <div className="border-b-2 border-zinc-800 pb-8 mb-8">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-[10px] font-black uppercase text-zinc-500 hover:text-white mb-6 tracking-[0.2em]"
            >
                <span>Persona Library ({filteredConfigs.length})</span>
                {isExpanded ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
            </button>
            
            {isExpanded && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-4">
                        {activeConfigId && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleUpdate}
                                    className="flex-1 bg-black border-2 border-lime-400 text-lime-400 p-3 text-[10px] font-black uppercase hover:bg-lime-400 hover:text-black transition-colors flex items-center justify-center gap-2 tracking-wide"
                                >
                                    <Save className="w-3 h-3" /> Update "{activeConfig?.name || agentName}"
                                </button>
                                <button 
                                    onClick={() => setActiveConfigId(null)}
                                    className="bg-black border-2 border-zinc-800 text-zinc-500 p-3 hover:text-white hover:border-zinc-500 transition-colors"
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
                                placeholder="NEW PERSONA NAME..."
                                className="flex-1 bg-black border-2 border-zinc-800 p-3 text-xs text-white focus:border-lime-400 focus:outline-none transition-colors font-bold placeholder:text-zinc-700"
                            />
                            <button 
                                onClick={handleSaveNew}
                                disabled={!newConfigName}
                                className="bg-zinc-900 text-zinc-300 p-3 border-2 border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 hover:text-white hover:border-lime-400 transition-colors"
                                title="Save New"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredConfigs.map(config => (
                            <div 
                                key={config.id} 
                                onClick={() => onLoad(config)}
                                className={`group flex justify-between items-center p-3 border-l-[4px] cursor-pointer text-xs transition-all ${
                                    activeConfigId === config.id 
                                    ? 'bg-zinc-900 border-lime-400 text-white font-black tracking-wide' 
                                    : 'bg-black border-zinc-800 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <span className="uppercase">{config.name}</span>
                                <button onClick={(e) => handleDelete(config.id, e)} className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
    const [isAddingUrl, setIsAddingUrl] = useState(false);
    const [isAddingFile, setIsAddingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addUrlSource = () => {
        if (!inputUrl) return;
        setIsAddingUrl(true);
        setTimeout(() => {
            setSources(prev => [...prev, {
                id: Date.now().toString(),
                type: 'url',
                title: inputUrl,
                status: 'active',
                addedAt: new Date().toLocaleDateString()
            }]);
            setIsAddingUrl(false);
            setInputUrl('');
        }, 1000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        setIsAddingFile(true);
        setTimeout(() => {
            setSources(prev => [...prev, {
                id: Date.now().toString(),
                type: 'file',
                title: file.name,
                status: 'active',
                addedAt: new Date().toLocaleDateString()
            }]);
            setIsAddingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }, 1500);
    };

    return (
        <div className="space-y-4 pt-6 border-t-2 border-zinc-800">
            <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Knowledge Base</label>
                <div className="flex gap-2 mb-4">
                    <input 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="HTTPS://..."
                        className="flex-1 bg-black border-2 border-zinc-800 p-3 text-xs text-white focus:border-lime-400 focus:outline-none transition-colors font-bold"
                    />
                    <button 
                        onClick={addUrlSource}
                        disabled={!inputUrl || isAddingUrl}
                        className="bg-black px-4 border-2 border-zinc-800 hover:bg-zinc-900 disabled:opacity-50 text-zinc-400 hover:text-white transition-colors hover:border-zinc-600"
                        title="Add URL"
                    >
                        {isAddingUrl ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="application/pdf" 
                        className="hidden" 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAddingFile}
                        className="bg-black px-4 border-2 border-zinc-800 hover:bg-zinc-900 disabled:opacity-50 text-zinc-400 hover:text-white transition-colors hover:border-zinc-600"
                        title="Upload PDF"
                    >
                        {isAddingFile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </button>
                </div>
                
                <div className="space-y-2">
                    {sources.map(src => (
                        <div key={src.id} className="flex items-center gap-3 p-3 bg-zinc-900 border-l-2 border-zinc-800 hover:border-l-lime-400 group transition-all">
                            {src.type === 'url' ? <Link className="w-3 h-3 text-cyan-400" /> : <FileText className="w-3 h-3 text-orange-400" />}
                            <span className="flex-1 text-[10px] font-mono text-zinc-300 truncate font-bold">{src.title}</span>
                            <span className="text-[9px] uppercase text-lime-400 font-black tracking-wider bg-lime-900/20 px-2 py-0.5 border border-lime-900/50">{src.status}</span>
                            <button onClick={() => setSources(s => s.filter(i => i.id !== src.id))} className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {sources.length === 0 && <div className="text-[10px] text-zinc-700 font-mono text-center py-6 border-2 border-dashed border-zinc-900 uppercase tracking-widest">No external knowledge connected</div>}
                </div>
            </div>
        </div>
    );
};

const AgentAnalytics: React.FC<{ sessions: AgentSession[] }> = ({ sessions }) => {
    const totalSessions = sessions.length;
    const sessionsWithLatency = sessions.filter(s => s.avgLatency && s.avgLatency > 0);
    const avgLatencyMs = sessionsWithLatency.length > 0
        ? sessionsWithLatency.reduce((acc, curr) => acc + (curr.avgLatency || 0), 0) / sessionsWithLatency.length
        : 0;
    
    const avgDurationSec = totalSessions > 0
        ? sessions.reduce((acc, curr) => acc + curr.duration, 0) / totalSessions
        : 0;

    const ratedSessions = sessions.filter(s => s.rating);
    const avgRating = ratedSessions.length > 0
        ? ratedSessions.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedSessions.length
        : 0;

    const sentimentData = [
        { name: 'Positive', value: ratedSessions.filter(s => (s.rating || 0) >= 4).length, color: '#a3e635' }, 
        { name: 'Neutral', value: ratedSessions.filter(s => (s.rating || 0) === 3).length, color: '#fbbf24' }, 
        { name: 'Negative', value: ratedSessions.filter(s => (s.rating || 0) <= 2).length, color: '#f87171' }, 
    ];

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
            ? daySessions.filter(s => s.avgLatency).reduce((acc, s) => acc + (s.avgLatency || 0), 0) / daySessions.filter(s => s.avgLatency).length / 1000 
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto pr-2 pb-10 custom-scrollbar">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Avg. Response Time</h3>
                        <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-5xl font-black text-white font-mono tracking-tight mb-2">{(avgLatencyMs / 1000).toFixed(2)}s</div>
                    <div className="text-[10px] text-zinc-600 font-bold font-mono uppercase border-t border-zinc-900 pt-3">Based on {sessionsWithLatency.length} text sessions</div>
                </div>

                <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Avg. Duration</h3>
                        <Clock className="w-5 h-5 text-lime-400" />
                    </div>
                    <div className="text-5xl font-black text-white font-mono tracking-tight mb-2">{formatDuration(avgDurationSec)}</div>
                    <div className="text-[10px] text-zinc-600 font-bold font-mono uppercase border-t border-zinc-900 pt-3">Total {totalSessions} sessions</div>
                </div>

                <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">CSAT Score</h3>
                        <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="text-5xl font-black text-white font-mono tracking-tight mb-2">{avgRating.toFixed(1)}<span className="text-xl text-zinc-600">/5</span></div>
                    <div className="text-[10px] text-zinc-600 font-bold font-mono uppercase border-t border-zinc-900 pt-3">Based on {ratedSessions.length} ratings</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
                    <h3 className="text-xs font-black text-white uppercase mb-8 tracking-[0.2em] flex items-center gap-2">
                        <div className="w-2 h-2 bg-lime-400"></div> Latency & Volume
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" tick={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#52525b" tick={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#000', border: '2px solid #3f3f46', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #fff' }}
                                    itemStyle={{ fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase' }}
                                    cursor={{ fill: '#18181b' }}
                                />
                                <Bar dataKey="conversations" fill="#a3e635" barSize={32} />
                                <Line type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={2} dot={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
                    <h3 className="text-xs font-black text-white uppercase mb-8 tracking-[0.2em] flex items-center gap-2">
                         <div className="w-2 h-2 bg-pink-400"></div> Sentiment Analysis
                    </h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        {ratedSessions.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: '2px solid #3f3f46', color: '#fff' }} itemStyle={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest border-2 border-dashed border-zinc-800 p-8">No ratings recorded</div>
                        )}
                    </div>
                    <div className="flex justify-center gap-6 mt-6">
                        {sentimentData.map((d) => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 border border-black shadow-sm" style={{ backgroundColor: d.color }}></div>
                                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
                <h3 className="text-xs font-black text-white uppercase mb-6 tracking-[0.2em]">Session Logs</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-zinc-800 text-zinc-500 text-[10px] uppercase font-black tracking-[0.1em]">
                                <th className="pb-4 pl-2">Timestamp</th>
                                <th className="pb-4">Agent Name</th>
                                <th className="pb-4">Modality</th>
                                <th className="pb-4">Duration</th>
                                <th className="pb-4">Rating</th>
                                <th className="pb-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-mono text-zinc-300">
                            {sessions.slice().reverse().slice(0, 5).map(session => (
                                <tr key={session.id} className="border-b border-zinc-800 hover:bg-zinc-900 transition-colors group">
                                    <td className="py-5 pl-2 text-zinc-500 font-bold group-hover:text-zinc-300 transition-colors">{new Date(session.startTime).toLocaleString()}</td>
                                    <td className="py-5 text-white font-bold uppercase">{session.agentName}</td>
                                    <td className="py-5">
                                        <span className="bg-black border border-zinc-800 px-2 py-1 text-[9px] uppercase font-bold tracking-wide text-zinc-400">
                                            {session.type}
                                        </span>
                                    </td>
                                    <td className="py-5 text-zinc-400">{formatDuration(session.duration)}</td>
                                    <td className="py-5 text-lime-400 tracking-widest text-sm">
                                        {session.rating ? '★'.repeat(session.rating) + '☆'.repeat(5 - session.rating) : '-'}
                                    </td>
                                    <td className="py-5">
                                        <span className={`px-2 py-1 border text-[9px] uppercase font-bold tracking-wide ${session.status === 'completed' ? 'bg-green-900/10 text-green-400 border-green-900' : 'bg-red-900/10 text-red-400 border-red-900'}`}>
                                            {session.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-700 font-mono text-xs uppercase tracking-widest">No history available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TextAgentBuilder: React.FC<{
    savedConfigs: AgentConfiguration[];
    setSavedConfigs: React.Dispatch<React.SetStateAction<AgentConfiguration[]>>;
    onSessionComplete: (session: AgentSession) => void;
    tenantId: string;
}> = ({ savedConfigs, setSavedConfigs, onSessionComplete, tenantId }) => {
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
            tenantId: tenantId,
            agentName,
            type: 'text',
            startTime: new Date(startTime).toISOString(),
            duration,
            avgLatency,
            rating,
            status: 'completed'
        };

        onSessionComplete(session);
        setMessages([]);
        setSessionId(null);
        setStartTime(null);
        setLatencies([]);
        setShowRating(false);
    };

    return (
        <div className="flex h-full gap-10">
            <div className="w-96 flex flex-col gap-8 shrink-0 overflow-y-auto pr-4 pb-10 custom-scrollbar border-r-2 border-zinc-900">
                <ConfigManager 
                    savedConfigs={savedConfigs} 
                    setSavedConfigs={setSavedConfigs} 
                    onLoad={loadConfig} 
                    currentConfigData={{ tenantId, type: 'text', systemInstruction: instruction, temperature: temp, model, knowledgeSources }}
                    type="text"
                    activeConfigId={activeConfigId}
                    setActiveConfigId={setActiveConfigId}
                    agentName={agentName}
                    tenantId={tenantId}
                />

                <div className="space-y-8">
                     <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Agent Identity</label>
                        <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full bg-black border-2 border-zinc-800 p-4 text-sm text-white font-bold focus:border-lime-400 focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">AI Model</label>
                        <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-black border-2 border-zinc-800 p-4 text-sm text-white font-bold focus:border-lime-400 focus:outline-none transition-colors appearance-none uppercase tracking-wide">
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                            <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Reasoning)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">System Instruction</label>
                        <textarea 
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            className="w-full h-48 bg-black border-2 border-zinc-800 p-4 text-sm text-zinc-300 focus:border-lime-400 focus:outline-none resize-y transition-colors font-mono leading-relaxed"
                            placeholder="Define behavior, tone, and constraints..."
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Creativity (Temp)</label>
                            <span className="text-xs font-mono text-lime-400 font-bold bg-zinc-900 px-2 py-0.5 border border-zinc-800">{temp}</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
                            className="w-full accent-lime-400 bg-zinc-800 h-1.5 appearance-none cursor-pointer rounded-none"
                        />
                    </div>
                    <KnowledgeBaseConfig sources={knowledgeSources} setSources={setKnowledgeSources} />
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-zinc-950 border-2 border-zinc-800 shadow-[8px_8px_0px_0px_#000] h-[750px] relative overflow-hidden">
                {/* Header */}
                <div className="bg-black border-b-2 border-zinc-800 p-6 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full border border-black shadow-sm ${sessionId ? 'bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.5)]' : 'bg-zinc-800'}`}></div>
                         <div className="flex flex-col">
                             <span className="text-sm font-black text-white uppercase tracking-tight">{agentName}</span>
                             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{model}</span>
                         </div>
                    </div>
                    {sessionId && (
                         <button onClick={handleEndSession} className="text-[10px] font-black uppercase bg-red-900/10 text-red-500 border border-red-900/50 px-4 py-2 hover:bg-red-500 hover:text-white transition-all tracking-widest hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                             End Session
                         </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-black/50 scrollbar-thin scrollbar-thumb-zinc-800 relative">
                     <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 font-mono text-xs uppercase tracking-[0.2em] opacity-80">
                            <Bot className="w-16 h-16 mb-6 opacity-30" />
                            System Initialized // Waiting for input
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
                            <div className={`max-w-[80%] p-5 text-sm font-medium leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-zinc-900 text-white border-2 border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' 
                                : 'bg-lime-400 text-black border-2 border-lime-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-black border border-zinc-800 p-4 flex gap-1.5 shadow-md">
                                 <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                                 <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                                 <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-6 bg-black border-t-2 border-zinc-800 flex gap-0 z-10">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-zinc-950 border-2 border-zinc-800 border-r-0 p-5 text-white focus:outline-none focus:border-lime-400 focus:border-r-2 transition-colors font-medium placeholder:text-zinc-700 font-mono"
                        placeholder="ENTER_COMMAND..."
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={!input || isTyping} 
                        className="bg-lime-400 text-black px-8 font-black border-2 border-lime-500 hover:bg-white hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5 stroke-[2.5]" />
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
    tenantId: string;
}> = ({ savedConfigs, setSavedConfigs, onSessionComplete, tenantId }) => {
    // Config
    const [instruction, setInstruction] = useState('You are a helpful voice assistant.');
    const [voiceName, setVoiceName] = useState('Puck');
    const [temp, setTemp] = useState(0.7);
    const [pitch, setPitch] = useState(0);
    const [speakingRate, setSpeakingRate] = useState(1.0);
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

            setSessionId(Date.now().toString());
            setStartTime(Date.now());

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    generationConfig: {
                        temperature: temp,
                    },
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

            closeSessionRef.current = () => {
                sessionPromise.then(s => s.close());
                inputAudioContext.close();
                outputAudioContext.close();
                stream.getTracks().forEach(t => t.stop());
                handleDisconnect(); 
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
            tenantId: tenantId,
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
        setTemp(c.temperature || 0.7);
        setPitch(c.pitch || 0);
        setSpeakingRate(c.speakingRate || 1.0);
        setKnowledgeSources(c.knowledgeSources);
        setAgentName(c.name);
        setActiveConfigId(c.id);
    };

    return (
        <div className="flex h-full gap-10">
            <div className="w-96 flex flex-col gap-8 shrink-0 overflow-y-auto pr-4 pb-10 custom-scrollbar border-r-2 border-zinc-900">
                 <ConfigManager 
                    savedConfigs={savedConfigs} 
                    setSavedConfigs={setSavedConfigs} 
                    onLoad={loadConfig} 
                    currentConfigData={{ 
                        tenantId,
                        type: 'voice', 
                        systemInstruction: instruction, 
                        temperature: temp, 
                        voiceName, 
                        knowledgeSources,
                        pitch,
                        speakingRate
                    }}
                    type="voice"
                    activeConfigId={activeConfigId}
                    setActiveConfigId={setActiveConfigId}
                    agentName={agentName}
                    tenantId={tenantId}
                />
                 <div className="space-y-8">
                     <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Agent Name</label>
                        <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full bg-black border-2 border-zinc-800 p-4 text-sm text-white font-bold focus:border-lime-400 focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Voice Model</label>
                        <select value={voiceName} onChange={e => setVoiceName(e.target.value)} className="w-full bg-black border-2 border-zinc-800 p-4 text-sm text-white font-bold focus:border-lime-400 transition-colors uppercase tracking-wide">
                            <option value="Puck">Puck (Male, Smooth)</option>
                            <option value="Charon">Charon (Male, Deep)</option>
                            <option value="Kore">Kore (Female, Warm)</option>
                            <option value="Fenrir">Fenrir (Male, Energetic)</option>
                            <option value="Zephyr">Zephyr (Female, Calm)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">System Instruction</label>
                        <textarea 
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            className="w-full h-36 bg-black border-2 border-zinc-800 p-4 text-sm text-zinc-300 focus:border-lime-400 focus:outline-none resize-y transition-colors leading-relaxed font-mono"
                            placeholder="Define persona..."
                        />
                    </div>
                    
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 pb-4 border-b-2 border-zinc-800">
                             <Settings2 className="w-4 h-4 text-lime-400" />
                             <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Voice Parameters</span>
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-3">
                                <span>Creativity</span>
                                <span className="text-lime-400 font-mono">{temp}</span>
                            </div>
                            <input 
                                type="range" min="0" max="1" step="0.1" 
                                value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
                                className="w-full accent-lime-400 bg-zinc-800 h-1.5 appearance-none rounded-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-3">
                                <span>Pitch</span>
                                <span className="text-cyan-400 font-mono">{pitch}</span>
                            </div>
                            <input 
                                type="range" min="-20" max="20" step="1" 
                                value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))}
                                className="w-full accent-cyan-400 bg-zinc-800 h-1.5 appearance-none rounded-none cursor-pointer"
                            />
                        </div>

                         <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-3">
                                <span>Speed</span>
                                <span className="text-pink-400 font-mono">{speakingRate}x</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="2.0" step="0.1" 
                                value={speakingRate} onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                                className="w-full accent-pink-400 bg-zinc-800 h-1.5 appearance-none rounded-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <KnowledgeBaseConfig sources={knowledgeSources} setSources={setKnowledgeSources} />
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-black border-2 border-zinc-800 shadow-[8px_8px_0px_0px_#000] h-[750px] relative overflow-hidden">
                {/* Visualizer Background */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 pointer-events-none opacity-20">
                     {[...Array(16)].map((_, i) => (
                         <div 
                            key={i} 
                            className="w-4 bg-lime-400 transition-all duration-75 rounded-none"
                            style={{ height: `${Math.max(5, Math.random() * (isConnected ? audioVolume * 4 + 10 : 5))}%` }}
                         />
                     ))}
                </div>

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className={`w-48 h-48 border-[6px] flex items-center justify-center mb-12 transition-all duration-300 relative ${isConnected ? 'border-lime-400 shadow-[0_0_60px_rgba(163,230,53,0.2)] bg-black' : 'border-zinc-800 bg-zinc-950'}`}>
                        {isConnected && (
                             <div className="absolute inset-0 border-[6px] border-lime-400 animate-ping opacity-30"></div>
                        )}
                        {isConnected ? <Mic2 className="w-20 h-20 text-lime-400 animate-pulse" /> : <Mic className="w-20 h-20 text-zinc-800" />}
                    </div>
                    
                    <h2 className="text-5xl font-black text-white uppercase mb-6 tracking-tighter">{isConnected ? 'Link Active' : 'Offline'}</h2>
                    <p className="text-zinc-500 font-mono text-sm max-w-md mb-16 uppercase tracking-wide">
                        {isConnected 
                            ? "Voice Channel Open. Latency < 200ms." 
                            : "Initialize Gemini Live API connection to begin real-time voice session."}
                    </p>

                    {error && (
                        <div className="mb-10 flex items-center gap-3 text-red-500 text-xs font-black uppercase bg-red-950/20 px-8 py-4 border-2 border-red-900 shadow-md tracking-wider">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {!isConnected ? (
                        <button 
                            onClick={connectLive}
                            className="bg-lime-400 text-black px-12 py-6 font-black uppercase tracking-[0.2em] text-lg border-2 border-lime-500 hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-[4px_4px_0px_0px_rgba(163,230,53,0.5)] shadow-[10px_10px_0px_0px_rgba(163,230,53,0.3)] transition-all flex items-center gap-4 active:translate-y-[8px] active:translate-x-[8px] active:shadow-none"
                        >
                            <Activity className="w-6 h-6 stroke-[3]" />
                            Connect
                        </button>
                    ) : (
                        <button 
                            onClick={() => closeSessionRef.current?.()} 
                            className="bg-red-600 text-white px-12 py-6 font-black uppercase tracking-[0.2em] text-lg border-2 border-red-700 hover:bg-red-500 transition-all flex items-center gap-4 shadow-[8px_8px_0px_0px_#7f1d1d] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none active:translate-y-[6px] active:translate-x-[6px]"
                        >
                            <Square className="w-6 h-6 fill-current" />
                            Terminate
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

interface ConversationsProps {
  tenantId: string;
}

export const Conversations: React.FC<ConversationsProps> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'analytics'>('text');
  const [savedConfigs, setSavedConfigs] = useLocalStorage<AgentConfiguration[]>('agent_configs', INITIAL_AGENT_CONFIGS);
  const [sessions, setSessions] = useLocalStorage<AgentSession[]>('agent_sessions', []);
  const tenantSessions = sessions.filter(s => s.tenantId === tenantId);

  const handleSessionComplete = (newSession: AgentSession) => {
      setSessions(prev => [...prev, newSession]);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000] flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">AI Agents</h2>
           <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Autonomous Workforce</p>
        </div>
        <div className="flex bg-black border-2 border-zinc-800 p-1.5 shadow-sm">
            <button 
                onClick={() => setActiveTab('text')}
                className={`px-8 py-3 font-black uppercase text-xs flex items-center gap-2 transition-all tracking-wider ${activeTab === 'text' ? 'bg-lime-400 text-black shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <MessageSquare className="w-4 h-4" /> Text
            </button>
            <button 
                onClick={() => setActiveTab('voice')}
                className={`px-8 py-3 font-black uppercase text-xs flex items-center gap-2 transition-all tracking-wider ${activeTab === 'voice' ? 'bg-lime-400 text-black shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <Mic2 className="w-4 h-4" /> Voice
            </button>
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-8 py-3 font-black uppercase text-xs flex items-center gap-2 transition-all tracking-wider ${activeTab === 'analytics' ? 'bg-lime-400 text-black shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <BarChart3 className="w-4 h-4" /> Analytics
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
          {activeTab === 'text' && <TextAgentBuilder savedConfigs={savedConfigs} setSavedConfigs={setSavedConfigs} onSessionComplete={handleSessionComplete} tenantId={tenantId} />}
          {activeTab === 'voice' && <VoiceAgentBuilder savedConfigs={savedConfigs} setSavedConfigs={setSavedConfigs} onSessionComplete={handleSessionComplete} tenantId={tenantId} />}
          {activeTab === 'analytics' && <AgentAnalytics sessions={tenantSessions} />}
      </div>
    </div>
  );
};
