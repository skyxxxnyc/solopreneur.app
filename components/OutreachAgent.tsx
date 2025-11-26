
import React, { useState } from 'react';
import { Search, Building2, MapPin, UserPlus, ShieldCheck, AlertTriangle, CheckCircle2, Globe, Link as LinkIcon, Loader2, Save, User } from 'lucide-react';
import { findDecisionMaker } from '../services/geminiService';
import { EnrichedProfile, Contact } from '../types';

interface OutreachAgentProps {
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export const OutreachAgent: React.FC<OutreachAgentProps> = ({ setContacts }) => {
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [result, setResult] = useState<EnrichedProfile | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company || !location) return;
        
        setIsSearching(true);
        setResult(null);
        
        const data = await findDecisionMaker(company, location);
        setResult(data);
        setIsSearching(false);
    };

    const handleSave = () => {
        if (!result) return;
        
        const newContact: Contact = {
            id: Date.now().toString(),
            name: result.decisionMaker === 'Unknown' ? 'Decision Maker' : result.decisionMaker,
            company: result.company,
            email: result.contactInfo.includes('@') ? result.contactInfo : '',
            phone: '',
            value: 0,
            stage: 'new',
            lastContact: 'Never',
            tags: ['Outreach-Agent', 'Cold'],
            customFields: [
                { id: 'title', label: 'Title', value: result.title },
                { id: 'source', label: 'Source', value: 'Outreach Agent' },
                { id: 'confidence', label: 'Confidence', value: result.confidence }
            ]
        };

        setContacts(prev => [...prev, newContact]);
        setCompany('');
        setLocation('');
        setResult(null);
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
             <div className="mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Outreach Agent</h2>
                <p className="text-zinc-500 font-mono text-sm">Hunt for decision makers using Yelp, Manta, and web data.</p>
             </div>

             <div className="flex-1 flex flex-col lg:flex-row gap-6">
                 {/* Search Panel */}
                 <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                                    <input 
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="e.g. Joe's Pizza"
                                        className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 pl-10 text-white font-bold focus:border-lime-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                                    <input 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Chicago, IL"
                                        className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 pl-10 text-white font-bold focus:border-lime-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isSearching || !company || !location}
                                className="w-full bg-lime-400 text-black px-6 py-4 font-black uppercase tracking-wider border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                {isSearching ? 'Hunting...' : 'Find Decision Maker'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-4 text-xs text-zinc-500 font-mono">
                        <h4 className="font-bold text-zinc-400 mb-2 uppercase">How it works</h4>
                        <p className="mb-2">The Outreach Agent uses Google Search to scan directories like Yelp and Manta, plus company "About" pages.</p>
                        <p>It looks for signs of ownership (e.g. "Response from the owner, Mike") to identify who you should contact.</p>
                    </div>
                 </div>

                 {/* Results Panel */}
                 <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 p-8 flex items-center justify-center relative overflow-hidden">
                     {/* Background Pattern */}
                     <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                     {!result && !isSearching && (
                         <div className="text-center text-zinc-600 max-w-sm">
                             <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                             <h3 className="text-lg font-black uppercase mb-2">Ready to Hunt</h3>
                             <p className="font-mono text-xs">Enter target details to find the person in charge.</p>
                         </div>
                     )}

                     {isSearching && (
                         <div className="text-center">
                             <Loader2 className="w-12 h-12 text-lime-400 animate-spin mx-auto mb-4" />
                             <p className="font-mono text-xs uppercase text-lime-400 animate-pulse">Scanning directories...</p>
                         </div>
                     )}

                     {result && (
                         <div className="w-full max-w-md bg-zinc-950 border-2 border-zinc-800 shadow-[8px_8px_0px_0px_#27272a] animate-in zoom-in-95 duration-300 relative">
                             {/* Confidence Badge */}
                             <div className={`absolute -top-3 -right-3 px-3 py-1 font-black text-xs uppercase border-2 shadow-sm flex items-center gap-1 ${
                                 result.confidence === 'High' ? 'bg-lime-400 text-black border-black' :
                                 result.confidence === 'Medium' ? 'bg-yellow-400 text-black border-black' :
                                 'bg-red-400 text-black border-black'
                             }`}>
                                 {result.confidence === 'High' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                 {result.confidence} Confidence
                             </div>

                             <div className="p-6 border-b-2 border-zinc-800">
                                 <h3 className="text-2xl font-black text-white uppercase mb-1">{result.decisionMaker}</h3>
                                 <p className="text-zinc-500 font-mono text-sm uppercase">{result.title} @ {result.company}</p>
                             </div>

                             <div className="p-6 space-y-6">
                                 <div>
                                     <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Contact Info</label>
                                     <div className="text-lg font-mono text-cyan-400">{result.contactInfo}</div>
                                 </div>

                                 <div>
                                     <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Intelligence Notes</label>
                                     <p className="text-sm text-zinc-300 leading-relaxed border-l-2 border-zinc-800 pl-3">
                                         "{result.notes}"
                                     </p>
                                 </div>

                                 {result.sources.length > 0 && (
                                     <div>
                                         <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-2">Sources</label>
                                         <div className="space-y-1">
                                             {result.sources.map((src, idx) => (
                                                 <a key={idx} href={src} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-lime-400 truncate">
                                                     <LinkIcon className="w-3 h-3 shrink-0" />
                                                     <span className="truncate">{src}</span>
                                                 </a>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>

                             <div className="p-4 bg-zinc-900 border-t-2 border-zinc-800">
                                 <button 
                                    onClick={handleSave}
                                    className="w-full py-3 bg-lime-400 text-black font-black uppercase tracking-wider hover:bg-lime-300 transition-colors flex items-center justify-center gap-2"
                                 >
                                     <Save className="w-4 h-4" />
                                     Save to Contacts
                                 </button>
                             </div>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    );
};
