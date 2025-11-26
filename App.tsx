
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  Users, 
  Workflow, 
  Settings as SettingsIcon, 
  MessageSquare,
  Command,
  Globe,
  Megaphone,
  Bot,
  Share2,
  ScanSearch,
  UserPlus
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Pipeline } from './components/Pipeline';
import { Contacts } from './components/Contacts';
import { Automation } from './components/Automation';
import { Funnels } from './components/Funnels';
import { Marketing } from './components/Marketing';
import { Conversations } from './components/Conversations';
import { SocialPlanner } from './components/SocialPlanner';
import { LeadFinder } from './components/LeadFinder';
import { OutreachAgent } from './components/OutreachAgent';
import { Settings } from './components/Settings';
import { INITIAL_CONTACTS, INITIAL_FUNNELS, INITIAL_CAMPAIGNS } from './constants';
import { Contact, Funnel, EmailCampaign } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

type View = 'dashboard' | 'pipeline' | 'contacts' | 'automation' | 'funnels' | 'marketing' | 'conversations' | 'planner' | 'settings' | 'lead-finder' | 'outreach';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Persistent "Backend" State
  const [contacts, setContacts] = useLocalStorage<Contact[]>('crm_contacts', INITIAL_CONTACTS);
  const [funnels, setFunnels] = useLocalStorage<Funnel[]>('crm_funnels', INITIAL_FUNNELS);
  const [campaigns, setCampaigns] = useLocalStorage<EmailCampaign[]>('crm_campaigns', INITIAL_CAMPAIGNS);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${
        currentView === view
          ? 'border-lime-400 bg-zinc-800 text-white'
          : 'border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-lime-400' : ''}`} />
      <span className="font-bold tracking-wide uppercase text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-lime-400 selection:text-black">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r-2 border-zinc-800 flex flex-col">
        <div className="p-6 border-b-2 border-zinc-800">
          <div className="flex items-center gap-2 text-lime-400">
            <div className="bg-lime-400 p-1 border border-black transform -rotate-3">
                <Command className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
                 <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">THE<span className="text-lime-400">SOLOPRENEUR</span></h1>
                 <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-right -mt-1">.APP</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="pipeline" icon={Kanban} label="Opportunities" />
          <NavItem view="contacts" icon={Users} label="Contacts" />
          <NavItem view="lead-finder" icon={ScanSearch} label="SDR Agent" />
          <NavItem view="outreach" icon={UserPlus} label="Outreach Agent" />
          <div className="my-2 border-t border-zinc-900"></div>
          <NavItem view="funnels" icon={Globe} label="Funnels" />
          <NavItem view="marketing" icon={Megaphone} label="Marketing" />
          <NavItem view="planner" icon={Share2} label="Social Planner" />
          <NavItem view="automation" icon={Workflow} label="Automation" />
          <NavItem view="conversations" icon={Bot} label="AI Agents" />
          
          <div className="pt-6 mt-6 border-t-2 border-zinc-800 mx-4">
             <div className="px-4 py-2 text-xs font-mono text-zinc-600 uppercase">Communications</div>
             <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-300 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-bold tracking-wide uppercase text-sm">Inbox</span>
             </button>
          </div>
        </nav>

        <div className="p-4 border-t-2 border-zinc-800 bg-zinc-950">
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-3 transition-colors w-full px-4 py-2 ${currentView === 'settings' ? 'text-lime-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-bold uppercase text-sm">Settings</span>
          </button>
          <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-500 font-mono">Logged in as</div>
            <div className="font-bold text-sm text-zinc-300">Solopreneur</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-zinc-950 border-b-2 border-zinc-800 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-zinc-500 font-mono text-sm">WORKSPACE:</span>
                <span className="font-bold text-white uppercase bg-zinc-900 px-3 py-1 border border-zinc-700">My Empire</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-green-500 uppercase">System Operational</span>
            </div>
        </header>

        {/* View Area */}
        <div className="flex-1 overflow-auto p-8 bg-zinc-950 relative">
          <div className="max-w-[1600px] mx-auto h-full">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'pipeline' && <Pipeline contacts={contacts} setContacts={setContacts} />}
            {currentView === 'contacts' && <Contacts contacts={contacts} setContacts={setContacts} />}
            {currentView === 'lead-finder' && <LeadFinder setContacts={setContacts} />}
            {currentView === 'outreach' && <OutreachAgent setContacts={setContacts} />}
            {currentView === 'funnels' && <Funnels funnels={funnels} setFunnels={setFunnels} />}
            {currentView === 'marketing' && <Marketing campaigns={campaigns} setCampaigns={setCampaigns} contacts={contacts} />}
            {currentView === 'planner' && <SocialPlanner />}
            {currentView === 'automation' && <Automation />}
            {currentView === 'conversations' && <Conversations />}
            {currentView === 'settings' && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
