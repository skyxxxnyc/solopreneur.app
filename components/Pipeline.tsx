
import React, { useState } from 'react';
import { Contact, StageId } from '../types';
import { PIPELINE_STAGES } from '../constants';
import { Plus, GripVertical, Loader2, ArrowRight } from 'lucide-react';
import { generateLeads } from '../services/geminiService';

interface PipelineProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  tenantId: string;
}

export const Pipeline: React.FC<PipelineProps> = ({ contacts, setContacts, tenantId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);

  const tenantContacts = contacts.filter(c => c.tenantId === tenantId);

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
      const leadsWithTenant = newLeads.map(l => ({ ...l, tenantId }));
      setContacts((prev) => [...prev, ...leadsWithTenant]);
    }
    setIsGenerating(false);
  };

  const getContactsByStage = (stage: StageId) => tenantContacts.filter((c) => c.stage === stage);

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Deal Pipeline</h2>
           <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Kanban Board View</p>
        </div>
        <button
          onClick={handleGenerateLeads}
          disabled={isGenerating}
          className="flex items-center gap-3 bg-lime-400 text-black px-8 py-4 font-black uppercase tracking-wider border-2 border-lime-500 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_#000] shadow-[6px_6px_0px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 stroke-[3]" />}
          {isGenerating ? 'AI Working...' : 'Generate Leads'}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-8 h-full min-w-[1600px]">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.id}
              className={`flex-1 min-w-[340px] flex flex-col bg-black border-2 transition-colors ${
                draggedContactId ? 'border-zinc-800 border-dashed bg-zinc-900/30' : 'border-zinc-800'
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={`p-6 border-b-2 border-zinc-800 bg-zinc-950 ${stage.color} border-l-[8px]`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-black text-white uppercase tracking-tight text-sm">{stage.title}</h3>
                  <span className="bg-black border border-zinc-800 text-zinc-400 text-[10px] px-3 py-1 font-mono font-bold">
                    {getContactsByStage(stage.id).length}
                  </span>
                </div>
                <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                  <div className="h-px bg-zinc-800 flex-1"></div>
                  <span className="text-white">${getContactsByStage(stage.id).reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 bg-zinc-950/50">
                {getContactsByStage(stage.id).map((contact) => (
                  <div
                    key={contact.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact.id)}
                    className="group bg-zinc-900 border-2 border-zinc-800 p-5 cursor-grab active:cursor-grabbing hover:border-lime-400 hover:shadow-[6px_6px_0px_0px_#000] transition-all relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider bg-black px-2 py-0.5 border border-zinc-800">{contact.lastContact}</span>
                        <GripVertical className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="mb-5">
                        <h4 className="font-black text-white text-lg leading-none mb-1 group-hover:text-lime-400 transition-colors">{contact.company}</h4>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">{contact.name}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {contact.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] font-bold uppercase text-zinc-400 bg-black px-2 py-1 border border-zinc-800">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t-2 border-zinc-800/50">
                      <span className="font-mono text-lime-400 font-bold text-sm tracking-tighter">${contact.value.toLocaleString()}</span>
                      <button className="text-zinc-600 hover:text-white transition-colors bg-zinc-950 p-1 border border-zinc-800 hover:border-white">
                          <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {getContactsByStage(stage.id).length === 0 && (
                    <div className="h-40 border-2 border-dashed border-zinc-900 flex flex-col items-center justify-center m-2 opacity-50">
                        <span className="text-zinc-800 font-mono text-[10px] uppercase tracking-[0.2em]">Empty Stage</span>
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
