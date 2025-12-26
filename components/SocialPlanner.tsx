
import React, { useState } from 'react';
import { SocialPost, SocialPlatform } from '../types';
import { INITIAL_SOCIAL_POSTS } from '../constants';
import { generateSocialPost, generateBrandAsset, generateSocialVideo, analyzeImageForCaption } from '../services/geminiService';
import { Share2, Calendar as CalendarIcon, Wand2, Image as ImageIcon, Loader2, Twitter, Linkedin, Instagram, Plus, X, Trash2, CheckCircle, Heart, MessageCircle, Repeat2, Send, Bookmark, MoreHorizontal, ThumbsUp, Eye, List as ListIcon, ChevronLeft, ChevronRight, Clock, Video, ScanEye } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PostPreview: React.FC<{
    platform: SocialPlatform;
    content: string;
    image: string | null;
    video: string | null;
    hashtags: string[];
}> = ({ platform, content, image, video, hashtags }) => {
    const renderContent = () => {
        const fullText = `${content} ${hashtags.join(' ')}`;
        
        const MediaContent = () => {
            if (video) {
                return <video src={video} controls className="w-full h-auto rounded-none border border-zinc-800 mb-3 object-cover max-h-80" />;
            }
            if (image) {
                return <img src={image} className="w-full h-auto rounded-none border border-zinc-800 mb-3 object-cover max-h-80" alt="Preview" />;
            }
            return null;
        };

        if (platform === 'twitter') {
            return (
                <div className="bg-black text-white p-8 rounded-none border-2 border-zinc-800 max-w-md w-full font-sans shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-lime-400 shrink-0 border-2 border-white"></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-[15px] truncate">The Solopreneur</span>
                                <span className="text-zinc-500 text-[14px] truncate">@solopreneur · 1m</span>
                            </div>
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-4 text-white font-medium">
                                {fullText || <span className="text-zinc-700 italic">Start writing...</span>}
                            </p>
                            <MediaContent />
                            <div className="flex justify-between text-zinc-500 max-w-[85%] mt-4">
                                <MessageCircle className="w-5 h-5 hover:text-blue-400 transition-colors" />
                                <Repeat2 className="w-5 h-5 hover:text-green-400 transition-colors" />
                                <Heart className="w-5 h-5 hover:text-pink-400 transition-colors" />
                                <Share2 className="w-5 h-5 hover:text-blue-400 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (platform === 'linkedin') {
            return (
                <div className="bg-[#1b1f23] text-white rounded-none border-2 border-zinc-700 max-w-md w-full font-sans overflow-hidden shadow-[8px_8px_0px_0px_#000]">
                    <div className="p-4 flex gap-3 border-b border-zinc-800">
                         <div className="w-12 h-12 bg-lime-400 shrink-0 border border-white/10"></div>
                         <div>
                             <div className="font-bold text-sm text-white/90">The Solopreneur</div>
                             <div className="text-xs text-zinc-400">Building empires one pixel at a time</div>
                             <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">1m • <span className="text-[10px]">🌐</span></div>
                         </div>
                         <MoreHorizontal className="w-5 h-5 text-zinc-400 ml-auto" />
                    </div>
                    <div className="px-4 py-3 text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                         {fullText || <span className="text-zinc-500 italic">Start writing...</span>}
                    </div>
                    {video ? (
                        <video src={video} controls className="w-full h-auto border-y border-zinc-700/50 object-cover max-h-80" />
                    ) : image && (
                        <img src={image} className="w-full h-auto border-y border-zinc-700/50 object-cover max-h-80" alt="Preview" />
                    )}
                    <div className="p-3 flex justify-between border-t border-zinc-700/50 px-6 bg-[#1b1f23]">
                        <div className="flex flex-col items-center gap-1 text-zinc-400 hover:bg-zinc-800/50 p-1 rounded transition-colors cursor-pointer">
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Like</span>
                        </div>
                         <div className="flex flex-col items-center gap-1 text-zinc-400 hover:bg-zinc-800/50 p-1 rounded transition-colors cursor-pointer">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Comment</span>
                        </div>
                         <div className="flex flex-col items-center gap-1 text-zinc-400 hover:bg-zinc-800/50 p-1 rounded transition-colors cursor-pointer">
                            <Repeat2 className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Repost</span>
                        </div>
                         <div className="flex flex-col items-center gap-1 text-zinc-400 hover:bg-zinc-800/50 p-1 rounded transition-colors cursor-pointer">
                            <Send className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Send</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (platform === 'instagram') {
             return (
                <div className="bg-black text-white rounded-none border-2 border-zinc-800 max-w-sm w-full font-sans overflow-hidden shadow-[8px_8px_0px_0px_#000]">
                    <div className="p-3 flex items-center justify-between border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-lime-400 border border-zinc-700"></div>
                             <span className="text-sm font-bold">the.solopreneur</span>
                        </div>
                        <MoreHorizontal className="w-4 h-4" />
                    </div>
                    <div className="aspect-square bg-zinc-900 w-full flex items-center justify-center border-y border-zinc-800 overflow-hidden">
                         {video ? (
                             <video src={video} controls className="w-full h-full object-cover" />
                         ) : image ? (
                             <img src={image} className="w-full h-full object-cover" alt="Preview" />
                         ) : (
                             <span className="text-zinc-700 text-xs uppercase font-mono tracking-widest">Media Preview</span>
                         )}
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between mb-4">
                            <div className="flex gap-4">
                                <Heart className="w-6 h-6 hover:text-zinc-400 cursor-pointer" />
                                <MessageCircle className="w-6 h-6 hover:text-zinc-400 cursor-pointer" />
                                <Send className="w-6 h-6 hover:text-zinc-400 cursor-pointer" />
                            </div>
                            <Bookmark className="w-6 h-6 hover:text-zinc-400 cursor-pointer" />
                        </div>
                        <div className="text-sm leading-relaxed">
                            <span className="font-bold mr-2">the.solopreneur</span>
                             {fullText || <span className="text-zinc-600 italic">Start writing...</span>}
                        </div>
                    </div>
                </div>
             );
        }
    };

    return (
        <div className="flex flex-col items-center">
             {renderContent()}
             <div className="mt-8 flex items-center gap-3 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em] border border-zinc-800 px-4 py-1.5 bg-black">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Live {platform} Preview
             </div>
        </div>
    );
};

interface SocialPlannerProps {
    tenantId: string;
}

export const SocialPlanner: React.FC<SocialPlannerProps> = ({ tenantId }) => {
    const [posts, setPosts] = useLocalStorage<SocialPost[]>('social_posts', INITIAL_SOCIAL_POSTS);
    
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    
    const tenantPosts = posts.filter(p => p.tenantId === tenantId);
    
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

    const [platform, setPlatform] = useState<SocialPlatform>('linkedin');
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [image, setImage] = useState<string | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().slice(0, 16));
    
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

    const handleGenerateContent = async () => {
        if (!topic) return;
        setIsGeneratingText(true);
        const result = await generateSocialPost(topic, platform);
        setContent(result.content);
        setHashtags(result.hashtags);
        setIsGeneratingText(false);
    };

    const handleGenerateImage = async () => {
        if (!topic) return;
        setIsGeneratingImage(true);
        const result = await generateBrandAsset(`Social media image for: ${topic}. Style: Minimalist, modern, professional.`);
        if (result) {
            setImage(result);
            setVideo(null);
        }
        setIsGeneratingImage(false);
    };

    const handleGenerateVideo = async () => {
        if (!topic) return;
        setIsGeneratingVideo(true);
        const result = await generateSocialVideo(`Cinematic social media video about: ${topic}. Modern, clean, professional.`);
        if (result) {
            setVideo(result);
            setImage(null);
        }
        setIsGeneratingVideo(false);
    };

    const handleAnalyzeImage = async () => {
        if (!image || !topic) return;
        setIsAnalyzingImage(true);
        const caption = await analyzeImageForCaption(image, topic);
        if (caption) {
            setContent(caption);
        }
        setIsAnalyzingImage(false);
    };

    const handleSavePost = () => {
        if (!content) return;
        const newPost: SocialPost = {
            id: Date.now().toString(),
            tenantId: tenantId,
            platform,
            content,
            hashtags,
            image: image || undefined,
            video: video || undefined,
            scheduledDate: new Date(scheduledDate).toISOString(),
            status: 'scheduled'
        };
        setPosts([...posts, newPost]);
        setIsCreating(false);
        resetForm();
    };

    const resetForm = () => {
        setTopic('');
        setContent('');
        setHashtags([]);
        setImage(null);
        setVideo(null);
        setScheduledDate(new Date().toISOString().slice(0, 16));
    };

    const getPlatformIcon = (p: SocialPlatform) => {
        switch(p) {
            case 'twitter': return <Twitter className="w-4 h-4" />;
            case 'linkedin': return <Linkedin className="w-4 h-4" />;
            case 'instagram': return <Instagram className="w-4 h-4" />;
        }
    };

    const getPlatformColor = (p: SocialPlatform) => {
        switch(p) {
            case 'twitter': return 'text-sky-400 border-sky-400 hover:bg-sky-900/20';
            case 'linkedin': return 'text-blue-500 border-blue-500 hover:bg-blue-900/20';
            case 'instagram': return 'text-pink-500 border-pink-500 hover:bg-pink-900/20';
        }
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[100px] md:min-h-[140px] bg-zinc-950 border-r border-b border-zinc-800/30"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(year, month, day).toDateString();
            const daysPosts = tenantPosts.filter(p => new Date(p.scheduledDate).toDateString() === dateStr);
            const isToday = new Date().toDateString() === dateStr;

            days.push(
                <div key={day} className={`min-h-[100px] md:min-h-[140px] border-r border-b border-zinc-800/30 p-2 md:p-3 hover:bg-zinc-900/50 transition-colors group relative ${isToday ? 'bg-zinc-900/30' : ''}`}>
                    <div className={`text-right text-xs font-mono font-bold mb-2 md:mb-4 ${isToday ? 'text-lime-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                        {day}
                    </div>
                    <div className="space-y-2">
                        {daysPosts.map(post => (
                            <div key={post.id} className={`flex items-center gap-2 p-1 md:p-1.5 border-l-[3px] bg-zinc-900 text-[8px] md:text-[10px] font-bold uppercase truncate cursor-pointer hover:brightness-125 transition-all shadow-sm ${getPlatformColor(post.platform)}`}>
                                {getPlatformIcon(post.platform)}
                                <span className="truncate tracking-wide hidden md:inline">{post.content}</span>
                            </div>
                        ))}
                    </div>
                    {isToday && <div className="absolute top-3 left-3 md:top-4 md:left-4 w-1.5 h-1.5 bg-lime-400 rounded-full shadow-[0_0_8px_rgba(163,230,53,0.8)]"></div>}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentCalendarDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentCalendarDate(newDate);
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
             <div className="mb-6 bg-zinc-950 border-2 border-zinc-800 p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Social Planner</h2>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Strategy & Distribution</p>
                </div>
                {!isCreating && (
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="flex bg-black border-2 border-zinc-800 p-1">
                            <button 
                                onClick={() => setViewMode('calendar')}
                                className={`p-3 transition-all ${viewMode === 'calendar' ? 'bg-lime-400 text-black shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-3 transition-all ${viewMode === 'list' ? 'bg-lime-400 text-black shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-lime-400 text-black px-6 py-4 font-black uppercase tracking-wider border-2 border-lime-500 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_#000] shadow-[6px_6px_0px_0px_#000] transition-all whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5 stroke-[3]" />
                            Create Post
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex gap-0 overflow-hidden shadow-[8px_8px_0px_0px_#000] border-2 border-zinc-800">
                {!isCreating ? (
                    <div className="flex-1 overflow-hidden flex flex-col bg-black">
                        {viewMode === 'calendar' ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Calendar Header */}
                                <div className="p-4 md:p-8 border-b-2 border-zinc-800 flex justify-between items-center bg-zinc-950">
                                    <div className="flex items-center gap-4 md:gap-8">
                                        <button onClick={() => changeMonth(-1)} className="p-2 md:p-3 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors border-2 border-transparent hover:border-zinc-800"><ChevronLeft className="w-5 h-5" /></button>
                                        <h3 className="text-lg md:text-2xl font-black text-white uppercase w-32 md:w-72 text-center tracking-tight italic">
                                            {currentCalendarDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                        </h3>
                                        <button onClick={() => changeMonth(1)} className="p-2 md:p-3 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors border-2 border-transparent hover:border-zinc-800"><ChevronRight className="w-5 h-5" /></button>
                                    </div>
                                    <button 
                                        onClick={() => setCurrentCalendarDate(new Date())}
                                        className="text-[10px] md:text-xs font-bold uppercase text-zinc-500 hover:text-lime-400 border-b-2 border-transparent hover:border-lime-400 transition-all tracking-wider pb-1"
                                    >
                                        Jump to Today
                                    </button>
                                </div>
                                
                                {/* Days Header */}
                                <div className="grid grid-cols-7 bg-zinc-950 border-b-2 border-zinc-800">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                        <div key={day} className="p-2 md:p-4 text-center text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-r-2 border-zinc-800 last:border-r-0">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="flex-1 grid grid-cols-7 overflow-y-auto bg-black">
                                    {renderCalendar()}
                                </div>
                            </div>
                        ) : (
                             <div className="flex-1 overflow-y-auto space-y-6 p-4 md:p-8">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 px-1">Upcoming Content Queue</h3>
                                {tenantPosts.sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()).map(post => (
                                    <div key={post.id} className="bg-zinc-900 border-2 border-zinc-800 p-6 md:p-8 hover:border-lime-400 transition-all group flex flex-col md:flex-row gap-6 md:gap-10 shadow-[6px_6px_0px_0px_#000] hover:translate-x-1">
                                        {/* Date Badge */}
                                        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center p-0 bg-black border-2 border-zinc-800 w-full md:w-28 md:h-28 shrink-0 shadow-sm px-4 md:px-0 py-2 md:py-0">
                                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] md:pt-3 md:border-b-2 border-zinc-800 w-auto md:w-full md:text-center md:pb-2">{new Date(post.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl md:text-4xl text-white font-black flex-1 flex items-center">{new Date(post.scheduledDate).getDate()}</span>
                                            <span className="md:hidden text-xs text-zinc-500 font-mono">{new Date(post.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`inline-flex items-center gap-3 px-4 py-1.5 border-2 text-[10px] font-black uppercase tracking-wide ${getPlatformColor(post.platform)}`}>
                                                    {getPlatformIcon(post.platform)}
                                                    {post.platform}
                                                </div>
                                                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setPosts(posts.filter(p => p.id !== post.id))} className="text-zinc-600 hover:text-red-500 transition-colors p-2 hover:bg-zinc-800"><Trash2 className="w-5 h-5"/></button>
                                                </div>
                                            </div>
                                            <p className="text-white text-base mb-6 line-clamp-2 leading-relaxed font-bold">{post.content}</p>
                                            <div className="flex gap-4">
                                                {post.image && (
                                                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono uppercase bg-black px-3 py-1.5 border border-zinc-800">
                                                        <ImageIcon className="w-3 h-3 text-purple-400" /> Image Asset
                                                    </div>
                                                )}
                                                {post.video && (
                                                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono uppercase bg-black px-3 py-1.5 border border-zinc-800">
                                                        <Video className="w-3 h-3 text-cyan-400" /> Video Asset
                                                    </div>
                                                )}
                                                <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase ml-auto">
                                                    <Clock className="w-3 h-3" /> {new Date(post.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {tenantPosts.length === 0 && (
                                    <div className="p-24 text-center border-2 border-dashed border-zinc-800 text-zinc-700 font-mono uppercase text-sm tracking-[0.2em]">
                                        Queue Empty // Add content to begin
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // PREVIEW AREA (When Creating)
                    <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8 md:p-16 border-r-2 border-zinc-800 min-h-[500px]">
                        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
                        <h3 className="absolute top-4 left-4 md:top-8 md:left-8 text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Eye className="w-4 h-4 text-lime-400" /> Live Preview Mode
                        </h3>
                        <div className="z-10 w-full flex justify-center scale-90 md:scale-100 transition-transform">
                            <PostPreview platform={platform} content={content} image={image} video={video} hashtags={hashtags} />
                        </div>
                    </div>
                )}

                {/* Editor Sidebar (Conditional) - Fullscreen on mobile */}
                {isCreating && (
                    <div className="fixed inset-0 md:static md:w-[550px] bg-zinc-950 border-l-2 border-zinc-800 p-6 md:p-10 flex flex-col h-full animate-in slide-in-from-right duration-300 md:shadow-[-20px_0px_60px_rgba(0,0,0,0.8)] z-50">
                        <div className="flex justify-between items-center mb-6 md:mb-10 border-b-2 border-zinc-800 pb-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Compose</h3>
                            <button onClick={() => setIsCreating(false)} className="hover:bg-zinc-900 p-3 border-2 border-transparent hover:border-zinc-800 transition-all"><X className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 md:space-y-10 pr-2 custom-scrollbar">
                            {/* Platform Select */}
                            <div className="grid grid-cols-3 gap-2 md:gap-4">
                                {(['linkedin', 'twitter', 'instagram'] as SocialPlatform[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={`flex items-center justify-center gap-2 py-3 md:py-4 border-2 uppercase text-[10px] font-black tracking-wider transition-all hover:translate-y-[-2px] ${platform === p ? 'bg-zinc-900 text-white border-lime-400 shadow-[4px_4px_0px_0px_#000]' : 'bg-black text-zinc-600 border-zinc-800 hover:border-zinc-600 hover:text-white'}`}
                                    >
                                        <span className="hidden md:inline">{getPlatformIcon(p)}</span> {p.slice(0, 3)}
                                    </button>
                                ))}
                            </div>

                            {/* AI Idea Input */}
                            <div className="bg-black border-2 border-zinc-800 p-4 md:p-6 relative group shadow-sm">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                                <h3 className="text-xs font-black text-purple-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
                                    <Wand2 className="w-4 h-4" /> AI Content Studio
                                </h3>
                                <div className="space-y-4">
                                    <input 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="What's this post about?"
                                        className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 text-white text-sm focus:border-purple-400 focus:outline-none transition-colors font-bold"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={handleGenerateContent}
                                            disabled={isGeneratingText || !topic}
                                            className="py-3 bg-purple-900/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-black hover:border-purple-500 font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isGeneratingText ? <Loader2 className="w-3 h-3 animate-spin" /> : "Write Caption"}
                                        </button>
                                        <button 
                                            onClick={handleGenerateImage}
                                            disabled={isGeneratingImage || !topic}
                                            className="py-3 bg-purple-900/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-black hover:border-purple-500 font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : "Gen Image"}
                                        </button>
                                         <button 
                                            onClick={handleGenerateVideo}
                                            disabled={isGeneratingVideo || !topic}
                                            className="col-span-2 py-3 bg-purple-900/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-black hover:border-purple-500 font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isGeneratingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                                            {isGeneratingVideo ? 'Rendering Video (Veo)...' : 'Generate Video (Veo)'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Edit */}
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Caption</label>
                                    <textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-32 md:h-48 bg-black border-2 border-zinc-800 p-5 text-white text-sm focus:border-lime-400 focus:outline-none resize-none font-medium leading-relaxed"
                                        placeholder="Write your post content here..."
                                    />
                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        {hashtags.map((tag, i) => (
                                            <span key={i} className="text-[10px] font-black text-zinc-400 bg-zinc-900 px-3 py-1.5 border border-zinc-800 uppercase tracking-wide">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Media Asset</label>
                                    {image || video ? (
                                        <div className="relative group/img bg-black border-2 border-zinc-800 p-2">
                                            {video ? (
                                                <video src={video} controls className="w-full border border-zinc-800" />
                                            ) : image && (
                                                <img src={image} alt="Post media" className="w-full border border-zinc-800" />
                                            )}
                                            
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                 {image && (
                                                    <button 
                                                        onClick={handleAnalyzeImage}
                                                        className="p-3 bg-blue-500 text-white hover:bg-blue-600 border-2 border-black shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1"
                                                        title="AI Caption from Image"
                                                    >
                                                        {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanEye className="w-4 h-4" />}
                                                    </button>
                                                 )}
                                                <button 
                                                    onClick={() => { setImage(null); setVideo(null); }}
                                                    className="p-3 bg-red-500 text-white hover:bg-red-600 border-2 border-black shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 md:h-48 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-900/20 hover:bg-zinc-900/40">
                                            <ImageIcon className="w-10 h-10 mb-4 opacity-30" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">No Media Selected</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Schedule</label>
                                    <div className="relative">
                                        <input 
                                            type="datetime-local" 
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="w-full bg-black border-2 border-zinc-800 p-5 text-white text-sm focus:border-lime-400 focus:outline-none [color-scheme:dark] font-mono uppercase tracking-wide font-bold"
                                        />
                                        <Clock className="w-5 h-5 text-zinc-500 absolute right-5 top-5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t-2 border-zinc-800 mt-auto">
                            <button 
                                onClick={handleSavePost}
                                disabled={!content}
                                className="w-full py-5 bg-lime-400 text-black font-black uppercase tracking-[0.2em] text-sm hover:shadow-[6px_6px_0px_0px_#fff] hover:translate-y-[-2px] hover:translate-x-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border-2 border-lime-500"
                            >
                                Schedule Post
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
