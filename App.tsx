
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
  
  // Filter Global Data for the Active Tenant
  // Note: Components that write data will need to append new items with activeTenantId
  // For simplicity, we pass full lists + tenantId to components and let them handle filtering/adding.

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTenantId('');
    setCurrentView('dashboard');
  };

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

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border-2 border-zinc-800 p-8 shadow-[8px_8px_0px_0px_#27272a]">
          <div className="mb-8 text-center">
             <div className="w-16 h-16 bg-lime-400 mx-auto mb-4 border-2 border-black flex items-center justify-center">
                <Shield className="w-8 h-8 text-black" />
             </div>
             <h1 className="text-2xl font-black text-white uppercase tracking-tight">System Login</h1>
             <p className="text-zinc-500 font-mono text-sm mt-2">Select a user role to simulate:</p>
          </div>
          
          <div className="space-y-3">
             {MOCK_USERS.map(user => (
               <button 
                 key={user.id}
                 onClick={() => setCurrentUser(user)}
                 className="w-full flex items-center gap-4 p-4 border-2 border-zinc-800 hover:border-lime-400 hover:bg-zinc-800 transition-all text-left group"
               >
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-zinc-700" />
                  <div>
                    <div className="font-bold text-white uppercase text-sm group-hover:text-lime-400">{user.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">{user.role} • {MOCK_TENANTS.find(t => t.id === user.tenantId)?.name}</div>
                  </div>
               </button>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-lime-400 selection:text-black">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r-2 border-zinc-800 flex flex-col">
        {/* Agency Switcher Header */}
        <div className="p-4 border-b-2 border-zinc-800">
           {currentUser.role === 'agency_admin' ? (
             <div className="relative group z-50">
               <button className="w-full bg-zinc-900 border-2 border-zinc-700 p-3 hover:border-lime-400 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-1 border border-black bg-lime-400">
                          <Building className="w-4 h-4 text-black" />
                      </div>
                      <div className="flex flex-col text-left">
                           <span className="text-[10px] text-zinc-500 uppercase font-mono leading-none mb-0.5">Tenant</span>
                           <span className="font-bold text-xs uppercase text-white truncate w-24">{activeTenant?.name}</span>
                      </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
               </button>
               
               {/* Dropdown */}
               <div className="absolute top-full left-0 w-full bg-zinc-950 border-2 border-zinc-800 mt-1 hidden group-hover:block shadow-xl">
                  {MOCK_TENANTS.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => setActiveTenantId(tenant.id)}
                      className={`w-full text-left p-3 text-xs font-bold uppercase hover:bg-zinc-900 ${activeTenantId === tenant.id ? 'text-lime-400' : 'text-zinc-400'}`}
                    >
                      {tenant.name}
                    </button>
                  ))}
               </div>
             </div>
           ) : (
             <div className="bg-zinc-900 border-2 border-zinc-800 p-3 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                    <div className="p-1 border border-black bg-zinc-700">
                        <Building className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                         <span className="text-[10px] text-zinc-500 uppercase font-mono leading-none mb-0.5">Organization</span>
                         <span className="font-bold text-xs uppercase text-white truncate w-24">{activeTenant?.name}</span>
                    </div>
                </div>
             </div>
           )}
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
            className={`flex items-center gap-3 transition-colors w-full px-4 py-2 mb-2 ${currentView === 'settings' ? 'text-lime-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-bold uppercase text-sm">Settings</span>
          </button>
          
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 overflow-hidden">
                 <img src={currentUser.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                 <div className="text-[10px] text-zinc-500 font-mono truncate w-20">{currentUser.email}</div>
                 <div className="font-bold text-xs text-zinc-300 uppercase">{currentUser.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-zinc-600 hover:text-red-400">
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-zinc-950 border-b-2 border-zinc-800 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-zinc-500 font-mono text-sm">VIEWING:</span>
                <span className={`font-bold text-white uppercase px-3 py-1 border text-sm ${activeTenant?.type === 'agency' ? 'bg-purple-900/20 text-purple-400 border-purple-500' : 'bg-lime-900/20 text-lime-400 border-lime-500'}`}>
                    {activeTenant?.name} ({activeTenant?.type})
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
