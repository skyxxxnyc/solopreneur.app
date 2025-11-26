import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';

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

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#27272a] transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 ${color} border-2 border-black`}>
        <Icon className="w-6 h-6 text-black" />
      </div>
      <span className="text-zinc-500 text-sm font-mono">Last 7d</span>
    </div>
    <h3 className="text-zinc-400 text-sm uppercase tracking-wider font-bold mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-white font-mono">{value}</span>
      <span className="text-lime-400 text-xs font-bold font-mono">{change}</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pipeline Value" value="$42,500" change="+12.5%" icon={DollarSign} color="bg-lime-400" />
        <StatCard title="Conversion Rate" value="18.2%" change="+2.1%" icon={TrendingUp} color="bg-cyan-400" />
        <StatCard title="Active Leads" value="142" change="+14" icon={Users} color="bg-orange-400" />
        <StatCard title="Tasks Due" value="8" change="-2" icon={Activity} color="bg-pink-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
          <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Revenue Trajectory</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" tick={{fontFamily: 'monospace'}} />
                <YAxis stroke="#71717a" tick={{fontFamily: 'monospace'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '2px solid #3f3f46', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #000' }}
                  itemStyle={{ color: '#ecfccb', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="value" stroke="#a3e635" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a]">
          <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Funnel Efficiency</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} />
                <XAxis type="number" stroke="#71717a" hide />
                <YAxis dataKey="name" type="category" stroke="#71717a" tick={{fontFamily: 'monospace', fontSize: 14}} width={60} />
                <Tooltip 
                  cursor={{fill: '#27272a'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '2px solid #3f3f46', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #000' }}
                />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
