import React, { useState } from 'react';
import { Palette, Wand2, Save, Upload, Loader2, User, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { generateBrandAsset } from '../services/geminiService';

export const Settings: React.FC = () => {
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

                {/* Profile Section */}
                <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-zinc-800">
                        <div className="p-2 bg-cyan-400 border border-black">
                             <User className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase">Profile Settings</h3>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Agency Name</label>
                            <input className="w-full bg-zinc-950 border-2 border-zinc-800 p-3 text-white font-bold" defaultValue="The Solopreneur App" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Admin Email</label>
                            <input className="w-full bg-zinc-950 border-2 border-zinc-800 p-3 text-white font-mono" defaultValue="admin@thesolopreneur.app" />
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