import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WorkflowStepper } from './components/WorkflowStepper';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'inbox' | 'chat'>('inbox');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    actionType: string;
  }>({
    isOpen: false,
    title: '',
    actionType: '',
  });

  // Handle responsive breakpoint changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // Auto-collapse sidebar on tablets
      if (width < 1280 && width >= 768) {
        setIsSidebarCollapsed(true);
      } else if (width >= 1280) {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedCustomer =
    MOCK_CUSTOMERS.find((c) => c.id === selectedCustomerId) || MOCK_CUSTOMERS[0];

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    if (windowWidth < 768) {
      setMobileView('chat');
    }
  };

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

  const isDesktop = windowWidth >= 1280;
  const isTablet = windowWidth >= 768 && windowWidth < 1280;
  const isMobile = windowWidth < 768;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Slide-over Sidebar Drawer */}
      {isMobile && mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 h-full bg-slate-900 shadow-2xl flex flex-col">
            <Sidebar
              activeModule={activeModule}
              onSelectModule={(id) => {
                handleSelectModule(id);
                setMobileSidebarOpen(false);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Streamlined Top Header */}
        <Header
          onToggleSidebar={() => {
            if (isMobile) {
              setMobileSidebarOpen(true);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
        />

        {/* Clean Pipeline Stepper */}
        <WorkflowStepper
          currentStep="01"
          onStepClick={(step) => {
            if (step !== '01') {
              setModalState({
                isOpen: true,
                title: `ขั้นตอนที่ ${step}`,
                actionType: 'stepper',
              });
            }
          }}
        />

        {/* Balanced 3-Pane Workspace */}
        <main className="flex-1 flex overflow-hidden min-h-0 bg-slate-100 relative">
          {/* Desktop & Tablet: Left Pane (Chat Inbox - w-80) */}
          {(!isMobile || mobileView === 'inbox') && (
            <div
              className={`${
                isMobile ? 'w-full' : 'w-80'
              } h-full shrink-0 flex flex-col border-r border-slate-200 bg-white`}
            >
              <CustomerListPanel
                customers={MOCK_CUSTOMERS}
                selectedCustomerId={selectedCustomer.id}
                onSelectCustomer={handleSelectCustomer}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          )}

          {/* Center Pane (Active Chat & Map) */}
          {(!isMobile || mobileView === 'chat') && (
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              <ChatPanel
                customer={selectedCustomer}
                onSendMessage={(text) => console.log('Message sent:', text)}
                onToggleProfileDrawer={() => setIsProfileDrawerOpen(true)}
                onBackToInbox={() => setMobileView('inbox')}
                showBackToInbox={isMobile}
              />
            </div>
          )}

          {/* Desktop (>=1280px): Right Pane (Customer Context & CRM - w-88 xl:w-96) */}
          {isDesktop && (
            <div className="w-88 xl:w-96 h-full shrink-0 flex flex-col border-l border-slate-200 bg-white">
              <CustomerDetailPanel
                customer={selectedCustomer}
                onActionClick={handleActionClick}
              />
            </div>
          )}

          {/* Laptop/Tablet & Mobile: Slide-over Drawer (Sheet) for Customer Profile */}
          {(isTablet || isMobile) && isProfileDrawerOpen && (
            <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-fade-in">
              <div
                className="fixed inset-0"
                onClick={() => setIsProfileDrawerOpen(false)}
              />
              <div className="relative z-50 w-full max-w-md h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
                <CustomerDetailPanel
                  customer={selectedCustomer}
                  onActionClick={handleActionClick}
                  onClose={() => setIsProfileDrawerOpen(false)}
                  isDrawer={true}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Demo Feedback Modal */}
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
