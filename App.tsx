
import React, { useState, useEffect } from 'react';
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
  User,
  LogOut,
  Shield
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
import { INITIAL_CONTACTS, INITIAL_FUNNELS, INITIAL_CAMPAIGNS, MOCK_USERS, MOCK_TENANTS } from './constants';
import { Contact, Funnel, EmailCampaign, User as UserType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

type View = 'dashboard' | 'pipeline' | 'contacts' | 'automation' | 'funnels' | 'marketing' | 'conversations' | 'planner' | 'settings' | 'lead-finder' | 'outreach' | 'inbox' | 'calendar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTenantId, setActiveTenantId] = useState<string>('');
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Persistent "Backend" State - Global for Contacts/Funnels/Campaigns (Filtered in views)
  const [contacts, setContacts] = useLocalStorage<Contact[]>('crm_contacts', INITIAL_CONTACTS);
  const [funnels, setFunnels] = useLocalStorage<Funnel[]>('crm_funnels', INITIAL_FUNNELS);
  const [campaigns, setCampaigns] = useLocalStorage<EmailCampaign[]>('crm_campaigns', INITIAL_CAMPAIGNS);

  useEffect(() => {
    if (currentUser) {
      setActiveTenantId(currentUser.tenantId);
    }
  }, [currentUser]);

  const activeTenant = MOCK_TENANTS.find(t => t.id === activeTenantId);
  
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTenantId('');
    setCurrentView('dashboard');
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group relative border-r-2 ${
        currentView === view
          ? 'bg-lime-400 text-black border-black font-black'
          : 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-900 hover:text-white hover:border-lime-400'
      }`}
    >
      <Icon className={`w-4 h-4 transition-colors ${currentView === view ? 'text-black' : 'text-zinc-600 group-hover:text-lime-400'}`} />
      <span className="tracking-widest uppercase text-[10px]">{label}</span>
      {currentView === view && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
      )}
    </button>
  );

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lime-400 via-cyan-400 to-pink-400"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-md w-full bg-black border-2 border-zinc-800 p-12 shadow-[12px_12px_0px_0px_#27272a] relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-12 text-center">
             <div className="w-24 h-24 bg-lime-400 mx-auto mb-8 border-2 border-black shadow-[4px_4px_0px_0px_#fff] flex items-center justify-center transform hover:rotate-3 transition-transform duration-300">
                <Shield className="w-12 h-12 text-black stroke-[2.5]" />
             </div>
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic">Solopreneur<span className="text-lime-400">.</span>OS</h1>
             <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">Agency Operating System v2.0</p>
          </div>
          
          <div className="space-y-4">
             {MOCK_USERS.map(user => (
               <button 
                 key={user.id}
                 onClick={() => setCurrentUser(user)}
                 className="w-full flex items-center gap-4 p-4 border-2 border-zinc-800 bg-zinc-900 hover:border-lime-400 hover:bg-zinc-800 transition-all text-left group hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#a3e635]"
               >
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 grayscale group-hover:grayscale-0 transition-all border-2 border-zinc-700 group-hover:border-lime-400" />
                  <div>
                    <div className="font-bold text-white uppercase text-sm group-hover:text-lime-400 transition-colors">{user.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight">{user.role} • {MOCK_TENANTS.find(t => t.id === user.tenantId)?.name}</div>
                  </div>
               </button>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans overflow-hidden selection:bg-lime-400 selection:text-black">
      {/* Sidebar */}
      <div className="w-72 bg-black border-r-2 border-zinc-800 flex flex-col z-20">
        {/* Agency Switcher Header */}
        <div className="p-6 border-b-2 border-zinc-800 bg-zinc-950">
           {currentUser.role === 'agency_admin' ? (
             <div className="relative group z-50">
               <button className="w-full bg-black border-2 border-zinc-800 p-4 hover:border-lime-400 transition-all flex items-center justify-between group-hover:shadow-[4px_4px_0px_0px_#a3e635] active:translate-y-0.5 active:shadow-none">
                  <div className="flex items-center gap-3">
                      <div className="p-1.5 border-2 border-white bg-black">
                          <Building className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col text-left">
                           <span className="text-[9px] text-zinc-500 uppercase font-mono leading-none mb-1 tracking-wider">Workspace</span>
                           <span className="font-black text-sm uppercase text-white truncate w-28 tracking-tight italic">{activeTenant?.name}</span>
                      </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-lime-400 transition-colors" />
               </button>
               
               {/* Dropdown */}
               <div className="absolute top-full left-0 w-full bg-zinc-900 border-2 border-zinc-800 mt-2 hidden group-hover:block shadow-[8px_8px_0px_0px_#000] z-50 animate-in fade-in slide-in-from-top-2">
                  {MOCK_TENANTS.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => setActiveTenantId(tenant.id)}
                      className={`w-full text-left p-4 text-xs font-bold uppercase hover:bg-zinc-800 border-b border-zinc-800 last:border-0 transition-colors ${activeTenantId === tenant.id ? 'text-lime-400' : 'text-zinc-400'}`}
                    >
                      {tenant.name}
                    </button>
                  ))}
               </div>
             </div>
           ) : (
             <div className="bg-black border-2 border-zinc-800 p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_#27272a]">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 border-2 border-zinc-700 bg-zinc-800">
                        <Building className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                         <span className="text-[9px] text-zinc-500 uppercase font-mono leading-none mb-1 tracking-wider">Organization</span>
                         <span className="font-bold text-sm uppercase text-white truncate w-32 tracking-tight">{activeTenant?.name}</span>
                    </div>
                </div>
             </div>
           )}
        </div>
        
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Launchpad" />
          
          <div className="my-6 mx-6 h-px bg-zinc-800"></div>
          <div className="px-6 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] font-mono">Sales & CRM</div>
          <NavItem view="pipeline" icon={Kanban} label="Pipeline" />
          <NavItem view="contacts" icon={Users} label="Contacts" />
          <NavItem view="calendar" icon={CalendarIcon} label="Calendar" />
          <NavItem view="inbox" icon={InboxIcon} label="Inbox" />
          
          <div className="my-6 mx-6 h-px bg-zinc-800"></div>
          <div className="px-6 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] font-mono">Growth Engines</div>
          <NavItem view="lead-finder" icon={ScanSearch} label="SDR Agent" />
          <NavItem view="outreach" icon={UserPlus} label="Outreach Agent" />
          <NavItem view="funnels" icon={Globe} label="Funnels" />
          <NavItem view="marketing" icon={Megaphone} label="Marketing" />
          <NavItem view="planner" icon={Share2} label="Social Planner" />
          
          <div className="my-6 mx-6 h-px bg-zinc-800"></div>
          <div className="px-6 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] font-mono">Automation</div>
          <NavItem view="automation" icon={Workflow} label="Workflows" />
          <NavItem view="conversations" icon={Bot} label="AI Employees" />
        </nav>

        <div className="p-6 border-t-2 border-zinc-800 bg-zinc-950">
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-3 transition-all w-full px-4 py-3 mb-4 border-2 ${currentView === 'settings' ? 'border-lime-400 bg-zinc-900 text-lime-400 shadow-[4px_4px_0px_0px_#000]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white bg-black'}`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="font-bold uppercase text-xs tracking-wider">Settings</span>
          </button>
          
          <div className="px-4 py-3 bg-black border-2 border-zinc-800 flex items-center justify-between gap-2 shadow-[4px_4px_0px_0px_#27272a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center border-2 border-zinc-700 overflow-hidden">
                 <img src={currentUser.avatar} className="w-full h-full object-cover grayscale" />
              </div>
              <div className="overflow-hidden">
                 <div className="text-[10px] text-zinc-500 font-mono truncate w-24">{currentUser.email}</div>
                 <div className="font-black text-[10px] text-zinc-300 uppercase tracking-wide">{currentUser.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-zinc-600 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950 relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>

        {/* Header */}
        <header className="h-20 bg-zinc-950/80 backdrop-blur-md border-b-2 border-zinc-800 flex items-center justify-between px-8 shrink-0 z-10">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">Active Environment</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-white uppercase px-2 py-0.5 border-2 text-[10px] tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] ${activeTenant?.type === 'agency' ? 'bg-purple-500/10 text-purple-400 border-purple-500' : 'bg-lime-500/10 text-lime-400 border-lime-500'}`}>
                        {activeTenant?.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase">[{activeTenant?.type}]</span>
                  </div>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-black border border-zinc-800 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_rgba(132,204,22,0.8)]"></div>
                <span className="text-[10px] font-mono text-lime-500 uppercase font-bold tracking-wider">System Online</span>
            </div>
        </header>

        {/* View Area */}
        <div className="flex-1 overflow-auto p-8 relative z-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="max-w-[1920px] mx-auto h-full">
            {currentView === 'dashboard' && <Dashboard tenantId={activeTenantId} contacts={contacts} />}
            {currentView === 'pipeline' && <Pipeline contacts={contacts} setContacts={setContacts} tenantId={activeTenantId} />}
            {currentView === 'contacts' && <Contacts contacts={contacts} setContacts={setContacts} tenantId={activeTenantId} userRole={currentUser.role} />}
            {currentView === 'calendar' && <Calendar tenantId={activeTenantId} />}
            {currentView === 'inbox' && <Inbox tenantId={activeTenantId} />}
            {currentView === 'lead-finder' && <LeadFinder setContacts={setContacts} tenantId={activeTenantId} />}
            {currentView === 'outreach' && <OutreachAgent setContacts={setContacts} tenantId={activeTenantId} />}
            {currentView === 'funnels' && <Funnels funnels={funnels} setFunnels={setFunnels} tenantId={activeTenantId} />}
            {currentView === 'marketing' && <Marketing campaigns={campaigns} setCampaigns={setCampaigns} contacts={contacts} tenantId={activeTenantId} />}
            {currentView === 'planner' && <SocialPlanner tenantId={activeTenantId} />}
            {currentView === 'automation' && <Automation tenantId={activeTenantId} />}
            {currentView === 'conversations' && <Conversations tenantId={activeTenantId} />}
            {currentView === 'settings' && <Settings user={currentUser} tenant={activeTenant} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
