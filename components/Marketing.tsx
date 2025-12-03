

import React, { useState, useRef, useEffect } from 'react';
import { EmailCampaign, Contact, EmailTemplate } from '../types';
import { Send, Plus, BarChart3, Mail, Users, CheckCircle, Clock, Wand2, Loader2, LayoutTemplate, FileText, Bold, Italic, Underline, List, Heading1, AlignLeft, Type, Trash2, Edit, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Link, Split, Trophy, Beaker } from 'lucide-react';
import { generateMarketingCampaign } from '../services/geminiService';
import { INITIAL_TEMPLATES } from '../constants';

interface MarketingProps {
  campaigns: EmailCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<EmailCampaign[]>>;
  contacts: Contact[];
}

const RichTextEditor: React.FC<{ 
    value: string; 
    onChange: (val: string) => void;
    placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync external value changes to innerHTML only if different to avoid cursor jumps
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
             editorRef.current.innerHTML = value;
        }
    }, [value]);

    const execCmd = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="flex flex-col border-2 border-zinc-800 bg-zinc-950">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-zinc-900 border-b-2 border-zinc-800 flex-wrap">
                <button onClick={() => execCmd('bold')} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-lime-400 rounded-none transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                <button onClick={() => execCmd('italic')} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-lime-400 rounded-none transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                <button onClick={() => execCmd('underline')} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-lime-400 rounded-none transition-colors" title="Underline"><Underline className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-zinc-700 mx-1"></div>
                <button onClick={() => execCmd('formatBlock', 'H1')} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-lime-400 rounded-none transition-colors" title="Headline"><Heading1 className="w-4 h-4" /></button>
                <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-lime-400 rounded-none transition-colors" title="Bullet List"><List className="w-4 h-4" /></button>
            </div>
            
            {/* Editor */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="flex-1 min-h-[300px] p-4 text-zinc-300 font-mono text-sm leading-relaxed focus:outline-none focus:bg-zinc-900/30 transition-colors overflow-y-auto"
            />
            {(!value && placeholder) && (
                <div className="absolute top-[130px] left-8 pointer-events-none text-zinc-600 font-mono text-sm italic">
                    {placeholder}
                </div>
            )}
        </div>
    );
};

const CalendarInput: React.FC<{
    selectedDate: Date;
    onChange: (date: Date) => void;
}> = ({ selectedDate, onChange }) => {
    const [viewDate, setViewDate] = useState(selectedDate);
    const [showCalendar, setShowCalendar] = useState(false);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleDateClick = (day: number) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(viewDate.getFullYear());
        newDate.setMonth(viewDate.getMonth());
        newDate.setDate(day);
        onChange(newDate);
        setShowCalendar(false);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newDate = new Date(selectedDate);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

    const formatTime = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    return (
        <div className="relative">
            <div className="flex gap-4">
                <button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center gap-2 bg-zinc-950 border-2 border-zinc-800 px-4 py-2 text-white font-bold hover:border-lime-400 transition-colors"
                >
                    <CalendarIcon className="w-4 h-4 text-zinc-400" />
                    <span>{selectedDate.toLocaleDateString()}</span>
                </button>
                <div className="flex items-center gap-2 bg-zinc-950 border-2 border-zinc-800 px-4 py-2 text-white font-bold focus-within:border-lime-400 transition-colors">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <input 
                        type="time" 
                        value={formatTime(selectedDate)}
                        onChange={handleTimeChange}
                        className="bg-transparent focus:outline-none text-white font-mono"
                    />
                </div>
            </div>

            {showCalendar && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-zinc-950 border-2 border-zinc-800 shadow-[4px_4px_0px_0px_#27272a] z-50 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-black uppercase text-sm">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S','M','T','W','T','F','S'].map(d => (
                            <div key={d} className="text-center text-[10px] text-zinc-600 font-bold">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear();
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        h-8 w-8 flex items-center justify-center text-xs font-bold border border-transparent transition-colors
                                        ${isSelected ? 'bg-lime-400 text-black border-lime-400' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const Marketing: React.FC<MarketingProps> = ({ campaigns, setCampaigns, contacts }) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  
  // Campaign State
  const [isComposing, setIsComposing] = useState(false);
  
  // A/B Testing State
  const [isABTestMode, setIsABTestMode] = useState(false);
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A');

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  const [subjectB, setSubjectB] = useState('');
  const [bodyB, setBodyB] = useState('');

  const [audience, setAudience] = useState('All Contacts');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('Professional & Direct');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  
  // CRM Sync State
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [isSyncingAudience, setIsSyncingAudience] = useState(false);

  // Template State
  const [templates, setTemplates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateAiPrompt, setTemplateAiPrompt] = useState('');
  const [templateAiTone, setTemplateAiTone] = useState('Professional & Direct');
  const [isTemplateGenerating, setIsTemplateGenerating] = useState(false);

  // --- Actions ---

  const handleCreateCampaign = () => {
    const isNow = scheduledDate.getTime() <= Date.now() + 60000; // Within a minute counts as now

    const newCampaign: EmailCampaign = {
        id: Date.now().toString(),
        subject: subject || 'New Campaign',
        status: isNow ? 'sent' : 'scheduled',
        audience,
        sentAt: scheduledDate.toLocaleString(),
        stats: { sent: 0, opened: 0, clicked: 0 },
        isABTest: isABTestMode,
        variantB: isABTestMode ? { subject: subjectB, body: bodyB } : undefined,
        statsB: isABTestMode ? { sent: 0, opened: 0, clicked: 0 } : undefined,
        winner: isABTestMode ? 'pending' : undefined
    };

    if (newCampaign.status === 'sent') {
        const totalAudience = audience === 'All Contacts' ? contacts.length : Math.floor(Math.random() * contacts.length) + 10;
        
        if (isABTestMode) {
            const split = Math.floor(totalAudience / 2);
            newCampaign.stats.sent = split;
            newCampaign.statsB = { sent: split, opened: 0, clicked: 0 };
            
            // Simulate random performance
            newCampaign.stats.opened = Math.floor(split * (0.2 + Math.random() * 0.2));
            newCampaign.statsB!.opened = Math.floor(split * (0.2 + Math.random() * 0.2));
            
            newCampaign.stats.clicked = Math.floor(newCampaign.stats.opened * 0.1);
            newCampaign.statsB!.clicked = Math.floor(newCampaign.statsB!.opened * 0.1);

            // Determine winner
            if (newCampaign.stats.opened > newCampaign.statsB!.opened) newCampaign.winner = 'A';
            else if (newCampaign.statsB!.opened > newCampaign.stats.opened) newCampaign.winner = 'B';
            else newCampaign.winner = 'tie';

        } else {
            newCampaign.stats.sent = totalAudience;
        }
    }

    setCampaigns([newCampaign, ...campaigns]);
    setIsComposing(false);
    
    // Reset States
    setSubject('');
    setBody('');
    setSubjectB('');
    setBodyB('');
    setIsABTestMode(false);
    setActiveVariant('A');
    setAiPrompt('');
    setScheduledDate(new Date());
    setAudienceCount(null);
  };

  const handleGenerateCampaign = async () => {
      if (!aiPrompt.trim()) return;
      setIsGenerating(true);
      const { subject: newSubject, body: newBody } = await generateMarketingCampaign(aiPrompt, aiTone);
      
      if (activeVariant === 'A') {
          if (newSubject) setSubject(newSubject);
          if (newBody) setBody(newBody);
      } else {
          if (newSubject) setSubjectB(newSubject);
          if (newBody) setBodyB(newBody);
      }
      setIsGenerating(false);
  };

  const handleSyncAudience = () => {
      setIsSyncingAudience(true);
      setAudienceCount(null);
      // Simulate API verification/sync
      setTimeout(() => {
          let count = 0;
          const filterValue = audience.toLowerCase();
          
          if (filterValue.includes('all contacts')) {
              count = contacts.length;
          } else if (filterValue.includes('tag:')) {
              const tag = audience.split(':')[1].trim().toLowerCase();
              count = contacts.filter(c => c.tags.some(t => t.toLowerCase() === tag)).length;
          }
          setAudienceCount(count);
          setIsSyncingAudience(false);
      }, 600);
  };

  const handleGenerateTemplate = async () => {
      if (!templateAiPrompt.trim()) return;
      setIsTemplateGenerating(true);
      const { subject: newSubject, body: newBody } = await generateMarketingCampaign(templateAiPrompt, templateAiTone);
      if (newSubject) setTemplateSubject(newSubject);
      if (newBody) setTemplateBody(newBody);
      setIsTemplateGenerating(false);
  };

  const handleSaveTemplate = () => {
      if (!templateName) return;

      const newTemplate: EmailTemplate = {
          id: editingTemplateId || Date.now().toString(),
          name: templateName,
          subject: templateSubject,
          body: templateBody,
          lastModified: new Date().toLocaleDateString()
      };

      if (editingTemplateId) {
          setTemplates(prev => prev.map(t => t.id === editingTemplateId ? newTemplate : t));
      } else {
          setTemplates(prev => [newTemplate, ...prev]);
      }
      
      setIsEditingTemplate(false);
      setEditingTemplateId(null);
      setTemplateName('');
      setTemplateSubject('');
      setTemplateBody('');
      setTemplateAiPrompt('');
  };

  const handleEditTemplate = (t: EmailTemplate) => {
      setEditingTemplateId(t.id);
      setTemplateName(t.name);
      setTemplateSubject(t.subject);
      setTemplateBody(t.body);
      setTemplateAiPrompt('');
      setIsEditingTemplate(true);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm("Delete this template?")) {
          setTemplates(prev => prev.filter(t => t.id !== id));
      }
  };

  const handleLoadTemplateToCampaign = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const tId = e.target.value;
      if (!tId) return;
      const t = templates.find(temp => temp.id === tId);
      if (t) {
          if (activeVariant === 'A') {
              if (t.subject) setSubject(t.subject);
              if (t.body) setBody(t.body);
          } else {
              if (t.subject) setSubjectB(t.subject);
              if (t.body) setBodyB(t.body);
          }
      }
  };

  // --- Renderers ---

  if (isComposing) {
      return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
             <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Compose Campaign</h2>
                    <p className="text-zinc-500 font-mono text-sm">Design your email blast.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => {
                            setIsABTestMode(!isABTestMode);
                            if (!isABTestMode) setActiveVariant('A');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 border-2 text-xs font-bold uppercase transition-all ${isABTestMode ? 'bg-zinc-800 border-cyan-400 text-cyan-400' : 'bg-zinc-950 border-zinc-700 text-zinc-500'}`}
                    >
                        <Split className="w-4 h-4" />
                        {isABTestMode ? 'A/B Test Enabled' : 'Enable A/B Test'}
                    </button>
                    <button onClick={() => { setIsComposing(false); setAudienceCount(null); setIsABTestMode(false); }} className="text-zinc-500 hover:text-white font-bold uppercase text-sm">Cancel</button>
                </div>
            </div>

            <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 p-8 shadow-[4px_4px_0px_0px_#27272a] overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Tools Row */}
                    <div className="flex gap-4">
                        {/* AI Generator Section */}
                        <div className="flex-1 bg-zinc-950 border border-zinc-700 p-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                            <h3 className="text-xs font-black text-purple-400 uppercase mb-2 flex items-center gap-2">
                                <Wand2 className="w-3 h-3" /> AI Content Generator {isABTestMode && `(${activeVariant})`}
                            </h3>
                            <div className="flex gap-2">
                                <select 
                                    value={aiTone}
                                    onChange={(e) => setAiTone(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-700 p-2 text-white text-xs font-bold focus:border-purple-400 focus:outline-none w-32"
                                >
                                    <option>Professional</option>
                                    <option>Urgent</option>
                                    <option>Friendly</option>
                                    <option>Sales-heavy</option>
                                    <option>Minimalist</option>
                                </select>
                                <input
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder={`Generate content for Variant ${activeVariant}...`}
                                    className="flex-1 bg-zinc-900 border border-zinc-700 p-2 text-white text-sm focus:border-purple-400 focus:outline-none"
                                />
                                <button
                                    onClick={handleGenerateCampaign}
                                    disabled={isGenerating || !aiPrompt}
                                    className="px-4 py-2 bg-purple-500 text-black font-bold uppercase text-xs hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    {isGenerating ? 'Working...' : 'Generate'}
                                </button>
                            </div>
                        </div>

                        {/* Template Loader */}
                        <div className="w-64 bg-zinc-950 border border-zinc-700 p-4 relative">
                             <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
                             <h3 className="text-xs font-black text-cyan-400 uppercase mb-2 flex items-center gap-2">
                                <LayoutTemplate className="w-3 h-3" /> Load Template {isABTestMode && `(${activeVariant})`}
                            </h3>
                            <select 
                                onChange={handleLoadTemplateToCampaign}
                                className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled>Select a template...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* A/B Tabs */}
                    {isABTestMode && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveVariant('A')}
                                className={`px-6 py-2 font-bold uppercase text-sm border-t-2 border-x-2 ${activeVariant === 'A' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                            >
                                Variant A
                            </button>
                            <button 
                                onClick={() => setActiveVariant('B')}
                                className={`px-6 py-2 font-bold uppercase text-sm border-t-2 border-x-2 ${activeVariant === 'B' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                            >
                                Variant B
                            </button>
                        </div>
                    )}

                    {/* Email Details */}
                    <div className="space-y-4 bg-zinc-950 p-6 border border-zinc-800">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Subject Line {isABTestMode && `(${activeVariant})`}</label>
                            <input 
                                value={activeVariant === 'A' ? subject : subjectB}
                                onChange={(e) => activeVariant === 'A' ? setSubject(e.target.value) : setSubjectB(e.target.value)}
                                className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 text-white font-bold focus:border-lime-400 focus:outline-none"
                                placeholder="Enter an attention-grabbing subject..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email Body {isABTestMode && `(${activeVariant})`}</label>
                            <RichTextEditor 
                                value={activeVariant === 'A' ? body : bodyB}
                                onChange={(val) => activeVariant === 'A' ? setBody(val) : setBodyB(val)}
                                placeholder="Start writing your campaign..."
                            />
                        </div>
                    </div>

                    {/* Sending Options */}
                    <div className="grid grid-cols-2 gap-6">
                         <div className="bg-zinc-950 border border-zinc-800 p-4">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Audience Segment</label>
                            <div className="flex gap-2">
                                <select 
                                    value={audience}
                                    onChange={(e) => { setAudience(e.target.value); setAudienceCount(null); }}
                                    className="flex-1 bg-zinc-900 border-2 border-zinc-800 p-3 text-white text-sm focus:border-lime-400 focus:outline-none"
                                >
                                    <option>All Contacts</option>
                                    <option>Tag: new-lead</option>
                                    <option>Tag: customer</option>
                                    <option>Tag: design</option>
                                    <option>Tag: high-ticket</option>
                                    <option>Tag: referral</option>
                                </select>
                                <button 
                                    onClick={handleSyncAudience}
                                    disabled={isSyncingAudience}
                                    className="flex items-center justify-center bg-zinc-800 border-2 border-zinc-700 text-zinc-300 w-12 hover:border-lime-400 hover:text-lime-400 transition-colors"
                                    title="Connect CRM"
                                >
                                    {isSyncingAudience ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link className="w-5 h-5" />}
                                </button>
                            </div>
                            {audienceCount !== null && (
                                <div className="mt-2 text-xs font-mono text-lime-400 flex items-center gap-1 animate-in fade-in">
                                    <CheckCircle className="w-3 h-3" />
                                    {audienceCount} contacts connected
                                </div>
                            )}
                        </div>

                         <div className="bg-zinc-950 border border-zinc-800 p-4">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Schedule Send</label>
                            <CalendarInput 
                                selectedDate={scheduledDate}
                                onChange={setScheduledDate}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t-2 border-zinc-800">
                        <button 
                            onClick={handleCreateCampaign}
                            disabled={!subject || !body}
                            className="flex items-center gap-2 bg-lime-400 text-black px-8 py-4 font-black text-lg border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[6px_6px_0px_0px_#27272a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                            {scheduledDate.getTime() > Date.now() + 60000 ? 'SCHEDULE CAMPAIGN' : 'SEND CAMPAIGN'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // TEMPLATE EDITOR
  if (isEditingTemplate) {
      return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Template Editor</h2>
                    <p className="text-zinc-500 font-mono text-sm">Design reusable email layouts.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setIsEditingTemplate(false)} className="text-zinc-500 hover:text-white font-bold uppercase text-sm">Cancel</button>
                    <button 
                        onClick={handleSaveTemplate}
                        className="flex items-center gap-2 bg-lime-400 text-black px-6 py-2 font-bold border-2 border-lime-500 hover:shadow-[4px_4px_0px_0px_#3f3f46] hover:translate-y-[-2px] transition-all"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Save Template
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-zinc-900 border-2 border-zinc-800 shadow-[4px_4px_0px_0px_#27272a]">
                 <div className="max-w-4xl mx-auto space-y-6">
                     
                     {/* AI Template Gen */}
                     <div className="bg-zinc-950 border border-zinc-700 p-4 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
                        <h3 className="text-xs font-black text-cyan-400 uppercase mb-2 flex items-center gap-2">
                            <Wand2 className="w-3 h-3" /> AI Template Builder
                        </h3>
                        <div className="flex gap-2">
                             <select 
                                value={templateAiTone}
                                onChange={(e) => setTemplateAiTone(e.target.value)}
                                className="bg-zinc-900 border border-zinc-700 p-2 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none w-32"
                            >
                                <option>Professional</option>
                                <option>Urgent</option>
                                <option>Friendly</option>
                                <option>Sales-heavy</option>
                                <option>Minimalist</option>
                            </select>
                            <input
                                value={templateAiPrompt}
                                onChange={(e) => setTemplateAiPrompt(e.target.value)}
                                placeholder="Describe the template structure..."
                                className="flex-1 bg-zinc-900 border border-zinc-700 p-2 text-white text-sm focus:border-cyan-400 focus:outline-none"
                            />
                            <button
                                onClick={handleGenerateTemplate}
                                disabled={isTemplateGenerating || !templateAiPrompt}
                                className="px-4 py-2 bg-cyan-500 text-black font-bold uppercase text-xs hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isTemplateGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                Generate
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Template Name</label>
                        <input 
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="w-full bg-zinc-950 border-2 border-zinc-800 p-3 text-white font-bold focus:border-lime-400 focus:outline-none"
                            placeholder="e.g. Monthly Newsletter"
                        />
                    </div>

                    <div className="p-6 border-2 border-zinc-800 bg-zinc-950 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Default Subject</label>
                            <input 
                                value={templateSubject}
                                onChange={(e) => setTemplateSubject(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-lime-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Content</label>
                            <RichTextEditor 
                                value={templateBody}
                                onChange={setTemplateBody}
                                placeholder="Design your template..."
                            />
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      );
  }

  // LIST VIEWS
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 flex justify-between items-center bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Marketing Suite</h2>
           <p className="text-zinc-500 font-mono text-sm">Campaigns, automations, and broadcasts.</p>
        </div>
        <div className="flex gap-4 items-center">
            {/* Tab Switcher */}
            <div className="flex bg-zinc-950 border-2 border-zinc-800 p-1">
                <button 
                    onClick={() => setActiveTab('campaigns')}
                    className={`px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 transition-all ${activeTab === 'campaigns' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                    <Mail className="w-4 h-4" /> Campaigns
                </button>
                <button 
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 transition-all ${activeTab === 'templates' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                    <LayoutTemplate className="w-4 h-4" /> Templates
                </button>
            </div>

            <button 
                onClick={() => {
                    if (activeTab === 'campaigns') setIsComposing(true);
                    else {
                        setIsEditingTemplate(true);
                        setEditingTemplateId(null);
                        setTemplateName('');
                        setTemplateSubject('');
                        setTemplateBody('');
                    }
                }}
                className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 font-bold border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] transition-all"
            >
                <Plus className="w-5 h-5" />
                {activeTab === 'campaigns' ? 'NEW CAMPAIGN' : 'NEW TEMPLATE'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-4">
        {activeTab === 'campaigns' ? (
            // CAMPAIGN LIST
            <>
                {campaigns.length === 0 && <div className="text-center text-zinc-500 mt-10 font-mono">No campaigns yet. Start one!</div>}
                {campaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] hover:border-zinc-600 transition-colors group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-white">{campaign.subject}</h3>
                                    {campaign.isABTest && (
                                        <span className="flex items-center gap-1 bg-zinc-800 text-cyan-400 border border-cyan-500/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                                            <Split className="w-3 h-3" /> A/B Test
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                                        campaign.status === 'sent' ? 'bg-lime-900/30 text-lime-400 border-lime-900' : 
                                        campaign.status === 'scheduled' ? 'bg-orange-900/30 text-orange-400 border-orange-900' :
                                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                                    }`}>
                                        {campaign.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {campaign.sentAt}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.audience}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 border-t-2 border-zinc-800 pt-4">
                             {/* Stats A */}
                             <div className="space-y-1">
                                 <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-2">
                                     {campaign.isABTest ? "Variant A Sent" : "Sent"}
                                 </div>
                                 <div className="text-xl font-mono text-white">{campaign.stats.sent}</div>
                             </div>
                             <div className="space-y-1">
                                 <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-2">
                                    {campaign.isABTest ? "Variant A Open Rate" : "Open Rate"}
                                    {campaign.winner === 'A' && <Trophy className="w-3 h-3 text-lime-400" />}
                                 </div>
                                 <div className="text-xl font-mono text-lime-400">
                                     {campaign.stats.sent > 0 ? Math.round((campaign.stats.opened / campaign.stats.sent) * 100) : 0}%
                                 </div>
                             </div>
                             <div className="space-y-1">
                                 <div className="text-[10px] text-zinc-500 uppercase font-bold">Click Rate</div>
                                 <div className="text-xl font-mono text-cyan-400">
                                     {campaign.stats.opened > 0 ? Math.round((campaign.stats.clicked / campaign.stats.opened) * 100) : 0}%
                                 </div>
                             </div>

                             {/* Stats B (If A/B Test) */}
                             {campaign.isABTest && campaign.statsB && (
                                 <>
                                     <div className="space-y-1 border-t border-dashed border-zinc-800 pt-2">
                                         <div className="text-[10px] text-zinc-500 uppercase font-bold">Variant B Sent</div>
                                         <div className="text-xl font-mono text-white">{campaign.statsB.sent}</div>
                                     </div>
                                     <div className="space-y-1 border-t border-dashed border-zinc-800 pt-2">
                                         <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-2">
                                            Variant B Open Rate
                                            {campaign.winner === 'B' && <Trophy className="w-3 h-3 text-lime-400" />}
                                         </div>
                                         <div className="text-xl font-mono text-lime-400">
                                              {campaign.statsB.sent > 0 ? Math.round((campaign.statsB.opened / campaign.statsB.sent) * 100) : 0}%
                                         </div>
                                     </div>
                                     <div className="space-y-1 border-t border-dashed border-zinc-800 pt-2">
                                         <div className="text-[10px] text-zinc-500 uppercase font-bold">Click Rate</div>
                                         <div className="text-xl font-mono text-cyan-400">
                                              {campaign.statsB.opened > 0 ? Math.round((campaign.statsB.clicked / campaign.statsB.opened) * 100) : 0}%
                                         </div>
                                     </div>
                                     
                                     {/* A/B Details Row */}
                                     <div className="col-span-3 mt-2 bg-zinc-950 p-3 border border-zinc-800 text-xs text-zinc-400 font-mono">
                                         <span className="text-cyan-400 font-bold mr-2">[VARIANT B SUBJECT]:</span> 
                                         {campaign.variantB?.subject}
                                     </div>
                                 </>
                             )}
                        </div>
                    </div>
                ))}
            </>
        ) : (
            // TEMPLATE LIST
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] hover:border-zinc-600 transition-colors flex flex-col h-64 group relative">
                         <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEditTemplate(template)} className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                             <button onClick={(e) => handleDeleteTemplate(template.id, e)} className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 pr-12">{template.name}</h3>
                         <div className="text-xs text-zinc-500 font-mono mb-4">Last Modified: {template.lastModified}</div>
                         
                         <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 overflow-hidden">
                             <div className="text-[10px] text-zinc-400 font-mono line-clamp-6 opacity-70" dangerouslySetInnerHTML={{ __html: template.body }}></div>
                         </div>
                         
                         <button 
                             onClick={() => handleEditTemplate(template)}
                             className="mt-4 w-full py-2 bg-zinc-800 text-zinc-300 font-bold uppercase text-xs border border-zinc-700 hover:bg-lime-400 hover:text-black hover:border-lime-400 transition-colors"
                         >
                             Use Template
                         </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
