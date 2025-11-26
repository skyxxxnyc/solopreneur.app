
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
}> = ({ savedConfigs, setSavedConfigs, onLoad, currentConfigData }) => {
    const [newConfigName, setNewConfigName] = useState('');
    const [