
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import { Contact } from '../types';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const conversionData = [
  { name: 'Lead', count: 120 },
  { name: 'Call', count: 80 },
  { name: 'Prop', count: 60 },
  { name: 'Close', count: 25 },
];

const StatCard = ({ title, value, change, icon: Icon, color, borderColor }: any) => (
  <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 -translate-y-10 translate-x-10 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`}></div>
    <div className="flex justify-between items-start mb-8 relative">
      <div className={`p-4 bg-black border-2 ${borderColor} shadow-[4px_4px_0px_0px_#000]`}>
        <Icon className={`w-6 h-6 text-white`} />
      </div>
      <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest border border-zinc-800 px-2 py-0.5">Last 7d</span>
    </div>
    <div className="relative">
        <h3 className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-3">{title}</h3>
        <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-white font-sans tracking-tighter">{value}</span>
            <span className={`text-[10px] font-bold font-mono mb-2 px-1.5 py-0.5 border ${change.startsWith('+') ? 'text-lime-400 border-lime-400 bg-lime-400/10' : 'text-red-400 border-red-400 bg-red-400/10'}`}>
                {change}
            </span>
        </div>
    </div>
  </div>
);

interface DashboardProps {
  tenantId: string;
  contacts: Contact[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tenantId, contacts }) => {
  const tenantContacts = contacts.filter(c => c.tenantId === tenantId);
  const pipelineValue = tenantContacts.reduce((acc, c) => acc + c.value, 0);
  const activeLeads = tenantContacts.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 border-b-2 border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic">Launchpad</h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Mission Control // Overview</p>
          </div>
          <div className="text-[10px] font-mono text-lime-400 bg-black border border-lime-400/30 px-4 py-2 uppercase tracking-wider">
              System Status: Online
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} change="+12.5%" icon={DollarSign} color="bg-lime-400" borderColor="border-lime-500" />
        <StatCard title="Conversion Rate" value="18.2%" change="+2.1%" icon={TrendingUp} color="bg-cyan-400" borderColor="border-cyan-500" />
        <StatCard title="Active Leads" value={activeLeads.toString()} change="+14" icon={Users} color="bg-orange-400" borderColor="border-orange-500" />
        <StatCard title="Tasks Due" value="8" change="-2" icon={Activity} color="bg-pink-400" borderColor="border-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <div className="w-4 h-4 bg-lime-400 border border-black shadow-[2px_2px_0px_0px_#fff]"></div>
                Revenue Trajectory
            </h3>
            <button className="text-[10px] font-black uppercase text-zinc-500 hover:text-white border-b-2 border-zinc-800 hover:border-lime-400 transition-all pb-1 tracking-wider">Full Report</button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tick={{fontFamily: 'monospace', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#52525b" tick={{fontFamily: 'monospace', fontSize: 10}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '2px solid #3f3f46', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #fff' }}
                  itemStyle={{ color: '#ecfccb', fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase' }}
                  cursor={{stroke: '#52525b', strokeWidth: 1}}
                />
                <Area type="step" dataKey="value" stroke="#a3e635" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#000]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <div className="w-4 h-4 bg-cyan-400 border border-black shadow-[2px_2px_0px_0px_#fff]"></div>
                Funnel Efficiency
            </h3>
            <button className="text-[10px] font-black uppercase text-zinc-500 hover:text-white border-b-2 border-zinc-800 hover:border-cyan-400 transition-all pb-1 tracking-wider">Analysis</button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#52525b" hide />
                <YAxis dataKey="name" type="category" stroke="#71717a" tick={{fontFamily: 'monospace', fontSize: 12, fill: '#a1a1aa', fontWeight: 'bold'}} width={60} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#18181b'}}
                  contentStyle={{ backgroundColor: '#000', border: '2px solid #3f3f46', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #fff' }}
                  itemStyle={{ color: '#22d3ee', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
                <Bar dataKey="count" fill="#22d3ee" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
