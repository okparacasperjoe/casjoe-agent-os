import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Modals from './components/Modals';
import OnboardingWizard from './components/OnboardingWizard';
import { useCustomers, useInvoices, useDocuments, useInventory, useStats } from './db/hooks';
import { checkOllamaConnection, listModels } from './services/ollama';
import { syncAll } from './services/erpSync';

// Lazy-loaded workspace components for code-splitting and faster startup
const AgentOSView = lazy(() => import('./components/AgentOSView'));
const AgentBrowserView = lazy(() => import('./components/AgentBrowserView'));
const CodeStudioView = lazy(() => import('./components/CodeStudioView'));
const CasjoeBizView = lazy(() => import('./components/CasjoeBizView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const PerformanceView = lazy(() => import('./components/PerformanceView'));
const DocumentsView = lazy(() => import('./components/DocumentsView'));
const PromptsView = lazy(() => import('./components/PromptsView'));
const ChatView = lazy(() => import('./components/ChatView'));
const CRMView = lazy(() => import('./components/CRMView'));
const FinanceView = lazy(() => import('./components/FinanceView'));
const ExpensesView = lazy(() => import('./components/ExpensesView'));
const InventoryView = lazy(() => import('./components/InventoryView'));
const POSView = lazy(() => import('./components/POSView'));
const ProcurementView = lazy(() => import('./components/ProcurementView'));
const ProjectView = lazy(() => import('./components/ProjectView'));
const TaskView = lazy(() => import('./components/TaskView'));
const HRView = lazy(() => import('./components/HRView'));
const ERPView = lazy(() => import('./components/ERPView'));
const SettingsView = lazy(() => import('./components/SettingsView'));

function TabLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 text-slate-400">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
      <span className="text-xs font-mono">Loading Casjoe Workspace Module...</span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('agent-os');
  const [ramUsage, setRamUsage] = useState(4.2);
  const [cpuUsage, setCpuUsage] = useState(24);

  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [activePrompt, setActivePrompt] = useState('');
  
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('onboardingCompleted') !== 'true';
  });

  const stats = useStats();
  const customers = useCustomers() || [];
  const invoices = useInvoices() || [];
  const documents = useDocuments() || [];
  const inventory = useInventory() || [];

  // Modal State
  const [activeModal, setActiveModal] = useState(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Sidebar Collapse State (Widescreen Mode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  // Code Studio Initial Code State
  const [codeStudioInitialCode, setCodeStudioInitialCode] = useState(null);

  // Listen for Code Studio open events from Agents / Tools
  useEffect(() => {
    const handleOpenCodeStudio = (e) => {
      if (e?.detail?.code) {
        setCodeStudioInitialCode(e.detail.code);
      }
      setActiveTab('code-studio');
    };
    window.addEventListener('casjoe:open-code-studio', handleOpenCodeStudio);
    return () => window.removeEventListener('casjoe:open-code-studio', handleOpenCodeStudio);
  }, []);

  // Background ERP Sync on Network Reconnect
  useEffect(() => {
    const handleOnline = async () => {
      try {
        await syncAll();
        console.log('ERP sync completed on online');
      } catch (err) {
        console.error('ERP sync failed on online event', err);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Ollama Connection Heartbeat & Model Listing
  useEffect(() => {
    let isMounted = true;
    const pollOllama = async () => {
      try {
        const res = await checkOllamaConnection();
        if (isMounted) {
          setOllamaConnected(res.connected);
          if (res.connected) {
            const models = await listModels();
            if (isMounted && models.length > 0) {
              setOllamaModels(models);
              if (!selectedModel) setSelectedModel(models[0].name);
            }
          }
        }
      } catch {
        if (isMounted) setOllamaConnected(false);
      }
    };

    pollOllama();
    const interval = setInterval(pollOllama, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedModel]);

  // Read System Resources via Electron IPC if available
  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.invoke('agent:get-system-info').then(info => {
        if (info?.freeMemory && info?.totalMemory) {
          const usedGb = ((info.totalMemory - info.freeMemory) / (1024 * 1024 * 1024)).toFixed(1);
          setRamUsage(parseFloat(usedGb));
        }
        if (info?.cpuCount) {
          setCpuUsage(Math.min(95, info.cpuCount * 8));
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <OnboardingWizard 
        onComplete={handleOnboardingComplete}
        ollamaConnected={ollamaConnected}
        ollamaModels={ollamaModels}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-white flex flex-col font-['Inter'] antialiased">
      {/* Top Navbar */}
      <Navbar
        selectedModel={selectedModel}
        ollamaConnected={ollamaConnected}
        ramUsage={ramUsage}
        cpuUsage={cpuUsage}
        onOpenSettings={() => setActiveTab('settings')}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Content Workspace Area with Lazy Loading & Error Isolation */}
        <main className="flex-1 bg-[#0A0F1D] overflow-y-auto pb-12 transition-all">
          <ErrorBoundary>
            <Suspense fallback={<TabLoader />}>
              {activeTab === 'agent-os' && (
                <AgentOSView onNavigateTab={setActiveTab} />
              )}

              {activeTab === 'agent-browser' && (
                <AgentBrowserView />
              )}

              {activeTab === 'code-studio' && (
                <CodeStudioView 
                  initialCode={codeStudioInitialCode} 
                  onNavigateTab={setActiveTab} 
                />
              )}

              {activeTab === 'casjoe-biz' && (
                <CasjoeBizView />
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  onOpenModal={(modalName) => setActiveModal(modalName)}
                />
              )}

              {activeTab === 'performance' && (
                <PerformanceView
                  currentModel={selectedModel}
                  ramUsage={ramUsage}
                  cpuUsage={cpuUsage}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsView
                  documents={documents}
                  onOpenUploadModal={() => setActiveModal('uploadDoc')}
                />
              )}

              {activeTab === 'prompts' && (
                <PromptsView 
                  onUsePrompt={(text) => {
                    setActivePrompt(text);
                    setActiveTab('chat');
                  }} 
                />
              )}

              {activeTab === 'chat' && (
                <ChatView
                  selectedModel={selectedModel}
                  ollamaConnected={ollamaConnected}
                  ramUsage={ramUsage}
                  cpuUsage={cpuUsage}
                  activePrompt={activePrompt}
                  setActivePrompt={setActivePrompt}
                />
              )}

              {activeTab === 'crm' && (
                <CRMView
                  customers={customers}
                  onOpenAddCustomer={() => setActiveModal('addCustomer')}
                />
              )}

              {activeTab === 'finance' && (
                <FinanceView
                  invoices={invoices}
                  onOpenCreateInvoice={() => setActiveModal('createInvoice')}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesView
                  onOpenAddExpense={() => setActiveModal('addExpense')}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  inventory={inventory}
                  onOpenAddModal={() => setActiveModal('addInventory')}
                />
              )}

              {activeTab === 'pos' && (
                <POSView inventory={inventory} />
              )}

              {activeTab === 'procurement' && (
                <ProcurementView
                  onOpenAddVendor={() => setActiveModal('addVendor')}
                  onOpenAddPO={() => setActiveModal('addPO')}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectView
                  onOpenAddProject={() => setActiveModal('addProject')}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskView
                  onOpenAddTask={() => setActiveModal('addTask')}
                />
              )}

              {activeTab === 'hr' && (
                <HRView
                  onOpenAddEmployee={() => setActiveModal('addEmployee')}
                />
              )}

              {activeTab === 'erp' && (
                <ERPView
                  customers={customers}
                  invoices={invoices}
                  inventory={inventory}
                  documents={documents}
                  onOpenAddCustomer={() => setActiveModal('addCustomer')}
                  onOpenCreateInvoice={() => setActiveModal('createInvoice')}
                  onOpenAddExpense={() => setActiveModal('addExpense')}
                  onOpenAddInventory={() => setActiveModal('addInventory')}
                  onOpenUploadDoc={() => setActiveModal('uploadDoc')}
                  onOpenAddProject={() => setActiveModal('addProject')}
                  onOpenAddTask={() => setActiveModal('addTask')}
                  onOpenAddVendor={() => setActiveModal('addVendor')}
                  onOpenAddPO={() => setActiveModal('addPO')}
                  onOpenAddEmployee={() => setActiveModal('addEmployee')}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView 
                  ollamaConnected={ollamaConnected}
                  ollamaModels={ollamaModels}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Interactive Dialog Modals */}
      <Modals
        activeModal={activeModal}
        onCloseModal={() => setActiveModal(null)}
        customers={customers}
      />
    </div>
  );
}
