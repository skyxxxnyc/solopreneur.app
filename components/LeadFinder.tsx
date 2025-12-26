
import React, { useState } from 'react';
import { Search, MapPin, Building2, Plus, Check, Loader2, Globe, Star, Users, ExternalLink, BrainCircuit, Activity, AlertCircle, MessageCircle, UserPlus, ShieldCheck } from 'lucide-react';
import { findProspects, findDecisionMaker } from '../services/geminiService';
import { Prospect, Company } from '../types';

interface LeadFinderProps {
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  tenantId: string;
}

export const LeadFinder: React.FC<LeadFinderProps> = ({ setCompanies, tenantId }) => {
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearch, setLastSearch] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !location) return;

    setIsSearching(true);
    setProspects([]); // Clear previous results
    
    // 1. Call the SDR Agent service (Maps)
    const results = await findProspects(niche, location);
    
    // Initialize results with enrichment status
    const initializedResults = results.map(p => ({
        ...p,
        enrichmentStatus: 'searching' as const
    }));

    setProspects(initializedResults);
    setLastSearch(`${niche} in ${location}`);
    setIsSearching(false);

    // 2. Automatically chain Outreach Agent (Search) for each result
    initializedResults.forEach(async (prospect) => {
        try {
            const enrichedData = await findDecisionMaker(prospect.name, location);
            
            setProspects(current => current.map(p => {
                if (p.id !== prospect.id) return p;
                
                if (!enrichedData) return { ...p, enrichmentStatus: 'failed' };

                return {
                    ...p,
                    enrichmentStatus: 'complete',
                    decisionMaker: enrichedData.decisionMaker,
                    decisionMakerTitle: enrichedData.title,
                    contactEmail: enrichedData.contactInfo
                };
            }));
        } catch (error) {
            console.error("Auto-enrichment failed for", prospect.name, error);
            setProspects(current => current.map(p => p.id === prospect.id ? { ...p, enrichmentStatus: 'failed' } : p));
        }
    });
  };

  const addToCRM = (prospect: Prospect) => {
    const newCompany: Company = {
        id: Date.now().toString(),
        tenantId: tenantId,
        name: prospect.name,
        industry: niche,
        website: prospect.website || '',
        phone: '',
        address: prospect.address,
        tags: ['SDR-Agent', `Score: ${prospect.leadScore || 0}`, ...(prospect.painPoints || [])],
        lastActivity: 'Found',
        customFields: [
            { id: 'dm', label: 'Decision Maker', value: prospect.decisionMaker || 'Unknown' },
            { id: 'dm_title', label: 'Title', value: prospect.decisionMakerTitle || 'Unknown' },
            { id: 'dm_email', label: 'Email', value: prospect.contactEmail || 'Unknown' }
        ]
    };

    setCompanies(prev => [...prev, newCompany]);
    setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, status: 'added' } : p));
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-lime-400 border-lime-400 bg-lime-900/20';
      if (score >= 50) return 'text-yellow-400 border-yellow-400 bg-yellow-900/20';
      return 'text-red-400 border-red-400 bg-red-900/20';
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">SDR Agent</h2>
                <p className="text-zinc-500 font-mono text-sm">Find business entities and sync directly to your account library.</p>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-zinc-950 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Target Niche</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                        <input 
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder="e.g. Dentists, Roofers, Law Firms"
                            className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 pl-10 text-white font-bold focus:border-lime-400 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                        <input 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Austin, TX"
                            className="w-full bg-zinc-900 border-2 border-zinc-800 p-3 pl-10 text-white font-bold focus:border-lime-400 focus:outline-none"
                        />
                    </div>
                </div>
                <button 
                    type="submit"
                    disabled={isSearching || !niche || !location}
                    className="w-full md:w-auto bg-lime-400 text-black px-8 py-3.5 font-black uppercase tracking-wider border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    {isSearching ? 'Scouting...' : 'Find Entities'}
                </button>
            </form>
        </div>

        <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 p-6 overflow-y-auto">
            {prospects.length === 0 && !isSearching ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                    <Globe className="w-16 h-16 mb-4" />
                    <p className="font-mono uppercase text-sm text-center">Deploy SDR Agent to scout organizations</p>
                </div>
            ) : (
                <>
                    {lastSearch && !isSearching && (
                        <div className="mb-4 text-xs font-mono text-zinc-500 uppercase flex justify-between items-center">
                            <span>Results for: <span className="text-white font-bold">{lastSearch}</span></span>
                            <span>{prospects.length} Found</span>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {prospects.map((prospect) => (
                            <div key={prospect.id} className="bg-zinc-950 border-2 border-zinc-800 p-5 hover:border-lime-400 transition-colors group flex flex-col h-full relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white text-lg leading-tight w-3/4 line-clamp-2 italic">{prospect.name}</h3>
                                    {prospect.leadScore !== undefined && (
                                        <div className={`flex flex-col items-center justify-center w-10 h-10 border-2 rounded-full shrink-0 ${getScoreColor(prospect.leadScore)}`}>
                                            <span className="text-xs font-black">{prospect.leadScore}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-4 mb-4 flex-1">
                                    <div className="flex flex-wrap gap-4">
                                        {prospect.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                <span className="text-xs font-mono text-white">{prospect.rating}</span>
                                            </div>
                                        )}
                                        {prospect.website ? (
                                             <div className="flex items-center gap-1 text-cyan-400 text-xs truncate max-w-[120px]">
                                                <Globe className="w-3 h-3 shrink-0" />
                                                <a href={prospect.website} target="_blank" rel="noreferrer" className="hover:underline truncate">{prospect.website}</a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-400 text-xs">
                                                <AlertCircle className="w-3 h-3" />
                                                <span className="text-[10px]">No Website</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-start gap-2 text-zinc-400 text-xs">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{prospect.address}</span>
                                    </div>

                                    <div className="bg-zinc-900 border border-zinc-700 p-3 min-h-[80px] flex flex-col justify-center">
                                        {prospect.enrichmentStatus === 'searching' && (
                                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span className="uppercase font-mono">Enriching Org Data...</span>
                                            </div>
                                        )}
                                        {prospect.enrichmentStatus === 'failed' && (
                                            <div className="text-zinc-500 text-xs uppercase font-mono">Enrichment Failed</div>
                                        )}
                                        {prospect.enrichmentStatus === 'complete' && (
                                            <div className="animate-in fade-in">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UserPlus className="w-3 h-3 text-lime-400" />
                                                    <span className="text-[10px] font-black uppercase text-lime-400">Owner Identified</span>
                                                </div>
                                                <div className="font-bold text-white text-sm">{prospect.decisionMaker}</div>
                                                <div className="text-[10px] text-zinc-400 font-mono">{prospect.decisionMakerTitle}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => addToCRM(prospect)}
                                    disabled={prospect.status === 'added' || prospect.enrichmentStatus === 'searching'}
                                    className={`w-full py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 border-2 transition-all ${
                                        prospect.status === 'added' 
                                        ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-default' 
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-lime-400 hover:text-black hover:border-lime-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                                >
                                    {prospect.status === 'added' ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {prospect.status === 'added' ? 'Org Added' : 'Sync to Organizations'}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
