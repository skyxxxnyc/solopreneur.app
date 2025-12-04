
import React, { useState } from 'react';
import { Palette, Wand2, Save, Upload, Loader2, User, Database, AlertCircle, RefreshCw, Users, Lock } from 'lucide-react';
import { generateBrandAsset } from '../services/geminiService';
import { User as UserType, Tenant } from '../types';
import { MOCK_USERS } from '../constants';

interface SettingsProps {
    user: UserType;
    tenant: Tenant | undefined;
}

export const Settings: React.FC<SettingsProps> = ({ user, tenant }) => {
    const [logoPrompt, setLogoPrompt] = useState('Neo-brutalist logo for an app called "thesolopreneur.app". Minimalist, dark mode, sharp edges, high contrast, lime green and black color scheme. Geometric shapes.');
    const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleGenerateLogo = async () => {
        setIsGenerating(true);
        const image = await generateBrandAsset(logoPrompt);
        if (image) {
            setGeneratedLogo(image);
        }
        setIsGenerating(false);
    };

    const handleResetData = () => {
        if (confirm("WARNING: This will delete ALL contacts, campaigns, funnels, and agent configurations. This action cannot be undone.")) {
            setIsResetting(true);
            localStorage.clear();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
             <div className="mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Platform Settings</h2>
                <p className="text-zinc-500 font-mono text-sm">Manage branding, profile, and system preferences.</p>
             </div>

             <div className="flex-1 overflow-y-auto space-y-8 pb-10">
                
                {/* User & Organization (Read Only) */}
                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-zinc-800">
                        <div className="p-2 bg-cyan-400 border border-black">
                             <User className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase">Profile Settings</h3>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Organization</label>
                            <input className="w-full bg-zinc-950 border-2 border-zinc-800 p-3 text-white font-bold opacity-50 cursor-not-allowed" readOnly value={tenant?.name} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email</label>
                            <input className="w-full bg-zinc-950 border-2 border-zinc-800 p-3 text-white font-mono opacity-50 cursor-not-allowed" readOnly value={user.email} />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Role</label>
                            <div className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs font-mono uppercase text-lime-400">
                                <Lock className="w-3 h-3" />
                                {user.role}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Management (Admins Only) */}
                {(user.role === 'admin' || user.role === 'agency_admin') && (
                    <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-zinc-800">
                            <div className="p-2 bg-pink-400 border border-black">
                                <Users className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase">Team Management</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400">Users in this organization:</p>
                            <div className="space-y-2">
                                {MOCK_USERS.filter(u => u.tenantId === tenant?.id).map(u => (
                                    <div key={u.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{u.name}</div>
                                                <div className="text-xs text-zinc-500">{u.email}</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-400">{u.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Brand Identity Section */}
                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-zinc-800">
                        <div className="p-2 bg-lime-400 border border-black">
                             <Palette className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase">Brand Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                             <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">AI Logo Generator</label>
                             <div className="mb-4">
                                <textarea 
                                    value={logoPrompt}
                                    onChange={(e) => setLogoPrompt(e.target.value)}
                                    className="w-full h-24 bg-zinc-950 border-2 border-zinc-800 p-3 text-white text-sm focus:border-lime-400 focus:outline-none resize-none"
                                    placeholder="Describe your desired logo..."
                                />
                             </div>
                             <button 
                                onClick={handleGenerateLogo}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white px-4 py-3 font-bold border-2 border-zinc-700 hover:border-lime-400 hover:text-lime-400 disabled:opacity-50 transition-all"
                             >
                                 {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                 {isGenerating ? 'GENERATING ASSET...' : 'GENERATE LOGO WITH GEMINI'}
                             </button>
                        </div>

                        <div className="flex flex-col items-center justify-center bg-zinc-950 border-2 border-dashed border-zinc-800 min-h-[250px] relative group">
                            {generatedLogo ? (
                                <div className="relative w-full h-full flex items-center justify-center p-8">
                                    <img src={generatedLogo} alt="Generated Logo" className="max-w-full max-h-64 shadow-2xl" />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                         <button className="bg-zinc-900 text-white p-2 border border-zinc-700 hover:bg-lime-400 hover:text-black hover:border-black transition-colors">
                                            <Save className="w-4 h-4" />
                                         </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                        <Upload className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <p className="text-zinc-500 font-mono text-sm uppercase">No Logo Generated</p>
                                    <p className="text-zinc-600 text-xs mt-1">Use the AI tool to create your brand asset.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Database Management Section */}
                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] border-red-900/50">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-zinc-800">
                        <div className="p-2 bg-red-500 border border-black">
                             <Database className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase">Database Management</h3>
                    </div>
                    
                    <div className="flex items-start gap-4">
                         <div className="flex-1">
                             <div className="flex items-center gap-2 text-red-400 font-bold mb-1 uppercase text-sm">
                                 <AlertCircle className="w-4 h-4" />
                                 Danger Zone
                             </div>
                             <p className="text-zinc-400 text-sm">
                                 Resetting the database will wipe all contacts, campaigns, posts, and agent configurations stored on this device. 
                                 The app will return to its initial state with sample data.
                             </p>
                         </div>
                         <button 
                            onClick={handleResetData}
                            disabled={isResetting}
                            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 font-bold border-2 border-red-400 hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_#991b1b] transition-all disabled:opacity-50"
                         >
                            {isResetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                            {isResetting ? 'Wiping Data...' : 'Reset Database'}
                         </button>
                    </div>
                </div>
             </div>
        </div>
    );
}
