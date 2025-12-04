import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Zap, MessageSquare, Clock, ArrowDown, Wand2, Mail, Split, Activity, Loader2, Save, Layout, X, Terminal, CheckCircle2, XCircle, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { WorkflowNode, WorkflowTemplate, WorkflowLog } from '../types';
import { generateWorkflow } from '../services/geminiService';
import { WORKFLOW_TEMPLATES } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

const INITIAL_NODES: WorkflowNode[] = [
    { id: '1', type: 'trigger', title: 'Form Submitted', description: 'Facebook Lead Ad', status: 'idle' },
    { id: '2', type: 'action', title: 'Create Opportunity', description: 'Pipeline: Main / Stage: New Lead', status: 'idle' },
    { id: '3', type: 'wait', title: 'Delay', description: 'Wait 5 minutes', status: 'idle' },
    { id: '4', type: 'sms', title: 'Send SMS', description: '"Hey {contact.name}, thanks for..."', status: 'idle' }
];

interface AutomationProps {
    tenantId: string;
}

export const Automation: React.FC<AutomationProps> = ({ tenantId }) => {
  const [workflowName, setWorkflowName] = useState('New Lead Sequence');
  
  // Backend: Active Workflow
  const [nodes, setNodes] = useLocalStorage<WorkflowNode[]>('automation_nodes', INITIAL_NODES);
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isConsoleOpen]);

  const addLog = (level: 'info' | 'warning' | 'error', message: string, nodeId?: string) => {
      setLogs(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          level,
          message,
          nodeId
      }]);
  };

  const handleSimulateWorkflow = async () => {
      if (isSimulating) return;
      setIsSimulating(true);
      setLogs([]); // Clear logs
      addLog('info', 'Starting workflow simulation...');

      // Reset nodes
      setNodes(prev => prev.map(n => ({ ...n, status: 'idle', errorMessage: undefined })));

      // Simulate sequential execution
      for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          
          // Set running
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'running' } : n));
          addLog('info', `Executing node: ${node.title} (${node.type})`, node.id);

          // Simulated delay (random between 500ms and 1500ms)
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

          // Simulate random failure for specific types (15% chance)
          const shouldFail = (node.type === 'sms' || node.type === 'email' || node.type === 'action') && Math.random() < 0.15;

          if (shouldFail) {
              const errors = [
                  "Service timeout: Gateway did not respond.",
                  "Invalid parameter: recipient_id is missing.",
                  "Rate limit exceeded.",
                  "Connection refused by remote host."
              ];
              const errorMsg = errors[Math.floor(Math.random() * errors.length)];

              setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'error', errorMessage: errorMsg } : n));
              addLog('error', `Execution Failed: ${errorMsg}`, node.id);
              addLog('warning', 'Workflow halted due to error.');
              setIsSimulating(false);
              return; // Stop execution
          }

          // Success
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'success' } : n));
          addLog('info', `Node completed successfully.`, node.id);
      }

      addLog('info', 'Workflow simulation completed successfully.');
      setIsSimulating(false);
  };

  const handleGenerateWorkflow = async () => {
      if (!prompt.trim()) return;
      setIsGenerating(true);
      const newNodes = await generateWorkflow(prompt);
      if (newNodes && newNodes.length > 0) {
          const uniqueNodes = newNodes.map((node, idx) => ({
              ...node,
              id: `gen-${Date.now()}-${idx}`,
              status: 'idle' as const
          }));
          setNodes(uniqueNodes);
          setLogs([]);
      }
      setIsGenerating(false);
  };

  const handleLoadTemplate = (template: WorkflowTemplate) => {
      const newNodes = template.nodes.map((node, idx) => ({
          ...node,
          id: `tmpl-${Date.now()}-${idx}`,
          status: 'idle' as const
      }));
      setNodes(newNodes);
      setWorkflowName(template.name);
      setLogs([]);
      setIsLibraryOpen(false);
  };

  const getNodeIcon = (type: string) => {
      switch(type) {
          case 'trigger': return <Zap className="w-5 h-5 text-orange-400" />;
          case 'email': return <Mail className="w-5 h-5 text-cyan-400" />;
          case 'sms': return <MessageSquare className="w-5 h-5 text-pink-400" />;
          case 'wait': return <Clock className="w-5 h-5 text-yellow-400" />;
          case 'condition': return <Split className="w-5 h-5 text-purple-400" />;
          default: return <Activity className="w-5 h-5 text-lime-400" />;
      }
  };

  const getNodeStyles = (node: WorkflowNode) => {
      if (node.status === 'running') return 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-zinc-900';
      if (node.status === 'error') return 'border-red-500 bg-red-950/20';
      if (node.status === 'success') return 'border-green-500 bg-zinc-900';

      // Default colors based on type
      switch(node.type) {
          case 'trigger': return 'border-orange-400 bg-zinc-900';
          case 'email': return 'border-cyan-400 bg-zinc-900';
          case 'sms': return 'border-pink-400 bg-zinc-900';
          case 'wait': return 'border-yellow-400 bg-zinc-900';
          case 'condition': return 'border-purple-400 bg-zinc-900';
          default: return 'border-zinc-700 hover:border-lime-400 bg-zinc-900';
      }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-zinc-900 border-2 border-zinc-800 p-6 shadow-[4px_4px_0px_0px_#27272a] shrink-0">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Workflow Builder</h2>
           <div className="flex items-center gap-2">
             <span className="text-zinc-500 font-mono text-sm">Active Flow:</span>
             <input 
                value={workflowName} 
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent border-b-2 border-zinc-700 text-white font-bold focus:outline-none focus:border-lime-400 w-64"
             />
           </div>
        </div>
        <div className="flex gap-4">
             <button 
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-2 bg-zinc-900 text-zinc-300 px-6 py-3 font-bold border-2 border-zinc-700 hover:text-white hover:border-zinc-500 transition-all"
             >
                <Layout className="w-4 h-4" />
                TEMPLATES
            </button>
            <button 
                onClick={handleSimulateWorkflow}
                disabled={isSimulating}
                className={`flex items-center gap-2 px-6 py-3 font-bold border-2 shadow-[4px_4px_0px_0px_#3f3f46] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isSimulating ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-black border-zinc-300'}`}
            >
                {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'RUNNING...' : 'TEST RUN'}
            </button>
            <button className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 font-bold border-2 border-lime-500 shadow-[4px_4px_0px_0px_#3f3f46] hover:translate-y-1 hover:shadow-none transition-all">
                <Save className="w-4 h-4 fill-current" />
                PUBLISH
            </button>
        </div>
      </div>

      {/* AI Prompt Section */}
      <div className="mb-8 bg-zinc-950 border border-zinc-800 p-4 relative overflow-hidden group shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <h3 className="text-xs font-black text-purple-400 uppercase mb-2 flex items-center gap-2">
              <Wand2 className="w-3 h-3" /> AI Workflow Architect
          </h3>
          <div className="flex gap-2">
              <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateWorkflow()}
                  placeholder="Describe your workflow (e.g. 'When a form is submitted, wait 10 mins, then send a welcome email')"
                  className="flex-1 bg-zinc-900 border border-zinc-700 p-3 text-white text-sm focus:border-purple-400 focus:outline-none font-mono"
              />
              <button
                  onClick={handleGenerateWorkflow}
                  disabled={isGenerating || !prompt}
                  className="px-6 py-2 bg-purple-500 text-black font-bold uppercase text-xs hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {isGenerating ? 'Building...' : 'Generate Flow'}
              </button>
          </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-zinc-950 border-2 border-zinc-800 relative overflow-y-auto overflow-x-hidden flex justify-center p-10 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] pb-64">
        
        <div className="flex flex-col items-center w-full max-w-md space-y-0">
            {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <div className={`relative w-full p-4 border-2 transition-all duration-300 hover:translate-x-1 ${getNodeStyles(node)}`}>
                        {node.status === 'success' && <div className="absolute top-2 right-2 text-green-500"><CheckCircle2 className="w-4 h-4" /></div>}
                        {node.status === 'error' && <div className="absolute top-2 right-2 text-red-500"><XCircle className="w-4 h-4" /></div>}
                        {node.status === 'running' && <div className="absolute top-2 right-2 text-blue-500"><Loader2 className="w-4 h-4 animate-spin" /></div>}

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                                {getNodeIcon(node.type)}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm uppercase">{node.title}</h3>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-950 px-1 border border-zinc-800">{node.type}</span>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400 pl-[3.25rem]">{node.description}</p>
                        
                        {node.errorMessage && (
                            <div className="mt-3 p-2 bg-red-950/50 border border-red-900/50 text-red-400 text-xs font-mono flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                {node.errorMessage}
                            </div>
                        )}
                    </div>

                    {/* Connector */}
                    {index < nodes.length - 1 && (
                        <div className="h-8 w-0.5 bg-zinc-700 my-0 relative">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-700 rounded-full p-0.5">
                                 <ArrowDown className="w-3 h-3 text-zinc-500" />
                             </div>
                        </div>
                    )}
                </React.Fragment>
            ))}
            
            {/* Add Button at End */}
            <div className="h-8 w-0.5 bg-zinc-700 my-0"></div>
            <button className="w-full py-3 border-2 border-dashed border-zinc-700 text-zinc-500 font-bold uppercase text-xs hover:border-lime-400 hover:text-lime-400 transition-colors flex items-center justify-center gap-2 bg-zinc-900/50">
                <Plus className="w-4 h-4" /> Add Step
            </button>
        </div>
      </div>

      {/* Debug Console / Log Viewer */}
      <div className={`fixed bottom-0 right-0 w-[500px] bg-zinc-900 border-l-2 border-t-2 border-zinc-800 shadow-[-4px_-4px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 z-50 ${isConsoleOpen ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
          <div 
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className="flex justify-between items-center p-2 border-b-2 border-zinc-800 cursor-pointer hover:bg-zinc-800 bg-zinc-950"
          >
              <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-400">
                  <Terminal className="w-4 h-4" />
                  System Logs
                  {logs.length > 0 && <span className="bg-zinc-800 text-white px-1.5 rounded-full text-[9px]">{logs.length}</span>}
              </div>
              {isConsoleOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
          </div>
          
          <div className="h-64 overflow-y-auto p-4 bg-black font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                  <div className="text-zinc-700 italic">No activity recorded...</div>
              ) : (
                  logs.map(log => (
                      <div key={log.id} className="flex gap-2 hover:bg-zinc-900/50 p-0.5">
                          <span className="text-zinc-600">[{log.timestamp}]</span>
                          <span className={`${
                              log.level === 'error' ? 'text-red-500 font-bold' : 
                              log.level === 'warning' ? 'text-yellow-500' : 
                              'text-green-500'
                          }`}>
                              {log.level.toUpperCase()}
                          </span>
                          <span className="text-zinc-300">{log.message}</span>
                      </div>
                  ))
              )}
              <div ref={logsEndRef} />
          </div>
      </div>

      {/* Template Library Modal */}
      {isLibraryOpen && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full md:w-[500px] bg-zinc-950 border-l-2 border-zinc-800 shadow-[-4px_0px_0px_0px_#27272a] h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b-2 border-zinc-800 bg-zinc-900 flex justify-between items-center">
                    <h3 className="text-xl font-black text-white uppercase">Template Library</h3>
                    <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-zinc-800 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {WORKFLOW_TEMPLATES.map(template => (
                        <div key={template.id} className="bg-zinc-900 border-2 border-zinc-800 p-4 hover:border-lime-400 transition-colors group cursor-pointer" onClick={() => handleLoadTemplate(template)}>
                            <h4 className="font-bold text-white uppercase mb-1 group-hover:text-lime-400">{template.name}</h4>
                            <p className="text-xs text-zinc-500 font-mono mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {template.nodes.map((n, i) => (
                                    <span key={i} className="text-[10px] uppercase bg-zinc-950 border border-zinc-800 px-1 text-zinc-400">
                                        {n.type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};