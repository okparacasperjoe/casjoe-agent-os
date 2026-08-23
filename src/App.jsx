import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AgentOSView from './components/AgentOSView';
import AgentBrowserView from './components/AgentBrowserView';
import CasjoeBizView from './components/CasjoeBizView';
import ERPView from './components/ERPView';
import PerformanceView from './components/PerformanceView';
import DocumentsView from './components/DocumentsView';
import ChatView from './components/ChatView';
import CRMView from './components/CRMView';
import FinanceView from './components/FinanceView';
import SettingsView from './components/SettingsView';
import InventoryView from './components/InventoryView';
import POSView from './components/POSView';
import PromptsView from './components/PromptsView';
import Modals from './components/Modals';
import OnboardingWizard from './components/OnboardingWizard';
import { useCustomers, useInvoices, useDocuments, useInventory, useStats } from './db/hooks';
import { checkOllamaConnection, listModels, RECOMMENDED_MODELS } from './services/ollama';
import { syncAll } from './services/erpSync';

export default function App() {
  const [activeTab, setActiveTab] = useState('agent-os');
  const [ramUsage, setRamUsage] = useState(5.8);
  const [cpuUsage, setCpuUsage] = useState(38);

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

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 w-full">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Workspace Area */}
        <main className="flex-1 bg-[#0A0F1D] overflow-y-auto pb-12">
          {activeTab === 'agent-os' && (
            <AgentOSView onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'agent-browser' && (
            <AgentBrowserView />
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

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onOpenAddModal={() => setActiveModal('addInventory')}
            />
          )}

          {activeTab === 'pos' && (
            <POSView inventory={inventory} />
          )}

          {activeTab === 'erp' && (
            <ERPView
              customers={customers}
              invoices={invoices}
              inventory={inventory}
              onOpenAddCustomer={() => setActiveModal('addCustomer')}
              onOpenCreateInvoice={() => setActiveModal('createInvoice')}
              onOpenAddInventory={() => setActiveModal('addInventory')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Interactive Dialog Modals */}
      <Modals
        activeModal={activeModal}
        onCloseModal={() => setActiveModal(null)}
      />
    </div>
  );
}
