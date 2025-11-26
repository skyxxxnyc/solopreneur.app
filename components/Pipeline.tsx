import React, { useState } from 'react';
import { Contact, StageId } from '../types';
import { PIPELINE_STAGES } from '../constants';
import { Plus, GripVertical, Loader2 } from 'lucide-react';
import { generateLeads } from '../services/geminiService';

interface PipelineProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export const Pipeline: React.FC<PipelineProps> = ({ contacts, setContacts }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    setDraggedContactId(contactId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    if (!draggedContactId) return;

    setContacts((prev) =>
      prev.map((c) =>
        c.id === draggedContactId ? { ...c, stage: stageId } : c
      )
    );
    setDraggedContactId(null);
  };

  const handleGenerateLeads = async () => {
    setIsGenerating(true);
    const newLeads = await generateLeads(3);
    if (newLeads.length > 0) {
      setContacts((prev) => [...prev, ...newLeads]);
    }
    setIsGenerating(false);
  };

  const getContactsByStage = (stage: StageId) => contacts.filter((c) => c.stage === stage);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-900 border-2 border-zinc-800 p-4 shadow-[4px_4px_0px_0px_#27272a]">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight uppercase">Opportunities</h2>
           <p className="text-zinc-500 font-mono text-sm">Drag cards to move stages</p>
        </div>
        <button
          onClick={handleGenerateLeads}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 font-bold border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {isGenerating ? 'AI WORKING...' : 'ADD LEADS (AI)'}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1200px]">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.id}
              className={`flex-1 min-w-[300px] flex flex-col bg-zinc-900/50 border-2 border-zinc-800 ${
                draggedContactId ? 'border-dashed' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={`p-4 border-b-2 border-zinc-800 bg-zinc-900 ${stage.color} border-l-4`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-zinc-100 uppercase tracking-wide">{stage.title}</h3>
                  <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 font-mono rounded-none border border-zinc-700">
                    {getContactsByStage(stage.id).length}
                  </span>
                </div>
                <div className="text-zinc-500 text-xs font-mono">
                  ${getContactsByStage(stage.id).reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {getContactsByStage(stage.id).map((contact) => (
                  <div
                    key={contact.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact.id)}
                    className="group bg-zinc-950 border-2 border-zinc-800 p-4 cursor-grab active:cursor-grabbing hover:border-lime-400/50 hover:shadow-[4px_4px_0px_0px_rgba(163,230,53,0.2)] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-zinc-900 text-zinc-400 text-[10px] font-mono px-1 border border-zinc-800">{contact.lastContact}</span>
                        <GripVertical className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-bold text-white text-lg leading-tight mb-1">{contact.company}</h4>
                    <p className="text-zinc-400 text-sm mb-3">{contact.name}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {contact.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-1 border border-zinc-800">#{tag}</span>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-zinc-900">
                      <span className="font-mono text-lime-400 font-bold">${contact.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {getContactsByStage(stage.id).length === 0 && (
                    <div className="h-24 border-2 border-dashed border-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-700 font-mono text-xs uppercase">Empty Slot</span>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};