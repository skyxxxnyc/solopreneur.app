
import React, { useState } from 'react';
import { Company, UserRole } from '../types';
import { Building2, Globe, MapPin, Plus, Search, Trash2, X, Save, Filter, Tag, ExternalLink, Phone } from 'lucide-react';

interface CompaniesProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  tenantId: string;
  userRole: UserRole;
}

export const Companies: React.FC<CompaniesProps> = ({ companies, setCompanies, tenantId, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isNew, setIsNew] = useState(false);

  const tenantCompanies = companies.filter(c => c.tenantId === tenantId);

  const filteredCompanies = tenantCompanies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    if (isNew) {
      setCompanies(prev => [...prev, { ...editingCompany, id: Date.now().toString(), tenantId }]);
    } else {
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? editingCompany : c));
    }
    setEditingCompany(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (userRole === 'user') {
        alert("Permissions required.");
        return;
    }
    if (confirm('Permanently delete this organization?')) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      setEditingCompany(null);
    }
  };

  const openNewCompany = () => {
    setIsNew(true);
    setEditingCompany({
      id: '',
      tenantId: tenantId,
      name: '',
      industry: '',
      website: '',
      phone: '',
      address: '',
      tags: [],
      lastActivity: 'Now',
      customFields: []
    });
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      <div className="mb-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
        <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 italic">Organizations</h2>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Business Entities // {tenantCompanies.length} Accounts</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none group">
                <Search className="absolute left-4 top-4 w-4 h-4 text-zinc-500 group-focus-within:text-lime-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="ACCOUNT SEARCH..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 bg-black border-2 border-zinc-800 py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-lime-400 transition-colors placeholder:text-zinc-700 font-mono uppercase"
                />
            </div>
            <button className="bg-black border-2 border-zinc-800 p-3.5 text-zinc-400 hover:text-white transition-all">
                <Filter className="w-5 h-5" />
            </button>
            <button 
                onClick={openNewCompany}
                className="flex items-center gap-3 bg-lime-400 text-black px-8 py-3.5 font-black uppercase tracking-wider border-2 border-lime-500 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_#000] shadow-[4px_4px_0px_0px_#000] transition-all whitespace-nowrap"
            >
                <Plus className="w-4 h-4 stroke-[3]" />
                New Account
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border-2 border-zinc-800 shadow-[8px_8px_0px_0px_#000] bg-black scrollbar-thin scrollbar-thumb-zinc-800">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-950 shadow-md">
            <tr className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.15em] border-b-2 border-zinc-800">
              <th className="p-6 border-r-2 border-zinc-800">Organization</th>
              <th className="p-6 border-r-2 border-zinc-800">Industry</th>
              <th className="p-6 border-r-2 border-zinc-800">Technical Info</th>
              <th className="p-6">Meta Tags</th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-zinc-800">
            {filteredCompanies.map((company) => (
              <tr 
                key={company.id} 
                onClick={() => { setIsNew(false); setEditingCompany(company); }}
                className="hover:bg-zinc-900 transition-colors group cursor-pointer"
              >
                <td className="p-6 border-r-2 border-zinc-800">
                  <div className="font-black text-white text-base mb-1 group-hover:text-lime-400 transition-colors uppercase italic">{company.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {company.address}
                  </div>
                </td>
                <td className="p-6 border-r-2 border-zinc-800">
                  <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-400">
                    {company.industry}
                  </span>
                </td>
                <td className="p-6 border-r-2 border-zinc-800">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            {company.website}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                            <Phone className="w-3 h-3 text-zinc-600" />
                            {company.phone}
                        </div>
                    </div>
                </td>
                <td className="p-6">
                  <div className="flex gap-2 flex-wrap">
                    {company.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-zinc-400 bg-zinc-950 px-2 py-1 border border-zinc-800">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCompany && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full md:w-[700px] bg-black border-l-2 border-zinc-800 shadow-[-20px_0px_50px_rgba(0,0,0,0.9)] h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-8 border-b-2 border-zinc-800 bg-zinc-950 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">{isNew ? 'New Account' : 'Edit Account'}</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1 tracking-widest">ORG_ID: {editingCompany.id || 'SYNCING...'}</p>
                    </div>
                    <button onClick={() => setEditingCompany(null)} className="p-3 hover:bg-zinc-900 border-2 border-transparent hover:border-zinc-700">
                        <X className="w-6 h-6 text-zinc-500 hover:text-white" />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10">
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Company Name</label>
                                <input 
                                    required
                                    value={editingCompany.name}
                                    onChange={e => setEditingCompany({...editingCompany, name: e.target.value})}
                                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-white font-black focus:outline-none focus:border-lime-400 transition-colors text-xl uppercase"
                                    placeholder="LEGAL ENTITY NAME"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Industry</label>
                                <input 
                                    value={editingCompany.industry}
                                    onChange={e => setEditingCompany({...editingCompany, industry: e.target.value})}
                                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-white focus:outline-none focus:border-lime-400 transition-colors font-mono text-sm"
                                    placeholder="Sector"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Website</label>
                                <input 
                                    value={editingCompany.website}
                                    onChange={e => setEditingCompany({...editingCompany, website: e.target.value})}
                                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-cyan-400 focus:outline-none focus:border-lime-400 transition-colors font-mono text-sm"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Physical Address</label>
                                <input 
                                    value={editingCompany.address}
                                    onChange={e => setEditingCompany({...editingCompany, address: e.target.value})}
                                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-400 focus:outline-none focus:border-lime-400 transition-colors font-mono text-sm"
                                    placeholder="Full Address"
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-zinc-950 border-2 border-zinc-800 space-y-6">
                            <h4 className="text-xs font-black text-white uppercase flex items-center gap-3 tracking-widest border-b-2 border-zinc-900 pb-4">
                                <Building2 className="w-4 h-4 text-lime-400" /> Account Intel
                            </h4>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Internal Tags</label>
                                <input 
                                    value={editingCompany.tags.join(', ')}
                                    onChange={e => setEditingCompany({...editingCompany, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                                    className="w-full bg-black border-2 border-zinc-800 p-3 text-zinc-300 text-xs focus:outline-none focus:border-lime-400 font-mono"
                                    placeholder="Enterprise, High-Value, Q3-Target"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t-2 border-zinc-800 bg-zinc-950 flex justify-between items-center">
                    {!isNew && (
                        <button 
                            type="button" 
                            onClick={() => handleDelete(editingCompany.id)}
                            className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-wider px-4 py-2 border-2 ${userRole === 'user' ? 'border-zinc-800 text-zinc-700 cursor-not-allowed' : 'border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors'}`}
                            disabled={userRole === 'user'}
                        >
                            <Trash2 className="w-3 h-3" />
                            Purge
                        </button>
                    )}
                    <div className="flex gap-4 ml-auto">
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-3 bg-lime-400 text-black px-10 py-4 font-black uppercase tracking-wider border-2 border-lime-500 hover:shadow-[6px_6px_0px_0px_#fff] hover:translate-y-[-2px] transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {isNew ? 'Initialize Account' : 'Commit Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
