
import React, { useState } from 'react';
import { Appointment } from '../types';
import { INITIAL_APPOINTMENTS, INITIAL_CONTACTS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChevronLeft, ChevronRight, Plus, Clock, Video, User, Loader2 } from 'lucide-react';
import { scheduleMeeting } from '../services/geminiService';

export const Calendar: React.FC = () => {
    const [appointments, setAppointments] = useLocalStorage<Appointment[]>('calendar_appointments', INITIAL_APPOINTMENTS);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isBooking, setIsBooking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [selectedContact, setSelectedContact] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [time, setTime] = useState('09:00');
    const [type, setType] = useState<Appointment['type']>('consultation');

    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const start = new Date(`${date}T${time}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default

        // Call Real Google Calendar API via Pica
        const success = await scheduleMeeting(title, date, time);
        if (!success) {
            console.error("Failed to add to Google Calendar (Check keys). Adding locally only.");
        }

        const newAppt: Appointment = {
            id: Date.now().toString(),
            title,
            contactId: selectedContact,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            status: 'confirmed',
            type
        };

        setAppointments([...appointments, newAppt]);
        setIsBooking(false);
        setIsSubmitting(false);
        // Reset form
        setTitle('');
        setSelectedContact('');
    };

    const getAppointmentsForSlot = (day: Date, hour: number) => {
        return appointments.filter(a => {
            const start = new Date(a.startTime);
            return start.getDate() === day.getDate() && 
                   start.getMonth() === day.getMonth() && 
                   start.getFullYear() === day.getFullYear() &&
                   start.getHours() === hour;
        });
    };

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'consultation': return 'bg-lime-400 border-lime-500 text-black';
            case 'demo': return 'bg-cyan-400 border-cyan-500 text-black';
            case 'onboarding': return 'bg-pink-400 border-pink-500 text-black';
            default: return 'bg-zinc-700 border-zinc-600 text-white';
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Calendar</h2>
                    <p className="text-zinc-500 font-mono text-sm">Manage appointments and bookings.</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}><ChevronLeft className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
                        <span className="text-sm font-bold w-32 text-center uppercase">{weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}><ChevronRight className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
                    </div>
                    <button 
                        onClick={() => setIsBooking(true)}
                        className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 font-bold border-2 border-lime-500 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        BOOK APP
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-zinc-950 border-2 border-zinc-800 flex flex-col overflow-hidden shadow-[4px_4px_0px_0px_#27272a]">
                {/* Header Row */}
                <div className="flex border-b-2 border-zinc-800">
                    <div className="w-16 border-r border-zinc-800 bg-zinc-900"></div>
                    {days.map(day => (
                        <div key={day.toISOString()} className="flex-1 py-3 text-center border-r border-zinc-800 bg-zinc-900 last:border-r-0">
                            <div className="text-[10px] text-zinc-500 font-black uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className={`text-lg font-black ${day.toDateString() === new Date().toDateString() ? 'text-lime-400' : 'text-white'}`}>{day.getDate()}</div>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto">
                    {hours.map(hour => (
                        <div key={hour} className="flex min-h-[80px] border-b border-zinc-800">
                            <div className="w-16 border-r border-zinc-800 bg-zinc-900/50 flex justify-center py-2">
                                <span className="text-xs font-mono text-zinc-500">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
                            </div>
                            {days.map(day => {
                                const slots = getAppointmentsForSlot(day, hour);
                                return (
                                    <div key={day.toISOString()} className="flex-1 border-r border-zinc-800 relative p-1 hover:bg-zinc-900/30 transition-colors last:border-r-0">
                                        {slots.map(appt => (
                                            <div key={appt.id} className={`p-2 mb-1 border-l-4 text-xs shadow-sm cursor-pointer hover:brightness-110 ${getTypeColor(appt.type)}`}>
                                                <div className="font-bold truncate">{appt.title}</div>
                                                <div className="flex items-center gap-1 opacity-80">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            {isBooking && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-6 w-[500px] shadow-[8px_8px_0px_0px_#27272a]">
                        <h3 className="text-xl font-black text-white uppercase mb-6">New Appointment</h3>
                        <form onSubmit={handleAddAppointment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Title</label>
                                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-lime-400 outline-none" placeholder="Meeting Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Contact</label>
                                <select required value={selectedContact} onChange={e => setSelectedContact(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-lime-400 outline-none">
                                    <option value="">Select a contact...</option>
                                    {INITIAL_CONTACTS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Date</label>
                                    <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-lime-400 outline-none [color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Time</label>
                                    <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-lime-400 outline-none [color-scheme:dark]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Type</label>
                                <div className="flex gap-2">
                                    {(['consultation', 'demo', 'onboarding'] as const).map(t => (
                                        <button 
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`flex-1 py-2 text-xs font-bold uppercase border-2 transition-all ${type === t ? 'bg-lime-400 border-lime-500 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsBooking(false)} className="px-4 py-2 text-zinc-400 font-bold uppercase hover:text-white">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-lime-400 text-black px-6 py-2 font-bold border-2 border-lime-500 hover:shadow-none shadow-[4px_4px_0px_0px_#3f3f46] hover:translate-y-1 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSubmitting ? 'Syncing...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
