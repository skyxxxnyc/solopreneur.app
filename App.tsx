
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
  UserPlus,
  Calendar as CalendarIcon,
  Inbox as InboxIcon,
  ChevronDown,
  Building,
  User
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
import { Inbox } from './components/Inbox';
import { Calendar } from './components/Calendar';
import { INITIAL_CONTACTS, INITIAL_FUNNELS, INITIAL_CAMPAIGNS } from './constants';
import { Contact, Funnel, EmailCampaign } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

type View = 'dashboard' | 'pipeline' | 'contacts' | 'automation' | 'funnels' | 'marketing' | 'conversations' | 'planner' | 'settings' | 'lead-finder' | 'outreach' | 'inbox' | 'calendar';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAgencyView, setIsAgencyView] = useState(false); // Toggle between Agency Level and Sub-account Level
  
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
        {/* Agency Switcher Header */}
        <div className="p-4 border-b-2 border-zinc-800">
           <div 
             onClick={() => setIsAgencyView(!isAgencyView)}
             className="bg-zinc-900 border-2 border-zinc-700 p-3 cursor-pointer hover:border-lime-400 transition-colors flex items-center justify-between group"
           >
              <div className="flex items-center gap-3">
                  <div className={`p-1 border border-black transform ${isAgencyView ? 'bg-purple-500 -rotate-3' : 'bg-lime-400 rotate-3'} transition-transform group-hover:rotate-0`}>
                      {isAgencyView ? <Building className="w-4 h-4 text-black" /> : <Command className="w-4 h-4 text-black" />}
                  </div>
                  <div className="flex flex-col">
                       <span className="text-[10px] text-zinc-500 uppercase font-mono leading-none mb-0.5">{isAgencyView ? 'Agency Level' : 'Sub-Account'}</span>
                       <span className="font-bold text-xs uppercase text-white truncate w-24">{isAgencyView ? 'HQ Admin' : 'My Empire'}</span>
                  </div>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
           </div>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Launchpad" />
          
          <div className="my-2 mx-4 border-t border-zinc-900"></div>
          <div className="px-4 py-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Sales & CRM</div>
          <NavItem view="pipeline" icon={Kanban} label="Opportunities" />
          <NavItem view="contacts" icon={Users} label="Contacts" />
          <NavItem view="calendar" icon={CalendarIcon} label="Calendars" />
          <NavItem view="inbox" icon={InboxIcon} label="Conversations" />
          
          <div className="my-2 mx-4 border-t border-zinc-900"></div>
          <div className="px-4 py-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Growth Engines</div>
          <NavItem view="lead-finder" icon={ScanSearch} label="SDR Agent" />
          <NavItem view="outreach" icon={UserPlus} label="Outreach Agent" />
          <NavItem view="funnels" icon={Globe} label="Funnels" />
          <NavItem view="marketing" icon={Megaphone} label="Marketing" />
          <NavItem view="planner" icon={Share2} label="Social Planner" />
          
          <div className="my-2 mx-4 border-t border-zinc-900"></div>
          <div className="px-4 py-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Automation</div>
          <NavItem view="automation" icon={Workflow} label="Workflows" />
          <NavItem view="conversations" icon={Bot} label="AI Employees" />
        </nav>

        <div className="p-4 border-t-2 border-zinc-800 bg-zinc-950">
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-3 transition-colors w-full px-4 py-2 ${currentView === 'settings' ? 'text-lime-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-bold uppercase text-sm">Settings</span>
          </button>
          <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
               <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
               <div className="text-[10px] text-zinc-500 font-mono">Logged in as</div>
               <div className="font-bold text-xs text-zinc-300">Solopreneur</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-zinc-950 border-b-2 border-zinc-800 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-zinc-500 font-mono text-sm">VIEWING:</span>
                <span className={`font-bold text-white uppercase px-3 py-1 border text-sm ${isAgencyView ? 'bg-purple-900/20 text-purple-400 border-purple-500' : 'bg-lime-900/20 text-lime-400 border-lime-500'}`}>
                    {isAgencyView ? 'Agency Dashboard' : 'My Empire (Sub-account)'}
                </span>
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
            {currentView === 'calendar' && <Calendar />}
            {currentView === 'inbox' && <Inbox />}
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
