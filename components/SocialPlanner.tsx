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
                return <video src={video} controls className="w-full h-auto rounded-xl border border-zinc-800 mb-3 object-cover max-h-80" />;
            }
            if (image) {
                return <img src={image} className="w-full h-auto rounded-xl border border-zinc-800 mb-3 object-cover max-h-80" alt="Preview" />;
            }
            return null;
        };

        if (platform === 'twitter') {
            return (
                <div className="bg-black text-white p-4 rounded-xl border border-zinc-800 max-w-md w-full font-sans">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-lime-400 shrink-0 border border-zinc-700"></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="font-bold text-sm truncate">The Solopreneur</span>
                                <span className="text-zinc-500 text-sm truncate">@solopreneur · 1m</span>
                            </div>
                            <p className="text-[15px] leading-normal whitespace-pre-wrap mb-3 text-zinc-200">
                                {fullText || <span className="text-zinc-600 italic">Start writing...</span>}
                            </p>
                            <MediaContent />
                            <div className="flex justify-between text-zinc-500 max-w-[85%]">
                                <MessageCircle className="w-4 h-4" />
                                <Repeat2 className="w-4 h-4" />
                                <Heart className="w-4 h-4" />
                                <Share2 className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (platform === 'linkedin') {
            return (
                <div className="bg-[#1b1f23] text-white rounded-lg border border-zinc-700 max-w-md w-full font-sans overflow-hidden">
                    <div className="p-3 flex gap-2">
                         <div className="w-10 h-10 rounded-sm bg-lime-400 shrink-0"></div>
                         <div>
                             <div className="font-bold text-sm text-white/90">The Solopreneur</div>
                             <div className="text-xs text-zinc-400">Building empires one pixel at a time</div>
                             <div className="text-xs text-zinc-400 flex items-center gap-1">1m • <span className="text-[10px]">🌐</span></div>
                         </div>
                         <MoreHorizontal className="w-5 h-5 text-zinc-400 ml-auto" />
                    </div>
                    <div className="px-3 pb-2 text-sm text-white/90 whitespace-pre-wrap">
                         {fullText || <span className="text-zinc-500 italic">Start writing...</span>}
                    </div>
                    {video ? (
                        <video src={video} controls className="w-full h-auto border-y border-zinc-800 object-cover max-h-80" />
                    ) : image && (
                        <img src={image} className="w-full h-auto border-y border-zinc-800 object-cover max-h-80" alt="Preview" />
                    )}
                    <div className="p-2 flex justify-between border-t border-zinc-700 px-4">
                        <div className="flex flex-col items-center gap-1 text-zinc-400">
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Like</span>
                        </div>
                         <div className="flex flex-col items-center gap-1 text-zinc-400">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Comment</span>
                        </div>
                         <div className="flex flex-col items-center gap-1 text-zinc-400">
                            <Repeat2 className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Repost</span>
                        </div>
                         <div className="flex flex-col items-center gap-1 text-zinc-400">
                            <Send className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Send</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (platform === 'instagram') {
             return (
                <div className="bg-black text-white rounded-lg border border-zinc-800 max-w-sm w-full font-sans overflow-hidden">
                    <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                             <span className="text-zinc-700 text-xs uppercase font-mono">Media Preview</span>
                         )}
                    </div>
                    <div className="p-3">
                        <div className="flex justify-between mb-2">
                            <div className="flex gap-4">
                                <Heart className="w-6 h-6" />
                                <MessageCircle className="w-6 h-6" />
                                <Send className="w-6 h-6" />
                            </div>
                            <Bookmark className="w-6 h-6" />
                        </div>
                        <div className="text-sm">
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
             <div className="mt-4 flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
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
    
    // Calendar State
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

    // Editor State
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
            case 'twitter': return 'text-sky-400 border-sky-400';
            case 'linkedin': return 'text-blue-500 border-blue-500';
            case 'instagram': return 'text-pink-500 border-pink-500';
        }
    };

    // Calendar Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-zinc-950/50 border border-zinc-800"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(year, month, day).toDateString();
            const daysPosts = tenantPosts.filter(p => new Date(p.scheduledDate).toDateString() === dateStr);
            const isToday = new Date().toDateString() === dateStr;

            days.push(
                <div key={day} className={`min-h-[120px] bg-zinc-900/30 border border-zinc-800 p-2 ${isToday ? 'bg-zinc-800/50' : ''}`}>
                    <div className={`text-right text-xs font-mono font-bold mb-2 ${isToday ? 'text-lime-400' : 'text-zinc-500'}`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {daysPosts.map(post => (
                            <div key={post.id} className={`flex items-center gap-1 p-1.5 border text-[10px] font-bold uppercase truncate cursor-pointer hover:opacity-80 transition-opacity ${getPlatformColor(post.platform)} bg-zinc-950`}>
                                {getPlatformIcon(post.platform)}
                                <span className="truncate">{post.content}</span>
                            </div>
                        ))}
                    </div>
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
        <div className="h-full flex flex-col animate-in fade-in duration-500">
             <div className="mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Social Planner</h2>
                    <p className="text-zinc-500 font-mono text-sm">Schedule and generate content with AI.</p>
                </div>
                {!isCreating && (
                    <div className="flex items-center gap-4">
                        <div className="flex bg-zinc-950 border-2 border-zinc-800 p-1">
                            <button 
                                onClick={() => setViewMode('calendar')}
                                className={`p-2 transition-all ${viewMode === 'calendar' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 transition-all ${viewMode === 'list' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 font-bold border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            CREATE POST
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex gap-0 overflow-hidden">
                {/* Main View Area (List or Calendar) */}
                {!isCreating ? (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {viewMode === 'calendar' ? (
                            <div className="flex-1 flex flex-col bg-zinc-900 border-2 border-zinc-800 shadow-[4px_4px_0px_0px_#27272a] overflow-hidden">
                                {/* Calendar Header */}
                                <div className="p-4 border-b-2 border-zinc-800 flex justify-between items-center bg-zinc-950">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => changeMonth(-1)} className="p-1 hover:text-lime-400 text-zinc-400 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                                        <h3 className="text-xl font-black text-white uppercase w-48 text-center">
                                            {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <button onClick={() => changeMonth(1)} className="p-1 hover:text-lime-400 text-zinc-400 transition-colors"><ChevronRight className="w-6 h-6" /></button>
                                    </div>
                                    <button 
                                        onClick={() => setCurrentCalendarDate(new Date())}
                                        className="text-xs font-bold uppercase text-zinc-500 hover:text-white"
                                    >
                                        Jump to Today
                                    </button>
                                </div>
                                
                                {/* Days Header */}
                                <div className="grid grid-cols-7 bg-zinc-950 border-b-2 border-zinc-800">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="p-2 text-center text-xs font-black text-zinc-600 uppercase border-r border-zinc-800 last:border-r-0">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="flex-1 grid grid-cols-7 overflow-y-auto bg-zinc-950">
                                    {renderCalendar()}
                                </div>
                            </div>
                        ) : (
                            // LIST VIEW
                             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-4">Upcoming Schedule</h3>
                                {tenantPosts.sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()).map(post => (
                                    <div key={post.id} className="bg-zinc-900 border-2 border-zinc-800 p-6 hover:border-lime-400 transition-colors group flex gap-6 shadow-[4px_4px_0px_0px_#27272a]">
                                        {/* Date Badge */}
                                        <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 w-24 h-24 shrink-0">
                                            <span className="text-xs text-zinc-500 font-bold uppercase">{new Date(post.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-3xl text-white font-black">{new Date(post.scheduledDate).getDate()}</span>
                                            <span className="text-[10px] text-zinc-600 font-mono mt-1">{new Date(post.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`inline-flex items-center gap-2 px-2 py-1 border text-[10px] font-bold uppercase ${getPlatformColor(post.platform)}`}>
                                                    {getPlatformIcon(post.platform)}
                                                    {post.platform}
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setPosts(posts.filter(p => p.id !== post.id))} className="text-zinc-500 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                            <p className="text-zinc-300 text-sm mb-3 line-clamp-2">{post.content}</p>
                                            {post.image && (
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase">
                                                    <ImageIcon className="w-3 h-3" /> Includes Image
                                                </div>
                                            )}
                                            {post.video && (
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase">
                                                    <Video className="w-3 h-3" /> Includes Video
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {tenantPosts.length === 0 && (
                                    <div className="p-12 text-center border-2 border-dashed border-zinc-800 text-zinc-500 font-mono uppercase">
                                        No upcoming posts scheduled.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // PREVIEW AREA (When Creating)
                    <div className="flex-1 bg-zinc-950 relative flex flex-col items-center justify-center p-8 border-r-2 border-zinc-800">
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <h3 className="absolute top-6 left-6 text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Live Preview
                        </h3>
                        <div className="z-10 w-full flex justify-center">
                            <PostPreview platform={platform} content={content} image={image} video={video} hashtags={hashtags} />
                        </div>
                    </div>
                )}

                {/* Editor Sidebar (Conditional) */}
                {isCreating && (
                    <div className="w-[450px] bg-zinc-900 border-l-2 border-zinc-800 p-6 flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-[-10px_0px_20px_rgba(0,0,0,0.5)] z-20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase">New Post</h3>
                            <button onClick={() => setIsCreating(false)} className="hover:bg-zinc-800 p-2"><X className="w-5 h-5 text-zinc-400" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                            {/* Platform Select */}
                            <div className="grid grid-cols-3 gap-2">
                                {(['linkedin', 'twitter', 'instagram'] as SocialPlatform[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={`flex items-center justify-center gap-2 py-2 border-2 uppercase text-[10px] font-bold transition-all ${platform === p ? 'bg-zinc-800 text-white border-lime-400' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
                                    >
                                        {getPlatformIcon(p)} {p}
                                    </button>
                                ))}
                            </div>

                            {/* AI Idea Input */}
                            <div className="bg-zinc-950 border border-zinc-700 p-4 relative group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <h3 className="text-xs font-black text-purple-400 uppercase mb-2 flex items-center gap-2">
                                    <Wand2 className="w-3 h-3" /> Content Studio
                                </h3>
                                <div className="space-y-2">
                                    <input 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="What's this post about?"
                                        className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white text-sm focus:border-purple-400 focus:outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={handleGenerateContent}
                                            disabled={isGeneratingText || !topic}
                                            className="py-2 bg-purple-500/20 text-purple-400 border border-purple-500 hover:bg-purple-500 hover:text-black font-bold uppercase text-[10px] transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isGeneratingText ? <Loader2 className="w-3 h-3 animate-spin" /> : "Write Caption"}
                                        </button>
                                        <button 
                                            onClick={handleGenerateImage}
                                            disabled={isGeneratingImage || !topic}
                                            className="py-2 bg-purple-500/20 text-purple-400 border border-purple-500 hover:bg-purple-500 hover:text-black font-bold uppercase text-[10px] transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : "Gen Image"}
                                        </button>
                                         <button 
                                            onClick={handleGenerateVideo}
                                            disabled={isGeneratingVideo || !topic}
                                            className="col-span-2 py-2 bg-purple-500/20 text-purple-400 border border-purple-500 hover:bg-purple-500 hover:text-black font-bold uppercase text-[10px] transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isGeneratingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                                            {isGeneratingVideo ? 'Creating Video...' : 'Gen Video (Veo)'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Edit */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Caption</label>
                                    <textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-32 bg-zinc-950 border-2 border-zinc-800 p-3 text-white text-sm focus:border-lime-400 focus:outline-none resize-none"
                                    />
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {hashtags.map((tag, i) => (
                                            <span key={i} className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-1 border border-zinc-800">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Media</label>
                                    {image || video ? (
                                        <div className="relative group/img">
                                            {video ? (
                                                <video src={video} controls className="w-full rounded-sm border-2 border-zinc-800" />
                                            ) : image && (
                                                <img src={image} alt="Post media" className="w-full rounded-sm border-2 border-zinc-800" />
                                            )}
                                            
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                 {image && (
                                                    <button 
                                                        onClick={handleAnalyzeImage}
                                                        className="p-1 bg-blue-500 text-white hover:bg-blue-400"
                                                        title="AI Caption from Image"
                                                    >
                                                        {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanEye className="w-4 h-4" />}
                                                    </button>
                                                 )}
                                                <button 
                                                    onClick={() => { setImage(null); setVideo(null); }}
                                                    className="p-1 bg-red-500 text-white hover:bg-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600">
                                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-[10px] uppercase">No Media Selected</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Schedule Date & Time</label>
                                    <div className="relative">
                                        <input 
                                            type="datetime-local" 
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="w-full bg-zinc-950 border-2 border-zinc-800 p-3 text-white text-sm focus:border-lime-400 focus:outline-none [color-scheme:dark]"
                                        />
                                        <Clock className="w-4 h-4 text-zinc-500 absolute right-3 top-3.5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t-2 border-zinc-800 mt-auto">
                            <button 
                                onClick={handleSavePost}
                                disabled={!content}
                                className="w-full py-3 bg-lime-400 text-black font-black uppercase tracking-wider hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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