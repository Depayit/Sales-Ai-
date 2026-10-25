import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WorkflowStepper } from './components/WorkflowStepper';
import { CustomerListPanel } from './components/CustomerListPanel';
import { ChatPanel } from './components/ChatPanel';
import { CustomerDetailPanel } from './components/CustomerDetailPanel';
import { Module02Qualification } from './components/Module02Qualification';
import { Module03Presentation } from './components/Module03Presentation';
import { Module04TradingTerms } from './components/Module04TradingTerms';
import { Module05OrderPO } from './components/Module05OrderPO';
import { Module06ManagerPlanning } from './components/Module06ManagerPlanning';
import { DemoModal } from './components/DemoModal';
import { DecisionRightsModal } from './components/DecisionRightsModal';
import { ChatSandboxModal } from './components/ChatSandboxModal';
import {
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_SALES_PLANS,
  MOCK_DELIVERY_GROUPS,
  MOCK_LINE_HISTORY,
} from './mockData';
import type {
  Customer,
  FilterTab,
  ProductSKU,
  ChatMessage,
  MediaHistoryItem,
  CVRegistrationRecord,
  OrderRecord,
  SalesPlanSummary,
  DeliveryGroup,
  LineSendHistoryItem,
} from './types';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('01');
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-1');
  const [orders, setOrders] = useState<OrderRecord[]>(MOCK_ORDERS);
  const [salesPlans, setSalesPlans] = useState<SalesPlanSummary[]>(MOCK_SALES_PLANS);
  const [deliveryGroups, setDeliveryGroups] = useState<DeliveryGroup[]>(MOCK_DELIVERY_GROUPS);
  const [sendHistory, setSendHistory] = useState<LineSendHistoryItem[]>(MOCK_LINE_HISTORY);
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

  const [isDecisionRightsOpen, setIsDecisionRightsOpen] = useState<boolean>(false);
  const [isChatSandboxOpen, setIsChatSandboxOpen] = useState<boolean>(false);

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
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    if (windowWidth < 768) {
      setMobileView('chat');
    }
  };

  const handleSelectModule = (moduleId: string) => {
    if (['01', '02', '03', '04', '05', '06'].includes(moduleId)) {
      setActiveModule(moduleId);
    } else {
      setModalState({
        isOpen: true,
        title: `โมดูล ${moduleId}`,
        actionType: 'module',
      });
    }
  };

  // Simulate sending product specs and price sheet into Customer Chat & updating CRM
  const handleSendMediaToChat = (product: ProductSKU, targetCustomer: Customer) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const approvedPrice = product.standardPrices[0]?.pricePerKg || 145;
    const effectivePriceStr = product.customerSpecificPrice || `${approvedPrice} บาท/กก.`;

    // Create Chat Message with product_pricing card
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: product.approvalMode === 'MODE_A' ? 'ai' : 'sales',
      time: timeStr,
      text: `ขออนุญาตส่งข้อมูลสินค้าและตารางราคาสำหรับ ${product.name} (${product.skuCode}) ให้พิจารณาครับ\n\n• บรรจุภัณฑ์: ${product.packInfo}\n• หน่วย/น้ำหนัก: ${product.unit} (${product.weight})\n• ราคาที่ได้รับอนุมัติ: ฿${approvedPrice.toLocaleString()}/${product.unit}${
        product.customerSpecificPrice
          ? ` (ราคาพิเศษลูกค้า: ${product.customerSpecificPrice})`
          : ''
      }`,
      cardType: 'product_pricing',
      cardData: {
        productTitle: `${product.name} (${product.skuCode})`,
        productImage: product.imageUrl,
        recommendedTier: product.standardPrices[1]?.range || '500 - 999 กก.',
        priceTiers: product.standardPrices,
        totalAmount: effectivePriceStr,
      },
    };

    // Create Media History record
    const newHistoryItem: MediaHistoryItem = {
      id: `mh-${Date.now()}`,
      mediaType: 'image',
      title: `${product.name} (ภาพ & ใบราคา)`,
      timestamp: `วันนี้ ${timeStr} น.`,
      status: 'sent',
      sender: product.approvalMode === 'MODE_A' ? 'ai' : 'sales',
    };

    // Update interested products list if not already present
    const alreadyInterested = targetCustomer.interestedProducts.some((p) =>
      p.name.includes(product.name)
    );
    const newInterestedProduct = alreadyInterested
      ? null
      : {
          id: `int-${Date.now()}`,
          name: product.name,
          subName: product.subName,
          imageUrl: product.imageUrl,
          qty: '500 กก./รอบ',
          unitPrice: `฿${approvedPrice}`,
          total: `฿${(approvedPrice * 500).toLocaleString()}`,
          date: 'รอบส่งประจำตาม Route',
          note: `โหมดอนุมัติ: ${product.approvalMode}`,
        };

    setCustomers((prevCustomers) =>
      prevCustomers.map((c) => {
        if (c.id === targetCustomer.id) {
          return {
            ...c,
            chatMessages: [...c.chatMessages, newMsg],
            mediaHistory: [newHistoryItem, ...(c.mediaHistory || [])],
            interestedProducts: newInterestedProduct
              ? [...c.interestedProducts, newInterestedProduct]
              : c.interestedProducts,
          };
        }
        return c;
      })
    );
  };

  // Update CV Registration state on customer
  const handleUpdateCV = (customerId: string, updatedRecord: Partial<CVRegistrationRecord>) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((c) => {
        if (c.id === customerId) {
          const currentCv = c.cvRegistration;
          const mergedCv = currentCv
            ? { ...currentCv, ...updatedRecord }
            : (updatedRecord as CVRegistrationRecord);

          return {
            ...c,
            cvRegistration: mergedCv,
            statusLabel: mergedCv.status === 'completed' ? 'เปิด CV แล้ว' : c.statusLabel,
          };
        }
        return c;
      })
    );
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
          activeModule={activeModule}
          onToggleSidebar={() => {
            if (isMobile) {
              setMobileSidebarOpen(true);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          onOpenDecisionRights={() => setIsDecisionRightsOpen(true)}
          onOpenChatSandbox={() => setIsChatSandboxOpen(true)}
        />

        {/* Clean Pipeline Stepper */}
        <WorkflowStepper
          currentStep={activeModule}
          onStepClick={(step) => {
            if (['01', '02', '03', '04', '05', '06'].includes(step)) {
              setActiveModule(step);
            } else {
              setModalState({
                isOpen: true,
                title: `ขั้นตอนที่ ${step}`,
                actionType: 'stepper',
              });
            }
          }}
        />

        {/* Dynamic Module Workspace */}
        {activeModule === '01' && (
          <main className="flex-1 flex overflow-hidden min-h-0 bg-slate-100 relative">
            {/* Desktop & Tablet: Left Pane (Chat Inbox - w-80) */}
            {(!isMobile || mobileView === 'inbox') && (
              <div
                className={`${
                  isMobile ? 'w-full' : 'w-80'
                } h-full shrink-0 flex flex-col border-r border-slate-200 bg-white`}
              >
                <CustomerListPanel
                  customers={customers}
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
                  onOpenSandbox={() => setIsChatSandboxOpen(true)}
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
        )}

        {activeModule === '02' && (
          <main className="flex-1 flex overflow-hidden min-h-0 bg-slate-100 relative">
            <Module02Qualification
              customer={selectedCustomer}
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onNavigateToModule03={() => setActiveModule('03')}
            />
          </main>
        )}

        {activeModule === '03' && (
          <main className="flex-1 flex overflow-hidden min-h-0 bg-slate-100 relative">
            <Module03Presentation
              customer={selectedCustomer}
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onSendMediaToChat={handleSendMediaToChat}
              onNavigateToModule={handleSelectModule}
            />
          </main>
        )}

        {activeModule === '04' && (
          <main className="flex-1 flex overflow-hidden min-h-0 bg-slate-100 relative">
            <Module04TradingTerms
              customer={selectedCustomer}
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onUpdateCV={handleUpdateCV}
              onNavigateToModule={handleSelectModule}
            />
          </main>
        )}

        {activeModule === '05' && (
          <main className="flex-1 flex overflow-hidden min-h-0 bg-slate-100 relative">
            <Module05OrderPO
              customer={selectedCustomer}
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onNavigateToModule={handleSelectModule}
              orders={orders}
              onUpdateOrders={setOrders}
              salesPlans={salesPlans}
              onUpdateSalesPlans={setSalesPlans}
            />
          </main>
        )}

        {activeModule === '06' && (
          <main className="flex-1 flex overflow-hidden min-h-0 bg-slate-100 relative">
            <Module06ManagerPlanning
              customer={selectedCustomer}
              customers={customers}
              onNavigateToModule={handleSelectModule}
              deliveryGroups={deliveryGroups}
              onUpdateDeliveryGroups={setDeliveryGroups}
              sendHistory={sendHistory}
              onUpdateSendHistory={setSendHistory}
            />
          </main>
        )}
      </div>

      {/* Demo Feedback Modal */}
      <DemoModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, title: '', actionType: '' })}
        title={modalState.title}
        actionType={modalState.actionType}
        customer={selectedCustomer}
      />

      {/* Decision Rights Modal (Slide 29) */}
      <DecisionRightsModal
        isOpen={isDecisionRightsOpen}
        onClose={() => setIsDecisionRightsOpen(false)}
      />

      {/* Interactive AI Chat Sandbox Modal (Empty start + Clear Chat + Autonomous Logic) */}
      <ChatSandboxModal
        isOpen={isChatSandboxOpen}
        onClose={() => setIsChatSandboxOpen(false)}
      />
    </div>
  );
};

export default App;
