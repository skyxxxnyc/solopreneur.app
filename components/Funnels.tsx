import React, { useState } from 'react';
import { Funnel, FunnelElement, ElementType } from '../types';
import { Layout, Type, Image as ImageIcon, FormInput, MousePointerClick, Settings, Plus, Trash, ExternalLink, GripVertical, LayoutTemplate, X, Check } from 'lucide-react';
import { FUNNEL_TEMPLATES } from '../constants';

interface FunnelsProps {
  funnels: Funnel[];
  setFunnels: React.Dispatch<React.SetStateAction<Funnel[]>>;
  tenantId: string;
}

interface DragItem {
  type: 'sidebar' | 'canvas';
  index?: number;
  elementType?: ElementType;
}

export const Funnels: React.FC<FunnelsProps> = ({ funnels, setFunnels, tenantId }) => {
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const activeFunnel = funnels.find(f => f.id === activeFunnelId);
  const tenantFunnels = funnels.filter(f => f.tenantId === tenantId);

  const createFunnel = () => {
    const newFunnel: Funnel = {
        id: Date.now().toString(),
        tenantId: tenantId,
        name: 'New Funnel Campaign',
        status: 'draft',
        visits: 0,
        conversions: 0,
        elements: [
            { id: '1', type: 'header', content: 'Welcome to our Offer' },
            { id: '2', type: 'text', content: 'Describe your product or service here with compelling copy.' }
        ]
    };
    setFunnels([...funnels, newFunnel]);
    setActiveFunnelId(newFunnel.id);
  };

  const handleUpdateFunnel = (updatedFunnel: Funnel) => {
      setFunnels(funnels.map(f => f.id === updatedFunnel.id ? updatedFunnel : f));
  };

  const handleLoadTemplate = (template: Funnel) => {
    if (activeFunnelId && activeFunnel) {
        // We are in editor mode, replace content
        if(confirm('This will overwrite your current design. Continue?')) {
             const newElements = template.elements.map((el, i) => ({...el, id: Date.now().toString() + i}));
             handleUpdateFunnel({...activeFunnel, elements: newElements});
             setIsLibraryOpen(false);
        }
    } else {
        // We are in list mode, create new
        const newFunnel: Funnel = {
            ...template,
            id: Date.now().toString(),
            tenantId: tenantId,
            name: `${template.name} (Copy)`,
            status: 'draft',
            visits: 0,
            conversions: 0,
            elements: template.elements.map((el, i) => ({...el, id: Date.now().toString() + i}))
        };
        setFunnels([...funnels, newFunnel]);
        setActiveFunnelId(newFunnel.id);
        setIsLibraryOpen(false);
    }
  };

  const deleteElement = (index: number) => {
    if (!activeFunnel) return;
    const newElements = activeFunnel.elements.filter((_, i) => i !== index);
    handleUpdateFunnel({ ...activeFunnel, elements: newElements });
  };

  const updateElementContent = (id: string, content: string) => {
      if (!activeFunnel) return;
      const newElements = activeFunnel.elements.map(el => el.id === id ? { ...el, content } : el);
      handleUpdateFunnel({ ...activeFunnel, elements: newElements });
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
      setDraggedItem(item);
      // Set drag image or data if necessary
      e.dataTransfer.effectAllowed = 'move';
      if (item.type === 'sidebar') {
          e.dataTransfer.setData('application/type', item.elementType || '');
      }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDropIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      // Optional: Clear drop index if leaving the container
      // setDropIndex(null); 
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!activeFunnel || dropIndex === null || !draggedItem) return;

      const newElements = [...activeFunnel.elements];

      if (draggedItem.type === 'sidebar' && draggedItem.elementType) {
          const newElement: FunnelElement = {
              id: Date.now().toString(),
              type: draggedItem.elementType,
              content: draggedItem.elementType === 'header' ? 'New Headline' : 
                       draggedItem.elementType === 'text' ? 'Insert text here' : 
                       draggedItem.elementType === 'button' ? 'Click Me' : 
                       draggedItem.elementType === 'form' ? 'Email Address' : 
                       'https://via.placeholder.com/600x400'
          };
          newElements.splice(dropIndex, 0, newElement);
      } else if (draggedItem.type === 'canvas' && typeof draggedItem.index === 'number') {
          const itemToMove = newElements[draggedItem.index];
          // Remove from old position
          newElements.splice(draggedItem.index, 1);
          // Calculate new index (adjusting for removal)
          let targetIndex = dropIndex;
          if (draggedItem.index < dropIndex) {
              targetIndex -= 1;
          }
          // Insert at new position
          newElements.splice(targetIndex, 0, itemToMove);
      }

      handleUpdateFunnel({ ...activeFunnel, elements: newElements });
      setDraggedItem(null);
      setDropIndex(null);
  };

  // --- Components ---

  const DropZone = ({ index }: { index: number }) => {
      const isActive = dropIndex === index && draggedItem !== null;
      return (
          <div 
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            className={`
                h-2 w-full transition-all duration-200 rounded-full my-1 relative z-10
                ${isActive ? 'bg-lime-400 scale-y-100 opacity-100 py-2' : 'bg-transparent hover:bg-zinc-800 hover:scale-y-150 py-1 opacity-0 hover:opacity-100'}
            `}
          >
             {isActive && (
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-lime-400 text-black text-[9px] font-black uppercase px-2 rounded-full whitespace-nowrap pointer-events-none">
                     Drop Here
                 </div>
             )}
          </div>
      );
  };

  const SidebarItem = ({ type, icon: Icon, label }: { type: ElementType, icon: any, label: string }) => (
    <div 
        draggable
        onDragStart={(e) => handleDragStart(e, { type: 'sidebar', elementType: type })}
        className="w-full flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 hover:border-lime-400 hover:text-lime-400 text-zinc-300 transition-all cursor-grab active:cursor-grabbing group text-left select-none"
    >
        <Icon className="w-5 h-5" />
        <span className="font-bold text-sm uppercase">{label}</span>
        <GripVertical className="w-4 h-4 ml-auto text-zinc-700 group-hover:text-lime-400" />
    </div>
  );

  if (activeFunnelId && activeFunnel) {
    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
             {/* Builder Header */}
            <div className="bg-zinc-900 border-2 border-zinc-800 p-4 shadow-[4px_4px_0px_0px_#27272a] flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveFunnelId(null)} className="text-zinc-500 hover:text-white font-bold uppercase text-xs">← Back</button>
                    <div className="h-6 w-0.5 bg-zinc-700"></div>
                    <input 
                        value={activeFunnel.name}
                        onChange={(e) => handleUpdateFunnel({ ...activeFunnel, name: e.target.value })}
                        className="bg-transparent text-xl font-black text-white uppercase focus:outline-none border-b-2 border-transparent focus:border-lime-400"
                    />
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsLibraryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-zinc-700 text-zinc-300 font-bold text-xs uppercase hover:bg-zinc-800 hover:text-white hover:border-zinc-500"
                    >
                        <LayoutTemplate className="w-4 h-4" /> Templates
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-zinc-700 text-zinc-300 font-bold text-xs uppercase hover:bg-zinc-800">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button className="flex items-center gap-2 bg-lime-400 text-black px-6 py-2 font-bold border-2 border-lime-500 hover:shadow-[4px_4px_0px_0px_#3f3f46] hover:translate-y-[-2px] transition-all">
                        <ExternalLink className="w-4 h-4" /> Publish
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Components Sidebar */}
                <div className="w-64 bg-zinc-900 border-2 border-zinc-800 p-4 overflow-y-auto shrink-0">
                    <h3 className="text-xs font-black text-zinc-500 uppercase mb-4 tracking-wider">Components</h3>
                    <div className="space-y-3">
                        <SidebarItem type="header" icon={Type} label="Headline" />
                        <SidebarItem type="text" icon={Layout} label="Text Block" />
                        <SidebarItem type="image" icon={ImageIcon} label="Image" />
                        <SidebarItem type="form" icon={FormInput} label="Input Form" />
                        <SidebarItem type="button" icon={MousePointerClick} label="Button" />
                    </div>
                    <div className="mt-8 p-4 bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs font-mono text-center">
                        Drag items to the canvas to add them.
                    </div>
                </div>

                {/* Canvas */}
                <div 
                    className="flex-1 bg-zinc-950 border-2 border-zinc-800 overflow-y-auto relative p-8 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <div className="max-w-2xl mx-auto bg-white min-h-[800px] shadow-2xl relative pb-8">
                        {/* Initial Drop Zone */}
                        <div className="px-4 pt-2">
                             <DropZone index={0} />
                        </div>

                        {activeFunnel.elements.map((el, idx) => (
                            <React.Fragment key={el.id}>
                                <div 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, { type: 'canvas', index: idx })}
                                    className={`
                                        group relative border-2 border-transparent transition-all cursor-move
                                        ${draggedItem?.index === idx ? 'opacity-40 bg-zinc-100 border-zinc-300 border-dashed' : 'hover:border-lime-400 hover:bg-zinc-50'}
                                    `}
                                >
                                    {/* Element Controls */}
                                    <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity z-20">
                                        <div className="p-1 bg-zinc-900 text-white cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <button onClick={() => deleteElement(idx)} className="p-1 bg-red-900 text-white hover:bg-red-600"><Trash className="w-4 h-4" /></button>
                                    </div>

                                    {/* Element Render */}
                                    <div className="p-4 pointer-events-none group-hover:pointer-events-auto">
                                        {el.type === 'header' && (
                                            <input 
                                                value={el.content}
                                                onChange={(e) => updateElementContent(el.id, e.target.value)}
                                                className="w-full text-4xl font-bold text-center bg-transparent border-none focus:ring-2 focus:ring-lime-400 text-black placeholder-zinc-300"
                                                placeholder="Enter Headline"
                                            />
                                        )}
                                        {el.type === 'text' && (
                                            <textarea 
                                                value={el.content}
                                                onChange={(e) => updateElementContent(el.id, e.target.value)}
                                                className="w-full text-lg text-zinc-600 bg-transparent border-none focus:ring-2 focus:ring-lime-400 resize-none overflow-hidden"
                                                rows={3}
                                            />
                                        )}
                                        {el.type === 'image' && (
                                            <div className="relative group/image">
                                                <img src={el.content} alt="Content" className="w-full h-auto object-cover max-h-96 bg-zinc-100" />
                                                <input 
                                                    value={el.content} 
                                                    onChange={(e) => updateElementContent(el.id, e.target.value)}
                                                    className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs p-1 opacity-0 group-hover/image:opacity-100 backdrop-blur-sm pointer-events-auto"
                                                    placeholder="Paste Image URL"
                                                />
                                            </div>
                                        )}
                                        {el.type === 'form' && (
                                            <div className="flex flex-col gap-2 max-w-md mx-auto">
                                                <input 
                                                    type="text"
                                                    placeholder={el.content}
                                                    className="w-full p-3 border border-zinc-300 bg-zinc-50"
                                                    readOnly
                                                />
                                                <div className="text-center text-xs text-zinc-400 italic">Form placeholder</div>
                                            </div>
                                        )}
                                        {el.type === 'button' && (
                                            <div className="text-center">
                                                <button className="bg-lime-500 text-black font-bold py-3 px-8 text-lg hover:bg-lime-400 transition-colors pointer-events-auto">
                                                    <input 
                                                        value={el.content}
                                                        onChange={(e) => updateElementContent(el.id, e.target.value)}
                                                        className="bg-transparent text-center w-full focus:outline-none cursor-pointer"
                                                    />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4">
                                    <DropZone index={idx + 1} />
                                </div>
                            </React.Fragment>
                        ))}
                        
                        {activeFunnel.elements.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 pointer-events-none">
                                <p className="font-mono text-sm uppercase">Drag components here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Template Library Modal (Editor Mode) */}
            {isLibraryOpen && (
                <div className="absolute inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full md:w-[600px] bg-zinc-950 border-l-2 border-zinc-800 shadow-[-4px_0px_0px_0px_#27272a] h-full flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b-2 border-zinc-800 bg-zinc-900 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                                    <LayoutTemplate className="w-5 h-5" />
                                    Template Library
                                </h3>
                            </div>
                            <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-zinc-800 transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {FUNNEL_TEMPLATES.map(template => (
                                <div key={template.id} className="bg-zinc-900 border-2 border-zinc-800 p-4 hover:border-lime-400 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white uppercase">{template.name}</h4>
                                        <span className="bg-zinc-800 text-zinc-500 text-[10px] font-mono px-2 py-1 rounded-none border border-zinc-700">
                                            {template.elements.length} Elements
                                        </span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
                                        {template.elements.map((el, i) => (
                                            <div key={i} className="flex items-center text-[10px] text-zinc-500 font-mono shrink-0">
                                                {i > 0 && <span className="mx-1">→</span>}
                                                <span className="uppercase">{el.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => handleLoadTemplate(template)}
                                        className="w-full py-2 bg-zinc-950 border border-zinc-700 text-zinc-300 font-bold uppercase text-xs hover:bg-lime-400 hover:text-black hover:border-lime-400 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-3 h-3" />
                                        Use Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      <div className="mb-6 flex justify-between items-center bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Funnel Builder</h2>
           <p className="text-zinc-500 font-mono text-sm">Design high-converting landing pages.</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-2 bg-zinc-900 text-zinc-300 px-6 py-3 font-bold border-2 border-zinc-700 hover:text-white hover:border-zinc-500 transition-all"
            >
                <LayoutTemplate className="w-5 h-5" />
                TEMPLATES
            </button>
            <button 
                onClick={createFunnel}
                className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 font-bold border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] transition-all"
            >
                <Plus className="w-5 h-5" />
                NEW FUNNEL
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenantFunnels.map(funnel => (
            <div key={funnel.id} className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] hover:border-zinc-600 transition-colors flex flex-col h-64">
                <div className="flex justify-between items-start mb-4">
                    <div className={`px-2 py-1 text-[10px] font-bold uppercase border ${funnel.status === 'published' ? 'text-lime-400 border-lime-400' : 'text-zinc-500 border-zinc-700'}`}>
                        {funnel.status}
                    </div>
                    <div className="flex gap-2 text-zinc-500">
                        <Settings className="w-4 h-4 hover:text-white cursor-pointer" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{funnel.name}</h3>
                
                <div className="mt-auto grid grid-cols-2 gap-4 border-t-2 border-zinc-800 pt-4 mb-4">
                    <div>
                        <div className="text-xs text-zinc-500 font-mono uppercase">Visits</div>
                        <div className="text-lg font-mono text-white">{funnel.visits}</div>
                    </div>
                    <div>
                         <div className="text-xs text-zinc-500 font-mono uppercase">Conversions</div>
                        <div className="text-lg font-mono text-lime-400">{funnel.conversions}</div>
                    </div>
                </div>

                <button 
                    onClick={() => setActiveFunnelId(funnel.id)}
                    className="w-full py-2 bg-zinc-800 text-zinc-300 font-bold uppercase text-xs border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                    Edit Design
                </button>
            </div>
        ))}
      </div>

       {/* Template Library Modal (List Mode) */}
       {isLibraryOpen && (
            <div className="absolute inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full md:w-[600px] bg-zinc-950 border-l-2 border-zinc-800 shadow-[-4px_0px_0px_0px_#27272a] h-full flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b-2 border-zinc-800 bg-zinc-900 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                                <LayoutTemplate className="w-5 h-5" />
                                Template Library
                            </h3>
                        </div>
                        <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-zinc-800 transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                         {FUNNEL_TEMPLATES.map(template => (
                             <div key={template.id} className="bg-zinc-900 border-2 border-zinc-800 p-4 hover:border-lime-400 transition-colors group">
                                 <div className="flex justify-between items-start mb-2">
                                     <h4 className="font-bold text-white uppercase">{template.name}</h4>
                                     <span className="bg-zinc-800 text-zinc-500 text-[10px] font-mono px-2 py-1 rounded-none border border-zinc-700">
                                         {template.elements.length} Elements
                                     </span>
                                 </div>
                                 <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
                                     {template.elements.map((el, i) => (
                                         <div key={i} className="flex items-center text-[10px] text-zinc-500 font-mono shrink-0">
                                             {i > 0 && <span className="mx-1">→</span>}
                                             <span className="uppercase">{el.type}</span>
                                         </div>
                                     ))}
                                 </div>
                                 <button 
                                    onClick={() => handleLoadTemplate(template)}
                                    className="w-full py-2 bg-zinc-950 border border-zinc-700 text-zinc-300 font-bold uppercase text-xs hover:bg-lime-400 hover:text-black hover:border-lime-400 transition-colors flex items-center justify-center gap-2"
                                 >
                                     <Check className="w-3 h-3" />
                                     Create from Template
                                 </button>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};