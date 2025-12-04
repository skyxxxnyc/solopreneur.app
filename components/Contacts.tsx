
import React, { useState } from 'react';
import { Contact, StageId, UserRole } from '../types';
import { Mail, Phone, Tag, Plus, Search, Trash2, X, Save } from 'lucide-react';

interface ContactsProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  tenantId: string;
  userRole: UserRole;
}

export const Contacts: React.FC<ContactsProps> = ({ contacts, setContacts, tenantId, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Filter contacts for current tenant
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
      setContacts(prev => [...prev, { ...editingContact, id: Date.now().toString(), tenantId }]);
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
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
        <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Smart CRM</h2>
            <p className="text-zinc-500 font-mono text-sm">Manage contacts, companies, and custom data.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="SEARCH CONTACTS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 bg-zinc-950 border-2 border-zinc-800 py-2 pl-10 pr-4 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
                />
            </div>
            <button 
                onClick={openNewContact}
                className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 font-bold border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] transition-all whitespace-nowrap"
            >
                <Plus className="w-4 h-4" />
                ADD CONTACT
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border-2 border-zinc-800 shadow-[4px_4px_0px_0px_#27272a] bg-zinc-950">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-zinc-900 text-zinc-400 font-mono text-sm uppercase tracking-wider border-b-2 border-zinc-800">
              <th className="p-4 border-r-2 border-zinc-800">Contact / Company</th>
              <th className="p-4 border-r-2 border-zinc-800">Contact Info</th>
              <th className="p-4 border-r-2 border-zinc-800">Value</th>
              <th className="p-4 border-r-2 border-zinc-800">Stage</th>
              <th className="p-4">Tags</th>
            </tr>
          </thead>
          <tbody className="bg-zinc-950 divide-y-2 divide-zinc-800">
            {filteredContacts.map((contact) => (
              <tr 
                key={contact.id} 
                onClick={() => { setIsNew(false); setEditingContact(contact); }}
                className="hover:bg-zinc-900/50 transition-colors group cursor-pointer"
              >
                <td className="p-4 border-r-2 border-zinc-800">
                  <div className="font-bold text-white">{contact.name}</div>
                  <div className="text-xs text-zinc-500 font-mono uppercase">{contact.company}</div>
                </td>
                <td className="p-4 border-r-2 border-zinc-800 text-sm text-zinc-300 space-y-1">
                    <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-zinc-600" />
                        <span className="font-mono">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-zinc-600" />
                        <span className="font-mono">{contact.phone}</span>
                    </div>
                </td>
                <td className="p-4 border-r-2 border-zinc-800 font-mono text-lime-400 font-bold">
                  ${contact.value.toLocaleString()}
                </td>
                <td className="p-4 border-r-2 border-zinc-800">
                  <span className="inline-block px-2 py-1 text-[10px] font-black uppercase bg-zinc-900 border border-zinc-700 text-zinc-300 tracking-wider">
                    {contact.stage}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {contact.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-1 border border-zinc-800">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono uppercase">
                        No contacts found for this tenant.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Drawer / Modal */}
      {editingContact && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full md:w-[500px] bg-zinc-950 border-l-2 border-zinc-800 shadow-[-4px_0px_0px_0px_#27272a] h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b-2 border-zinc-800 bg-zinc-900 flex justify-between items-center">
                    <h3 className="text-xl font-black text-white uppercase">{isNew ? 'New Contact' : 'Edit Contact'}</h3>
                    <button onClick={() => setEditingContact(null)} className="p-2 hover:bg-zinc-800 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                            <input 
                                required
                                value={editingContact.name}
                                onChange={e => setEditingContact({...editingContact, name: e.target.value})}
                                className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Company</label>
                            <input 
                                value={editingContact.company}
                                onChange={e => setEditingContact({...editingContact, company: e.target.value})}
                                className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email</label>
                                <input 
                                    required
                                    type="email"
                                    value={editingContact.email}
                                    onChange={e => setEditingContact({...editingContact, email: e.target.value})}
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Phone</label>
                                <input 
                                    value={editingContact.phone}
                                    onChange={e => setEditingContact({...editingContact, phone: e.target.value})}
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Pipeline Value ($)</label>
                                <input 
                                    type="number"
                                    value={editingContact.value}
                                    onChange={e => setEditingContact({...editingContact, value: Number(e.target.value)})}
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Stage</label>
                                <select 
                                    value={editingContact.stage}
                                    onChange={e => setEditingContact({...editingContact, stage: e.target.value as StageId})}
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                                >
                                    <option value="new">New Lead</option>
                                    <option value="contacted">Hot Lead</option>
                                    <option value="appointment">Booking Confirmed</option>
                                    <option value="negotiation">Negotiation</option>
                                    <option value="closed">Closed Won</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tags (comma separated)</label>
                            <input 
                                value={editingContact.tags.join(', ')}
                                onChange={e => setEditingContact({...editingContact, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                                className="w-full bg-zinc-900 border-2 border-zinc-800 p-2 text-white focus:outline-none focus:border-lime-400 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t-2 border-zinc-800">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-black text-zinc-400 uppercase">Custom Fields</h4>
                            <button 
                                type="button"
                                onClick={() => setEditingContact({...editingContact, customFields: [...editingContact.customFields, {id: Date.now().toString(), label: '', value: ''}]})}
                                className="text-xs text-lime-400 font-bold uppercase hover:underline"
                            >
                                + Add Field
                            </button>
                        </div>
                        <div className="space-y-3">
                            {editingContact.customFields.map((field, idx) => (
                                <div key={field.id} className="flex gap-2">
                                    <input 
                                        placeholder="Label"
                                        value={field.label}
                                        onChange={(e) => {
                                            const newFields = [...editingContact.customFields];
                                            newFields[idx].label = e.target.value;
                                            setEditingContact({...editingContact, customFields: newFields});
                                        }}
                                        className="w-1/3 bg-zinc-900 border border-zinc-800 p-2 text-sm text-zinc-300 focus:outline-none focus:border-lime-400"
                                    />
                                    <input 
                                        placeholder="Value"
                                        value={field.value}
                                        onChange={(e) => {
                                            const newFields = [...editingContact.customFields];
                                            newFields[idx].value = e.target.value;
                                            setEditingContact({...editingContact, customFields: newFields});
                                        }}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-sm text-white focus:outline-none focus:border-lime-400"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const newFields = editingContact.customFields.filter((_, i) => i !== idx);
                                            setEditingContact({...editingContact, customFields: newFields});
                                        }}
                                        className="p-2 text-zinc-500 hover:text-red-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t-2 border-zinc-800 bg-zinc-900 flex justify-between">
                    {!isNew && (
                        <button 
                            type="button" 
                            onClick={() => handleDelete(editingContact.id)}
                            className={`flex items-center gap-2 font-bold uppercase text-xs ${userRole === 'user' ? 'text-zinc-600 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
                            disabled={userRole === 'user'}
                            title={userRole === 'user' ? "Permission Denied" : "Delete"}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                    <div className="flex gap-4 ml-auto">
                        <button 
                            type="button"
                            onClick={() => setEditingContact(null)}
                            className="px-4 py-2 font-bold text-zinc-400 uppercase hover:text-white"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-lime-400 text-black px-6 py-2 font-bold border-2 border-lime-500 hover:shadow-[4px_4px_0px_0px_#3f3f46] hover:translate-y-[-2px] transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {isNew ? 'Create' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
