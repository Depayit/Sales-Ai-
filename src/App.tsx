import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CustomerListPanel } from './components/CustomerListPanel';
import { ChatPanel } from './components/ChatPanel';
import { CustomerDetailPanel } from './components/CustomerDetailPanel';
import { DemoModal } from './components/DemoModal';
import { MOCK_CUSTOMERS } from './mockData';
import type { Customer, FilterTab } from './types';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('01');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    actionType: string;
  }>({
    isOpen: false,
    title: '',
    actionType: '',
  });

  const selectedCustomer =
    MOCK_CUSTOMERS.find((c) => c.id === selectedCustomerId) || MOCK_CUSTOMERS[0];

  const handleSelectModule = (moduleId: string) => {
    if (moduleId === '01') {
      setActiveModule('01');
    } else {
      setModalState({
        isOpen: true,
        title: `โมดูล ${moduleId}`,
        actionType: 'module',
      });
    }
  };

  const handleActionClick = (actionName: string, customer: Customer) => {
    if (actionName === 'ดูรายละเอียด Route') {
      setModalState({
        isOpen: true,
        title: `ข้อมูลเส้นทาง Route ${customer.routeCode}`,
        actionType: 'route',
      });
    } else if (actionName === 'ส่งเข้า LINE กลุ่มทีมขาย') {
      setModalState({
        isOpen: true,
        title: 'ส่งเข้า LINE กลุ่มทีมขาย',
        actionType: 'LINE',
      });
    } else if (actionName === 'สร้างใบเสนอราคา (PDF)') {
      setModalState({
        isOpen: true,
        title: 'สร้างใบเสนอราคา (PDF)',
        actionType: 'PDF',
      });
    } else if (actionName === 'สร้าง Sales Order') {
      setModalState({
        isOpen: true,
        title: 'สร้าง Sales Order',
        actionType: 'Order',
      });
    } else {
      setModalState({
        isOpen: true,
        title: actionName,
        actionType: 'general',
      });
    }
  };

  return (
    <div className="app-container flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      {/* A. Main Sidebar (Dark Navy Theme) */}
      <Sidebar activeModule={activeModule} onSelectModule={handleSelectModule} />

      {/* Main Content Area */}
      <div className="main-viewport flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* B. Header & Workflow Stepper */}
        <Header currentStep="01" onStepClick={(step) => {
          if (step !== '01') {
            setModalState({
              isOpen: true,
              title: `ขั้นตอนที่ ${step}`,
              actionType: 'stepper',
            });
          }
        }} />

        {/* 3-Column Panels Layout */}
        <main className="panels-workspace grid grid-cols-12 flex-1 min-h-0 overflow-hidden bg-slate-100">
          {/* C. Customer List Panel (Col 1-3) ~ 25% */}
          <div className="col-span-3 h-full min-h-0 overflow-hidden">
            <CustomerListPanel
              customers={MOCK_CUSTOMERS}
              selectedCustomerId={selectedCustomer.id}
              onSelectCustomer={(cust) => setSelectedCustomerId(cust.id)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* D. LINE Conversation Panel (Col 4-7) ~ 38% */}
          <div className="col-span-5 h-full min-h-0 overflow-hidden">
            <ChatPanel
              customer={selectedCustomer}
              onSendMessage={(text) => {
                console.log('Sent message in demo:', text);
              }}
            />
          </div>

          {/* E. Customer Detail Panel (Col 8-12) ~ 37% */}
          <div className="col-span-4 h-full min-h-0 overflow-hidden">
            <CustomerDetailPanel
              customer={selectedCustomer}
              onActionClick={handleActionClick}
            />
          </div>
        </main>
      </div>

      {/* Interactive Action Feedback Modal */}
      <DemoModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, title: '', actionType: '' })}
        title={modalState.title}
        actionType={modalState.actionType}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default App;
