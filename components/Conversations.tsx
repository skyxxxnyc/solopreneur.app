
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat, GenerateContentResponse } from '@google/genai';
import { Bot, Mic, Square, Send, MessageSquare, Radio, Mic2, Settings2, Sliders, Database, Link, FileText, Upload, Trash2, RefreshCw, Plus, Save, ChevronDown, Download, Volume2, Gauge, Activity, CheckCircle2, Fingerprint } from 'lucide-react';
import { ChatMessage, KnowledgeSource, AgentConfiguration } from '../types';
import { INITIAL_AGENT_CONFIGS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- UTILS FOR LIVE API ---
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

const ConfigManager: React.FC<{
    savedConfigs: AgentConfiguration[];
    setSavedConfigs: React.Dispatch<React.SetStateAction<AgentConfiguration[]>>;
    onLoad: (config: AgentConfiguration) => void;
    currentConfigData: Omit<AgentConfiguration, 'id' | 'name'>;
    type: 'text' | 'voice';
}> = ({ savedConfigs, setSavedConfigs, onLoad, currentConfigData, type }) => {
    const [newConfigName, setNewConfigName] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSave = () => {
        if (!newConfigName) return;
        const newConfig: AgentConfiguration = {
            id: Date.now().toString(),
            name: newConfigName,
            ...currentConfigData
        };
        setSavedConfigs(prev => [...prev, newConfig]);
        setNewConfigName('');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedConfigs(prev => prev.filter(c => c.id !== id));
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
                    <div className="flex gap-2">
                        <input 
                            value={newConfigName}
                            onChange={(e) => setNewConfigName(e.target.value)}
                            placeholder="Name current setup..."
                            className="flex-1 bg-zinc-950 border border-zinc-700 p-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                        />
                        <button 
                            onClick={handleSave}
                            disabled={!newConfigName}
                            className="bg-zinc-800 text-lime-400 p-2 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredConfigs.map(config => (
                            <div 
                                key={config.id} 
                                onClick={() => onLoad(config)}
                                className="group flex justify-between items-center p-2 bg-zinc-900 border border-zinc-800 hover:border-lime-400 cursor-pointer text-xs"
                            >
                                <span className="font-bold text-zinc-300">{config.name}</span>
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


// --- TEXT AGENT BUILDER ---

const TextAgentBuilder = () => {
  const [messages