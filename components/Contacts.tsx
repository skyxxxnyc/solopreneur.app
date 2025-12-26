
import React, { useState } from 'react';
import { Contact, Company, StageId, UserRole } from '../types';
import { Mail, Phone, Tag, Plus, Search, Trash2, X, Save, Edit2, Filter, Building2 } from 'lucide-react';

interface ContactsProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  tenantId: string;
  userRole: UserRole;
}

export const Contacts: React.FC<ContactsProps> = ({ contacts, setContacts, setCompanies, tenantId, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [entityType, setEntityType] = useState<'individual' | 'organization'>('individual');

  const tenantContacts = contacts.filter(c => c.tenantId === tenantId);

  const filteredContacts = tenantContacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    if (isNew) {
      if (entityType === 'organization') {
        const newCompany: Company = {
            id: Date.now().toString(),
            tenantId,
            name: editingContact.company || editingContact.name,
            industry: 'General',
            website: '',
            phone: editingContact.phone,
            address: '',
            tags: editingContact.tags,
            lastActivity: 'Added',
            customFields: editingContact.customFields
        };
        setCompanies(prev => [...prev, newCompany]);
      } else {
        setContacts(prev => [...prev, { ...editingContact, id: Date.now().toString(), tenantId }]);
      }
    } else {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? editingContact : c));
    }
    setEditingContact(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (userRole === 'user') {
        alert("You do not have permission to delete contacts.");
        return;
    }
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(c => c.id !== id));
      setEditingContact(null);
    }
  };

  const openNewContact = () => {
    setIsNew(true);
    setEntityType('individual');
    setEditingContact({
      id: '',
      tenantId: tenantId,
      name: '',
      company: '',
      email: '',
      phone: '',
      value: 0,
      stage: 'new',
      lastContact: 'Now',
      tags: [],
      customFields: []
    });
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      <div className="mb-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
        <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Contacts</h2>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Database // {tenantContacts.length} Records</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none group">
                <Search className="absolute left-4 top-4 w-4 h-4 text-zinc-500 group-focus-within:text-lime-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="QUERY DATABASE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 bg-black border-2 border-zinc-800 py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-lime-400 transition-colors placeholder:text-zinc-700 font-mono uppercase tracking-wider"
                />
            </div>
            <button className="bg-black border-2 border-zinc-800 p-3.5 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">
                <Filter className="w-5 h-5" />
            </button>
            <button 
                onClick={openNewContact}
                className="flex items-center gap-3 bg-lime-400 text-black px-8 py-3.5 font-black uppercase tracking-wider border-2 border-lime-500 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_#000] shadow-[4px_4px_0px_0px_#000] transition-all whitespace-nowrap"
            >
                <Plus className="w-4 h-4 stroke-[3]" />
                New Entity
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border-2 border-zinc-800 shadow-[8px_8px_0px_0px_#000] bg-black scrollbar-thin scrollbar-thumb-zinc-800">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-950 shadow-md">
            <tr className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.15em] border-b-2 border-zinc-800">
              <th className="p-6 border-r-2 border-zinc-800">Entity Name</th>
              <th className="p-6 border-r-2 border-zinc-800">Contact Details</th>
              <th className="p-6 border-r-2 border-zinc-800">Deal Value</th>
              <th className="p-6 border-r-2 border-zinc-800">Status</th>
              <th className="p-6">Meta Tags</th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-zinc-800">
            {filteredContacts.map((contact) => (
              <tr 
                key={contact.id} 
                onClick={() => { setIsNew(false); setEditingContact(contact); }}
                className="hover:bg-zinc-900 transition-colors group cursor-pointer"
              >
                <td className="p-6 border-r-2 border-zinc-800">
                  <div className="font-bold text-white text-sm mb-1 group-hover:text-lime-400 transition-colors">{contact.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                      {contact.company}
                  </div>
                </td>
                <td className="p-6 border-r-2 border-zinc-800">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                            <Mail className="w-3 h-3 text-zinc-600" />
                            {contact.email}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                            <Phone className="w-3 h-3 text-zinc-600" />
                            {contact.phone}
                        </div>
                    </div>
                </td>
                <td className="p-6 border-r-2 border-zinc-800">
                  <span className="font-mono text-lime-400 font-bold tracking-tight text-sm">
                    ${contact.value.toLocaleString()}
                  </span>
                </td>
                <td className="p-6 border-r-2 border-zinc-800">
                  <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-wider border-2 ${
                      contact.stage === 'closed' ? 'bg-lime-900/20 text-lime-400 border-lime-900' : 
                      contact.stage === 'new' ? 'bg-cyan-900/20 text-cyan-400 border-cyan-900' :
                      'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}>
                    {contact.stage}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex gap-2 flex-wrap">
                    {contact.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-zinc-400 bg-zinc-950 px-2 py-1 border border-zinc-800">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 3 && (
                        <span className="text-[9px] text-zinc-600 font-mono self-center">+{contact.tags.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingContact && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full md:w-[700px] bg-black border-l-2 border-zinc-800 shadow-[-20px_0px_50px_rgba(0,0,0,0.9)] h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-8 border-b-2 border-zinc-800 bg-zinc-950 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">{isNew ? 'New Record' : 'Edit Record'}</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1 tracking-widest">ID: {editingContact.id || 'GENERATING_ID...'}</p>
                    </div>
                    <button onClick={() => setEditingContact(null)} className="p-3 hover:bg-zinc-900 transition-colors border-2 border-transparent hover:border-zinc-700">
                        <X className="w-6 h-6 text-zinc-500 hover:text-white" />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10">
                    {isNew && (
                        <div className="grid grid-cols-2 gap-4 bg-zinc-950 border-2 border-zinc-800 p-2">
                             <button 
                                type="button" 
                                onClick={() => setEntityType('individual')}
                                className={`py-3 px-4 font-black uppercase text-xs transition-all border-2 ${entityType === 'individual' ? 'bg-lime-400 text-black border-lime-500' : 'text-zinc-500 border-transparent'}`}
                             >
                                 Individual Lead
                             </button>
                             <button 
                                type="button" 
                                onClick={() => setEntityType('organization')}
                                className={`py-3 px-4 font-black uppercase text-xs transition-all border-2 ${entityType === 'organization' ? 'bg-lime-400 text-black border-lime-500' : 'text-zinc-500 border-transparent'}`}
                             >
                                 Organization
                             </button>
                        </div>
                    )}

                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">{entityType === 'organization' ? 'Organization Name' : 'Entity Name'}</label>
                                <input 
                                    required
                                    value={editingContact.name}
                                    onChange={e => setEditingContact({...editingContact, name: e.target.value})}
                                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-white font-black focus:outline-none focus:border-lime-400 transition-colors text-xl uppercase"
                                    placeholder="FULL NAME"
                                />
                            </div>
                            {entityType === 'individual' && (
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Organization</label>
                                    <div className="relative">
                                        <input 
                                            value={editingContact.company}
                                            onChange={e => setEditingContact({...editingContact, company: e.target.value})}
                                            className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 pl-12 text-white focus:outline-none focus:border-lime-400 transition-colors font-mono text-sm"
                                            placeholder="Company Name"
                                        />
                                        <Building2 className="absolute left-4 top-4.5 w-4 h-4 text-zinc-600" />
                                    </div>
                                </div>
                            )}
                            
                            <div className={entityType === 'organization' ? 'col-span-2' : ''}>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">{entityType === 'organization' ? 'Headquarters Phone' : 'Contact Email'}</label>
                                <input 
                                    required={entityType === 'individual'}
                                    type={entityType === 'individual' ? 'email' : 'text'}
                                    value={entityType === 'individual' ? editingContact.email : editingContact.phone}
                                    onChange={e => entityType === 'individual' ? setEditingContact({...editingContact, email: e.target.value}) : setEditingContact({...editingContact, phone: e.target.value})}
                                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-white focus:outline-none focus:border-lime-400 transition-colors font-mono text-sm"
                                    placeholder={entityType === 'individual' ? "email@domain.com" : "+1 ..."}
                                />
                            </div>
                            {entityType === 'individual' && (
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Phone</label>
                                    <input 
                                        value={editingContact.phone}
                                        onChange={e => setEditingContact({...editingContact, phone: e.target.value})}
                                        className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-white focus:outline-none focus:border-lime-400 transition-colors font-mono text-sm"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            )}
                        </div>

                        {entityType === 'individual' && (
                            <div className="p-8 bg-zinc-950 border-2 border-zinc-800 space-y-6 relative overflow-hidden">
                                <h4 className="text-xs font-black text-white uppercase flex items-center gap-3 tracking-widest border-b-2 border-zinc-900 pb-4">
                                    <Tag className="w-4 h-4 text-lime-400" /> Deal Metadata
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Value ($)</label>
                                        <input 
                                            type="number"
                                            value={editingContact.value}
                                            onChange={e => setEditingContact({...editingContact, value: Number(e.target.value)})}
                                            className="w-full bg-black border-2 border-zinc-800 p-3 text-lime-400 font-mono font-bold focus:outline-none focus:border-lime-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Pipeline Stage</label>
                                        <select 
                                            value={editingContact.stage}
                                            onChange={e => setEditingContact({...editingContact, stage: e.target.value as StageId})}
                                            className="w-full bg-black border-2 border-zinc-800 p-3 text-white font-bold uppercase text-xs focus:outline-none focus:border-lime-400 appearance-none"
                                        >
                                            <option value="new">New Lead</option>
                                            <option value="contacted">Hot Lead</option>
                                            <option value="appointment">Booking Confirmed</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="closed">Closed Won</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Tags</label>
                            <input 
                                value={editingContact.tags.join(', ')}
                                onChange={e => setEditingContact({...editingContact, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                                className="w-full bg-zinc-950 border-2 border-zinc-800 p-3 text-zinc-300 text-xs focus:outline-none focus:border-lime-400 font-mono"
                                placeholder="VIP, Referral, Q4..."
                            />
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t-2 border-zinc-800 bg-zinc-950 flex justify-between items-center">
                    {!isNew && (
                        <button 
                            type="button" 
                            onClick={() => handleDelete(editingContact.id)}
                            className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-wider px-4 py-2 border-2 ${userRole === 'user' ? 'border-zinc-800 text-zinc-700 cursor-not-allowed' : 'border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors'}`}
                            disabled={userRole === 'user'}
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete
                        </button>
                    )}
                    <div className="flex gap-4 ml-auto">
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-3 bg-lime-400 text-black px-10 py-4 font-black uppercase tracking-wider border-2 border-lime-500 hover:shadow-[6px_6px_0px_0px_#fff] hover:translate-y-[-2px] transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {isNew ? (entityType === 'organization' ? 'Create Account' : 'Create Record') : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
