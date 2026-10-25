import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  Trash2,
  Printer,
  Calendar,
  Layers,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';
import type {
  Customer,
  CompanyCode,
  OrderRecord,
  OrderItem,
  StockCheckStatus,
  SalesPlanSummary,
} from '../types';
import {
  MODULE_05_STATS,
  MOCK_ORDERS,
  MOCK_SALES_PLANS,
  MOCK_PRODUCTS,
} from '../mockData';

interface Module05OrderPOProps {
  customer: Customer;
  customers: Customer[];
  onSelectCustomer: (cust: Customer) => void;
  onNavigateToModule: (moduleId: string) => void;
  orders?: OrderRecord[];
  onUpdateOrders?: React.Dispatch<React.SetStateAction<OrderRecord[]>>;
  salesPlans?: SalesPlanSummary[];
  onUpdateSalesPlans?: React.Dispatch<React.SetStateAction<SalesPlanSummary[]>>;
}

export const Module05OrderPO: React.FC<Module05OrderPOProps> = ({
  customer,
  customers,
  onSelectCustomer,
  onNavigateToModule,
  orders: propOrders,
  onUpdateOrders,
  salesPlans: propSalesPlans,
  onUpdateSalesPlans,
}) => {
  // Mode switcher: Tab 1 (Order Confirmation & Internal PO) vs Tab 2 (Sales Plan Consolidation)
  const [activeTab, setActiveTab] = useState<'orders' | 'sales_plan'>('orders');

  // Orders State (use props if provided to preserve state across module navigation)
  const [internalOrders, setInternalOrders] = useState<OrderRecord[]>(MOCK_ORDERS);
  const orders = propOrders ?? internalOrders;
  const setOrders = onUpdateOrders ?? setInternalOrders;

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders.find((o) => o.customerId === customer.id)?.id || orders[0].id
  );

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'po'>('all');

  // Sales Plan State (Separate A&C vs TD)
  const [salesPlanCompany, setSalesPlanCompany] = useState<CompanyCode>('AC');
  const [internalSalesPlans, setInternalSalesPlans] = useState<SalesPlanSummary[]>(MOCK_SALES_PLANS);
  const salesPlans = propSalesPlans ?? internalSalesPlans;
  const setSalesPlans = onUpdateSalesPlans ?? setInternalSalesPlans;

  // Modals
  const [mobilePreviewModal, setMobilePreviewModal] = useState<boolean>(false);
  const [internalPoModal, setInternalPoModal] = useState<boolean>(false);
  const [managerSubmitModal, setManagerSubmitModal] = useState<boolean>(false);
  const [addItemModal, setAddItemModal] = useState<boolean>(false);

  // Form State for Stock Verification Note
  const [stockNotes, setStockNotes] = useState<string>('');

  // Selected Order Object
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Keep selected order synchronized if customer changes
  React.useEffect(() => {
    const matchingOrder = orders.find((o) => o.customerId === customer.id);
    if (matchingOrder) {
      setSelectedOrderId(matchingOrder.id);
    }
  }, [customer, orders]);

  // Filter orders for left list
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'pending' && (o.customerConfirmation.isConfirmed && o.salesConfirmation.isConfirmed)) {
      return false;
    }
    if (orderFilter === 'confirmed' && !o.salesConfirmation.isConfirmed) {
      return false;
    }
    if (orderFilter === 'po' && !o.internalPO) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.routeCode.toLowerCase().includes(q)
    );
  });

  // Calculate Order Totals
  const recalculateOrder = (currentItems: OrderItem[]) => {
    const totalAmount = currentItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalWeightKg = currentItems.reduce((sum, item) => sum + item.weightKg, 0);
    return { totalAmount, totalWeightKg };
  };

  // 1. Simulate Customer Confirmation via Mobile Summary (Slide 29)
  const handleCustomerConfirm = () => {
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            customerConfirmation: {
              isConfirmed: true,
              confirmedAt: `วันนี้ ${nowStr} น.`,
              method: 'mobile_summary',
            },
            status: o.stockCheck.status === 'in_stock' ? 'pending_stock' : o.status,
          };
        }
        return o;
      })
    );
    setMobilePreviewModal(false);
    alert('✅ จำลองลูกค้ายืนยันคำสั่งซื้อผ่านหน้าสรุปบนมือถือเรียบร้อยแล้ว!');
  };

  // 2. Record Manual Stock Verification (Slide 21, 23)
  const handleStockVerification = (status: StockCheckStatus) => {
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const operatorName = `คุณแอน (ฝ่ายขาย ${selectedOrder.company === 'AC' ? 'A&C' : 'TD'})`;
    const defaultNote =
      status === 'in_stock'
        ? 'ตรวจสอบสต๊อกนอกระบบแล้ว มีสินค้าพร้อมส่งตรงรอบ'
        : status === 'out_of_stock'
        ? 'สินค้าในคลังไม่เพียงพอ ต้องเลื่อนรอบส่ง'
        : 'สินค้ามีบางส่วน ต้องแบ่งส่ง 2 ล็อต';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            stockCheck: {
              status,
              checkedBy: operatorName,
              checkedAt: `วันนี้ ${nowStr} น.`,
              notes: stockNotes.trim() || defaultNote,
            },
          };
        }
        return o;
      })
    );
    setStockNotes('');
    alert(`📦 บันทึกผลการตรวจสต๊อกนอกระบบ: ${status === 'in_stock' ? 'มีสต๊อกพร้อมส่ง' : status} เรียบร้อยแล้ว`);
  };

  // 3. Salesperson Confirmation (Slide 21, 23, 29)
  const handleSalesConfirm = () => {
    if (!selectedOrder.customerConfirmation.isConfirmed) {
      alert('⚠️ ยังไม่สามารถยืนยันได้: รอลูกค้ายืนยันออเดอร์ก่อน');
      return;
    }
    if (selectedOrder.stockCheck.status !== 'in_stock') {
      alert('⚠️ ยังไม่สามารถยืนยันได้: ฝ่ายขายต้องตรวจสอบสต๊อกนอกระบบและบันทึก "มีสต๊อกพร้อมส่ง" ก่อน');
      return;
    }

    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const orderRef = `CONFIRM-${selectedOrder.id}`;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            salesConfirmation: {
              isConfirmed: true,
              confirmedBy: `คุณแอน (ฝ่ายขาย ${o.company === 'AC' ? 'A&C' : 'TD'})`,
              confirmedAt: `วันนี้ ${nowStr} น.`,
              orderRef,
            },
            status: 'confirmed',
          };
        }
        return o;
      })
    );
    alert(`🎉 ฝ่ายขายยืนยันคำสั่งซื้อเรียบร้อยแล้ว! (รหัสอ้างอิง: ${orderRef})\nระบบปลดล็อกให้สร้าง Internal PO ได้แล้ว`);
  };

  // 4. Generate Internal PO (Slide 21, 23)
  const handleGenerateInternalPO = () => {
    if (!selectedOrder.salesConfirmation.isConfirmed) {
      alert('❌ ห้ามสร้าง PO ภายใน: ออเดอร์นี้ยังไม่ได้รับการยืนยันจากฝ่ายขาย');
      return;
    }

    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const poNumber = `PO-INT-${selectedOrder.company}-${selectedOrder.id.replace('ORD-', '')}`;
    const pdfFileName = `${poNumber}_APPROVED.pdf`;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            internalPO: {
              poNumber,
              orderId: o.id,
              company: o.company,
              createdAt: `วันนี้ ${nowStr} น.`,
              createdBy: 'Sales AI System',
              approvedBy: `คุณแอน ฝ่ายขาย ${o.company === 'AC' ? 'A&C' : 'TD'}`,
              totalAmount: o.totalAmount,
              totalWeightKg: o.totalWeightKg,
              status: 'approved',
              pdfFileName,
            },
            status: 'po_generated',
          };
        }
        return o;
      })
    );
    setInternalPoModal(true);
  };

  // 5. Add / Remove Item before confirmation
  const handleRemoveItem = (itemId: string) => {
    if (selectedOrder.salesConfirmation.isConfirmed) {
      alert('ห้ามแก้ไขรายการสินค้า: ออเดอร์ได้รับการยืนยันจากฝ่ายขายแล้ว');
      return;
    }
    if (selectedOrder.items.length <= 1) {
      alert('ออเดอร์ต้องมีสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const updatedItems = selectedOrder.items.filter((i) => i.id !== itemId);
    const { totalAmount, totalWeightKg } = recalculateOrder(updatedItems);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            items: updatedItems,
            totalAmount,
            totalWeightKg,
          };
        }
        return o;
      })
    );
  };

  const handleUpdateItemQty = (itemId: string, newQty: number) => {
    if (selectedOrder.salesConfirmation.isConfirmed) {
      alert('ห้ามแก้ไขจำนวน: ออเดอร์ได้รับการยืนยันจากฝ่ายขายแล้ว');
      return;
    }
    if (newQty <= 0) return;

    const updatedItems = selectedOrder.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQty,
          weightKg: newQty,
          totalPrice: newQty * item.unitPrice,
        };
      }
      return item;
    });

    const { totalAmount, totalWeightKg } = recalculateOrder(updatedItems);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            items: updatedItems,
            totalAmount,
            totalWeightKg,
          };
        }
        return o;
      })
    );
  };

  // 6. Approve Sales Plan by Sales (Slide 24)
  const handleApproveSalesPlan = (planIndex: number) => {
    const operatorName = `คุณแอน (ฝ่ายขาย ${salesPlanCompany === 'AC' ? 'A&C' : 'TD'})`;
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    setSalesPlans((prev) =>
      prev.map((sp, idx) => {
        if (idx === planIndex) {
          return {
            ...sp,
            status: 'sales_approved',
            approvedBy: operatorName,
            submittedAt: `วันนี้ ${nowStr} น.`,
          };
        }
        return sp;
      })
    );
    alert(`✓ ฝ่ายขายตรวจและอนุมัติ Sales Plan (${salesPlanCompany}) ประจำวันที่เรียบร้อยแล้ว`);
  };

  // 7. Submit Sales Plan to Manager for Module 06 (Slide 24)
  const handleSubmitSalesPlanToManager = () => {
    const unapproved = salesPlans.filter(
      (sp) => sp.company === salesPlanCompany && sp.status === 'draft'
    );
    if (unapproved.length > 0) {
      alert('⚠️ โปรดให้ฝ่ายขายตรวจและอนุมัติ Sales Plan ทุกวันก่อนส่งให้ผู้จัดการ');
      return;
    }

    setSalesPlans((prev) =>
      prev.map((sp) => {
        if (sp.company === salesPlanCompany) {
          return {
            ...sp,
            status: 'submitted_to_manager',
          };
        }
        return sp;
      })
    );
    setManagerSubmitModal(true);
  };

  // Filter sales plans for active company
  const currentCompanyPlans = salesPlans.filter((sp) => sp.company === salesPlanCompany);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden min-h-0 select-none">
      {/* Top Banner: Module 05 Statistics & Tab Switcher */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Key Metrics Chips */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] min-w-0 py-0.5">
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">ออเดอร์ทั้งหมด:</span>
              <span className="font-bold text-slate-800">{MODULE_05_STATS.totalOrders}</span>
              <span className="text-emerald-600 font-semibold text-[10px]">
                {MODULE_05_STATS.totalOrdersDiff}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0 text-amber-800 font-semibold flex items-center gap-1">
              <Clock size={13} className="text-amber-600" />
              <span className="text-amber-700 font-medium">รอลูกค้ายืนยัน:</span>
              <span>{MODULE_05_STATS.pendingCustomerCount}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 text-blue-800 font-semibold flex items-center gap-1">
              <Layers size={13} className="text-blue-600" />
              <span className="text-blue-700 font-medium">รอตรวจสต๊อก:</span>
              <span>{MODULE_05_STATS.pendingStockCount}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="text-emerald-700 font-medium">ฝ่ายขายยืนยันแล้ว:</span>
              <span>{MODULE_05_STATS.salesConfirmedCount}</span>
            </div>

            <div className="bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg shrink-0 text-purple-800 font-semibold flex items-center gap-1">
              <FileCheck2 size={13} className="text-purple-600" />
              <span className="text-purple-700 font-medium">ออก PO แล้ว:</span>
              <span>{MODULE_05_STATS.poGeneratedCount}</span>
            </div>

            <div className="bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg shrink-0 text-teal-800 font-semibold flex items-center gap-1">
              <Calendar size={13} className="text-teal-600" />
              <span className="text-teal-700 font-medium">Sales Plan พร้อม:</span>
              <span>{MODULE_05_STATS.salesPlanReadyCount}</span>
            </div>
          </div>

          {/* Tab Switcher: View 1 (Order Confirmation) vs View 2 (Sales Plan Consolidation) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 border border-slate-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 size={14} />
              <span>1. จัดการออเดอร์ & PO ภายใน</span>
            </button>

            <button
              onClick={() => setActiveTab('sales_plan')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sales_plan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar size={14} />
              <span>2. รวม Sales Plan แยก A&C / TD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === 'orders' && (
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Order Management List (Standardized w-80)   */}
          {/* ========================================================= */}
          <div className="w-80 h-full border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  รายการคำสั่งซื้อ ({orders.length})
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">
                  {filteredOrders.length} รายการ
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold text-center mb-2">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`py-1 rounded ${
                    orderFilter === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`py-1 rounded ${
                    orderFilter === 'pending' ? 'bg-white font-bold text-amber-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  รอยืนยัน
                </button>
                <button
                  onClick={() => setOrderFilter('confirmed')}
                  className={`py-1 rounded ${
                    orderFilter === 'confirmed' ? 'bg-white font-bold text-emerald-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ยืนยันแล้ว
                </button>
                <button
                  onClick={() => setOrderFilter('po')}
                  className={`py-1 rounded ${
                    orderFilter === 'po' ? 'bg-white font-bold text-purple-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ออก PO
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหา Order ID, ชื่อร้าน, เบอร์โทร..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Order Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredOrders.map((ord) => {
                const isSelected = ord.id === selectedOrder.id;

                return (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      const matchCust = customers.find((c) => c.id === ord.customerId);
                      if (matchCust) onSelectCustomer(matchCust);
                    }}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-blue-700">
                        {ord.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          ord.company === 'AC'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.company === 'AC' ? 'A&C' : 'TD'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 truncate mb-1">
                      {ord.customerName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span>{ord.routeCode}</span>
                      <span className="font-semibold text-slate-700">
                        ฿{ord.totalAmount.toLocaleString()} ({ord.totalWeightKg} กก.)
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ส่ง: {ord.requestedDeliveryDate}
                      </span>

                      {/* Status Badges */}
                      {ord.internalPO ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                          ออก PO แล้ว
                        </span>
                      ) : ord.salesConfirmation.isConfirmed ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          ฝ่ายขายยืนยัน
                        </span>
                      ) : ord.customerConfirmation.isConfirmed ? (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          ลูกค้ายืนยันแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          รอลูกค้ายืนยัน
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER COLUMN: Order Detail & Dual Confirmation Panel     */}
          {/* ========================================================= */}
          <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto border-r border-slate-200 min-w-0 p-4 space-y-4">
            {/* Customer & Order Profile Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-2xs"
                    style={{ backgroundColor: customer.avatarColor || '#2563eb' }}
                  >
                    {selectedOrder.customerName.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">{selectedOrder.customerName}</h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedOrder.company === 'AC'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {selectedOrder.company === 'AC' ? 'A&C Foods Supply' : 'TD Foods Supply'}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        CV: {selectedOrder.cvCode || 'CV-AC-90812'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ผู้ติดต่อ: {selectedOrder.contactPerson} • โทร {selectedOrder.phone} • สาย {selectedOrder.routeCode}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-blue-700 block">
                    {selectedOrder.id}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    วันที่สร้างออเดอร์: {selectedOrder.orderDate}
                  </span>
                </div>
              </div>

              {/* Delivery info & notes */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                <Truck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">สถานที่ส่ง & วันรับสินค้า:</span>{' '}
                  {selectedOrder.deliveryAddress} •{' '}
                  <span className="font-bold text-blue-700">ต้องการรับวัน: {selectedOrder.requestedDeliveryDate}</span>
                  {selectedOrder.customerNotes && (
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      หมายเหตุ: {selectedOrder.customerNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText size={15} className="text-blue-600" />
                  รายการสินค้าในคำสั่งซื้อ (Order Items)
                </h3>

                {!selectedOrder.salesConfirmation.isConfirmed && (
                  <button
                    onClick={() => setAddItemModal(true)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    <Plus size={13} />
                    <span>เพิ่มสินค้า</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">รหัส / รายการสินค้า</th>
                      <th className="py-2.5 px-3 text-right">จำนวน</th>
                      <th className="py-2.5 px-3 text-right">น้ำหนัก (กก.)</th>
                      <th className="py-2.5 px-3 text-right">ราคาอนุมัติ (บาท)</th>
                      <th className="py-2.5 px-3 text-right">ยอดรวม (บาท)</th>
                      {!selectedOrder.salesConfirmation.isConfirmed && (
                        <th className="py-2.5 px-2 text-center w-10">ลบ</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SKU: {item.skuCode}
                          </div>
                          {item.subName && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.subName}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {!selectedOrder.salesConfirmation.isConfirmed ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItemQty(item.id, parseInt(e.target.value) || 0)
                                }
                                className="w-16 p-1 text-right border border-slate-200 rounded text-xs font-bold"
                              />
                              <span className="text-slate-500">{item.unit}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-slate-800">
                              {item.quantity} {item.unit}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                          {item.weightKg} กก.
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          ฿{item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                          ฿{item.totalPrice.toLocaleString()}
                        </td>
                        {!selectedOrder.salesConfirmation.isConfirmed && (
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="ลบรายการ"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td className="py-2.5 px-3">รวมทั้งสิ้น</td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-normal">
                        {selectedOrder.items.length} รายการ
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {selectedOrder.totalWeightKg} กก.
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                      <td className="py-2.5 px-3 text-right text-sm text-blue-700">
                        ฿{selectedOrder.totalAmount.toLocaleString()}
                      </td>
                      {!selectedOrder.salesConfirmation.isConfirmed && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Dual Confirmation Controls (Slide 23 & 29) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                กระบวนการยืนยันคำสั่งซื้อ (Order Confirmation Protocol — Slide 21, 23, 29)
              </h3>

              {/* Step 1: Customer Confirmation */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ลูกค้ายืนยันออเดอร์ด้วยตนเองผ่านหน้าสรุปบนมือถือ (Slide 29)
                    </span>
                  </div>

                  {selectedOrder.customerConfirmation.isConfirmed ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      ลูกค้ายืนยันแล้ว ({selectedOrder.customerConfirmation.confirmedAt})
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={12} />
                      รอลูกค้ายืนยัน
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-500">
                    AI ห้ามตีความจำนวนประมาณการเป็นจำนวนแน่นอน ต้องให้ลูกค้ายืนยันผ่าน UI หรือ LINE
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMobilePreviewModal(true)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 flex items-center gap-1"
                    >
                      <Smartphone size={13} />
                      <span>พรีวิวหน้าจอมือถือลูกค้า</span>
                    </button>

                    {!selectedOrder.customerConfirmation.isConfirmed && (
                      <button
                        onClick={handleCustomerConfirm}
                        className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs"
                      >
                        จำลองลูกค้ายืนยันออเดอร์
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Manual Stock Verification */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ฝ่ายขายตรวจสอบสต๊อกนอกระบบ (Manual Stock Verification — Slide 21, 23)
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      selectedOrder.stockCheck.status === 'in_stock'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedOrder.stockCheck.status === 'out_of_stock'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedOrder.stockCheck.status === 'in_stock'
                      ? '✓ มีสต๊อกพร้อมส่ง'
                      : selectedOrder.stockCheck.status === 'out_of_stock'
                      ? '✕ สต๊อกไม่พอ'
                      : '⏳ รอฝ่ายขายตรวจสต๊อก'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600">
                  {selectedOrder.stockCheck.notes ||
                    'กฎสำคัญ: AI ไม่มีสิทธิ์ยืนยันสต๊อกแทนฝ่ายขาย ฝ่ายขายต้องเช็กสต๊อกจริงจากคลังหรือโปรแกรมเดิมแล้วบันทึกผล'}
                </div>

                {selectedOrder.stockCheck.checkedBy && (
                  <div className="text-[10px] text-slate-400">
                    ตรวจโดย: {selectedOrder.stockCheck.checkedBy} ({selectedOrder.stockCheck.checkedAt})
                  </div>
                )}

                {!selectedOrder.salesConfirmation.isConfirmed && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="บันทึกผลการเช็กสต๊อกนอกระบบ..."
                      value={stockNotes}
                      onChange={(e) => setStockNotes(e.target.value)}
                      className="flex-1 p-1.5 text-xs bg-white border border-slate-200 rounded"
                    />
                    <button
                      onClick={() => handleStockVerification('in_stock')}
                      className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shrink-0 shadow-2xs"
                    >
                      ✓ สต๊อกมีพร้อม
                    </button>
                    <button
                      onClick={() => handleStockVerification('out_of_stock')}
                      className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded shrink-0"
                    >
                      ของไม่พอ
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3: Sales Confirmation */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ฝ่ายขายยืนยันคำสั่งซื้อ (Sales Confirmation — Slide 21, 23)
                    </span>
                  </div>

                  {selectedOrder.salesConfirmation.isConfirmed ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      ฝ่ายขายยืนยันแล้ว ({selectedOrder.salesConfirmation.orderRef})
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      รอการยืนยัน
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500">
                    {selectedOrder.salesConfirmation.isConfirmed
                      ? `ยืนยันโดย ${selectedOrder.salesConfirmation.confirmedBy} (${selectedOrder.salesConfirmation.confirmedAt})`
                      : 'กดยืนยันออเดอร์หลังตรวจสต๊อกแล้ว เพื่อปลดล็อกการออก PO ภายใน'}
                  </div>

                  {!selectedOrder.salesConfirmation.isConfirmed && (
                    <button
                      onClick={handleSalesConfirm}
                      disabled={
                        !selectedOrder.customerConfirmation.isConfirmed ||
                        selectedOrder.stockCheck.status !== 'in_stock'
                      }
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 ${
                        selectedOrder.customerConfirmation.isConfirmed &&
                        selectedOrder.stockCheck.status === 'in_stock'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Check size={14} />
                      <span>ฝ่ายขายยืนยันออเดอร์</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Internal PO Workspace (Standardized w-88 xl:w-96) */}
          {/* ========================================================= */}
          <div className="w-88 xl:w-96 h-full bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 p-3.5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-900">
                  เอกสารคำสั่งซื้อภายใน (Internal PO)
                </h3>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    selectedOrder.internalPO
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedOrder.internalPO ? 'ออก PO แล้ว' : 'ร่างรออนุมัติ'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                PO ภายในแยก A&C / TD เพื่อใช้วางแผนจัดส่ง (ไม่ใช่ PO ลูกค้าหรือ PO จัดซื้อ)
              </p>
            </div>

            {/* Rule Enforcement Banner */}
            {!selectedOrder.salesConfirmation.isConfirmed ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span>ยังไม่อนุญาตให้ออก PO ภายใน</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  ตามกฎข้อบังคับ Slide 21 & 23: ต้องผ่านการตรวจสต๊อกนอกระบบและได้รับการยืนยันจากฝ่ายขายก่อน จึงจะสามารถสร้าง PO ภายในได้
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>พร้อมจัดทำ PO ภายในแล้ว</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  ออเดอร์นี้ได้รับการยืนยันจากฝ่ายขายเรียบร้อยแล้ว สามารถออก PO ภายในเพื่อรวบรวมเข้าสู่ Sales Plan ได้ทันที
                </p>

                {!selectedOrder.internalPO && (
                  <button
                    onClick={handleGenerateInternalPO}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2"
                  >
                    <FileCheck2 size={14} />
                    <span>ออกเอกสาร PO ภายใน (Generate PO)</span>
                  </button>
                )}
              </div>
            )}

            {/* Internal PO Document Preview Card */}
            {selectedOrder.internalPO && (
              <div className="border-2 border-purple-200 rounded-xl p-3.5 bg-slate-50/60 text-xs space-y-3 relative overflow-hidden shadow-xs">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg]">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-wider">
                    INTERNAL PO ONLY
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-purple-900 text-xs block">
                      {selectedOrder.internalPO.poNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Ref: {selectedOrder.internalPO.orderId}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {selectedOrder.company === 'AC' ? 'A&C Foods' : 'TD Foods'}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-400">ลูกค้า:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">รหัส CV:</span>{' '}
                    <span className="font-mono font-semibold text-slate-700">{selectedOrder.cvCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">วันต้องการรับ:</span>{' '}
                    <span className="font-semibold text-blue-700">{selectedOrder.requestedDeliveryDate}</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="border border-slate-200 rounded bg-white p-2 text-[11px] space-y-1">
                  <div className="font-bold text-slate-700 flex justify-between border-b border-slate-100 pb-1">
                    <span>รายการ</span>
                    <span>ยอดรวม</span>
                  </div>
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-slate-600">
                      <span className="truncate max-w-[150px]">{it.name} ({it.quantity} {it.unit})</span>
                      <span className="font-semibold text-slate-900">฿{it.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-1 flex justify-between font-bold text-purple-900">
                    <span>รวมมูลค่า PO</span>
                    <span>฿{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                  <div>จัดทำโดย: {selectedOrder.internalPO.createdBy}</div>
                  <div>อนุมัติโดย: {selectedOrder.internalPO.approvedBy}</div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setInternalPoModal(true)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Printer size={13} />
                    <span>พิมพ์ PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('sales_plan');
                      setSalesPlanCompany(selectedOrder.company);
                    }}
                    className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Calendar size={13} />
                    <span>ไปที่ Sales Plan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SALES PLAN CONSOLIDATION (Slide 24)                                */}
      {/* ========================================================================= */}
      {activeTab === 'sales_plan' && (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 space-y-4">
          <div className="max-w-6xl mx-auto w-full space-y-4">
            {/* Header & Company Switcher (Slide 24) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    05
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">
                    รวบรวม Sales Plan แยก A&C / TD (Multi-Day Consolidation)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  AI รวบรวมออเดอร์ที่ฝ่ายขายยืนยันแล้ว แยกบริษัท/วัน/Route แสดงรายการล่วงหน้าหลายวัน (อ้างอิง Slide 24)
                </p>
              </div>

              {/* Company Tabs (A&C vs TD) */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setSalesPlanCompany('AC')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    salesPlanCompany === 'AC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sales Plan: A&C Foods
                </button>
                <button
                  onClick={() => setSalesPlanCompany('TD')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    salesPlanCompany === 'TD'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sales Plan: TD Foods
                </button>
              </div>
            </div>

            {/* Sales Plan Multi-Day Cards */}
            <div className="space-y-3.5">
              {currentCompanyPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  {/* Plan Date & Route Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200 flex items-center gap-1.5">
                        <Calendar size={13} />
                        รอบส่ง: {plan.date}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {plan.routeCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">
                        รวม: <strong className="text-slate-900">{plan.totalWeightKg.toLocaleString()} กก.</strong> •{' '}
                        <strong className="text-blue-700">฿{plan.totalAmount.toLocaleString()}</strong>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plan.status === 'submitted_to_manager'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : plan.status === 'sales_approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {plan.status === 'submitted_to_manager'
                          ? 'ส่งต่อผู้จัดการแล้ว'
                          : plan.status === 'sales_approved'
                          ? 'ฝ่ายขายอนุมัติแล้ว'
                          : 'รอตรวจอนุมัติ'}
                      </span>
                    </div>
                  </div>

                  {/* Confirmed Orders in Plan Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Order ID / PO</th>
                          <th className="py-2 px-3">ลูกค้า / CV</th>
                          <th className="py-2 px-3">สินค้าที่สั่ง</th>
                          <th className="py-2 px-3 text-right">น้ำหนัก</th>
                          <th className="py-2 px-3 text-right">ยอดรวม</th>
                          <th className="py-2 px-3 text-center">สถานะยืนยัน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {plan.orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-mono">
                              <div className="font-bold text-blue-700">{ord.id}</div>
                              <div className="text-[10px] text-slate-400">
                                {ord.internalPO?.poNumber || 'PO Draft'}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900">{ord.customerName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                CV: {ord.cvCode}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              {ord.items.map((it) => (
                                <div key={it.id} className="text-slate-700 truncate max-w-xs">
                                  {it.name} ({it.quantity} {it.unit})
                                </div>
                              ))}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-800">
                              {ord.totalWeightKg} กก.
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-blue-700">
                              ฿{ord.totalAmount.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <Check size={11} />
                                ยืนยันแล้ว
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Plan Footer Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      {plan.approvedBy ? (
                        <span>ตรวจและอนุมัติโดย: <strong>{plan.approvedBy}</strong> ({plan.submittedAt})</span>
                      ) : (
                        <span className="text-amber-700">⚠️ ต้องให้ฝ่ายขายของบริษัทตรวจสอบก่อนส่งต่อให้ผู้จัดการ</span>
                      )}
                    </div>

                    {plan.status === 'draft' && (
                      <button
                        onClick={() => handleApproveSalesPlan(idx)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>ฝ่ายขายอนุมัติ Sales Plan ({plan.date})</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Final Action: Submit to Manager for Module 06 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900 block">
                  ขั้นตอนถัดไป (Hand-off to JD 06):
                </span>
                เมื่อฝ่ายขายตรวจ Sales Plan ครบถ้วนแล้ว สามารถส่งต่อให้ผู้จัดการและแผนกจัดรถในโมดูล 06
              </div>

              <button
                onClick={handleSubmitSalesPlanToManager}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-2"
              >
                <span>ส่ง Sales Plan ให้ผู้จัดการ (Submit to Manager)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: Mobile Summary Preview (Slide 29 Customer POV)    */}
      {/* ========================================================= */}
      {mobilePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border-4 border-slate-800 animate-scale-up">
            {/* Mobile Header Bar */}
            <div className="bg-slate-900 text-white p-3 text-center text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Smartphone size={14} className="text-emerald-400" />
                <span>หน้าจอมือถือลูกค้า (LINE OA)</span>
              </div>
              <button
                onClick={() => setMobilePreviewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 bg-slate-50 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">สรุปคำสั่งซื้อของคุณ</span>
                  <span className="font-mono text-[10px] text-blue-600 font-bold">
                    {selectedOrder.id}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>ผู้สั่งซื้อ: <strong>{selectedOrder.customerName}</strong></div>
                  <div>เบอร์โทร: <strong>{selectedOrder.phone}</strong></div>
                  <div>สถานที่ส่ง: {selectedOrder.deliveryAddress}</div>
                  <div className="text-blue-700 font-bold">
                    กำหนดส่ง: {selectedOrder.requestedDeliveryDate}
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-slate-100 pt-2 space-y-1.5">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-[11px]">
                      <div>
                        <div className="font-bold text-slate-800">{it.name}</div>
                        <div className="text-slate-400 text-[10px]">{it.quantity} {it.unit} x ฿{it.unitPrice}</div>
                      </div>
                      <span className="font-bold text-slate-900">฿{it.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>ยอดชำระสุทธิ (COD)</span>
                  <span className="text-blue-700">฿{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-snug">
                🔒 ตรวจสอบสินค้าก่อนชำระเงินปลายทาง ไม่มีค่าจัดส่งเพิ่มเติมตามเงื่อนไข
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200">
              <button
                onClick={handleCustomerConfirm}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>ลูกค้ายืนยันคำสั่งซื้อ (Confirm Order)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Internal PO Fullscreen Preview Modal              */}
      {/* ========================================================= */}
      {internalPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck2 size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  เอกสารคำสั่งซื้อภายใน (Internal Purchase Order Preview)
                </h3>
              </div>
              <button
                onClick={() => setInternalPoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {selectedOrder.company === 'AC' ? 'A&C FOODS SUPPLY CO., LTD.' : 'THAI DRIED FOODS (TD) CO., LTD.'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    เอกสารคำสั่งซื้อภายในสำหรับเตรียมสินค้าและจัดรอบรถ (Internal PO)
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-purple-700">
                    {selectedOrder.internalPO?.poNumber || 'PO-INTERNAL-PREVIEW'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    วันที่ออกเอกสาร: {selectedOrder.internalPO?.createdAt || 'วันนี้'}
                  </div>
                </div>
              </div>

              {/* Order Context */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold">ข้อมูลลูกค้า (Customer)</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                  <div className="text-slate-600 text-[11px]">รหัสลูกค้า CV: {selectedOrder.cvCode}</div>
                  <div className="text-slate-600 text-[11px]">ผู้ติดต่อ: {selectedOrder.contactPerson} ({selectedOrder.phone})</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold">สถานที่จัดส่ง & แผนรถ</span>
                  <span className="font-bold text-blue-700">สายส่ง {selectedOrder.routeCode}</span>
                  <div className="text-slate-600 text-[11px]">{selectedOrder.deliveryAddress}</div>
                  <div className="text-emerald-700 font-bold text-[11px]">
                    กำหนดวันส่ง: {selectedOrder.requestedDeliveryDate}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">ลำดับ</th>
                    <th className="py-2 px-3">รหัส / รายการสินค้า</th>
                    <th className="py-2 px-3 text-right">จำนวน</th>
                    <th className="py-2 px-3 text-right">น้ำหนัก</th>
                    <th className="py-2 px-3 text-right">ราคาต่อหน่วย</th>
                    <th className="py-2 px-3 text-right">มูลค่ารวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{it.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{it.skuCode}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">{it.quantity} {it.unit}</td>
                      <td className="py-2 px-3 text-right font-semibold">{it.weightKg} กก.</td>
                      <td className="py-2 px-3 text-right font-mono">฿{it.unitPrice.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">฿{it.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-2 px-3">ยอดรวมสุทธิทั้งสิ้น</td>
                    <td className="py-2 px-3 text-right">{selectedOrder.totalWeightKg} กก.</td>
                    <td></td>
                    <td className="py-2 px-3 text-right text-sm text-purple-700">
                      ฿{selectedOrder.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400 mb-6">ผู้จัดทำคำสั่งซื้อ (Sales AI OS)</div>
                  <div className="font-bold text-slate-800">ระบบ AI Autonomous</div>
                  <div className="text-[10px] text-slate-400">สร้างจากออเดอร์ยืนยันแล้ว</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400 mb-6">ผู้ตรวจสอบสต๊อกและอนุมัติ (ฝ่ายขาย)</div>
                  <div className="font-bold text-slate-800">{selectedOrder.salesConfirmation.confirmedBy || 'คุณแอน ฝ่ายขาย'}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">✓ ตรวจสต๊อกนอกระบบผ่านแล้ว</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  alert(`📥 จำลองการดาวน์โหลดไฟล์: ${selectedOrder.internalPO?.pdfFileName || 'PO_APPROVED.pdf'}`);
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>ดาวน์โหลด PDF</span>
              </button>

              <button
                onClick={() => setInternalPoModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Manager Submission Modal                          */}
      {/* ========================================================= */}
      {managerSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50 text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold">
                  ส่ง Sales Plan ให้ผู้จัดการสำเร็จ!
                </h3>
              </div>
              <button
                onClick={() => setManagerSubmitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">
                  บริษัท: {salesPlanCompany === 'AC' ? 'A&C Foods Supply' : 'TD Foods Supply'}
                </div>
                <div className="text-slate-600">
                  สถานะ: ฝ่ายขายตรวจและอนุมัติครบทุกรอบส่งแล้ว ส่งต่อให้ผู้จัดการเพื่อจัดทำแผนรถและแพลนคลังในโมดูล 06
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                🚚 <strong>เตรียมส่งต่องาน JD 06:</strong> ข้อมูลออเดอร์พร้อมสำหรับจัดรอบรถ จัดสรรตู้ควบคุมอุณหภูมิ และเตรียมจัดส่งในขั้นตอนถัดไป
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setManagerSubmitModal(false);
                  onNavigateToModule('06');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                ดูขั้นตอนถัดไป (โมดูล 06)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Add Item Modal (Catalog Selection)                */}
      {/* ========================================================= */}
      {addItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                เพิ่มสินค้าในคำสั่งซื้อ (จากรายการราคาที่อนุมัติ)
              </h3>
              <button
                onClick={() => setAddItemModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2.5 max-h-80 overflow-y-auto text-xs">
              {MOCK_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 flex items-center justify-between hover:bg-blue-50/30 transition-all"
                >
                  <div>
                    <div className="font-bold text-slate-900">{prod.name}</div>
                    <div className="text-[10px] text-slate-500">{prod.subName}</div>
                    <div className="text-[11px] font-bold text-blue-700 mt-0.5">
                      ฿{prod.standardPrices[0].pricePerKg} บาท/{prod.unit}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newItem: OrderItem = {
                        id: `item-${Date.now()}`,
                        skuCode: prod.skuCode,
                        name: prod.name,
                        subName: prod.subName,
                        quantity: 100,
                        unit: prod.unit,
                        weightKg: 100,
                        unitPrice: prod.standardPrices[0].pricePerKg,
                        totalPrice: 100 * prod.standardPrices[0].pricePerKg,
                      };
                      const updatedItems = [...selectedOrder.items, newItem];
                      const { totalAmount, totalWeightKg } = recalculateOrder(updatedItems);

                      setOrders((prev) =>
                        prev.map((o) => {
                          if (o.id === selectedOrder.id) {
                            return {
                              ...o,
                              items: updatedItems,
                              totalAmount,
                              totalWeightKg,
                            };
                          }
                          return o;
                        })
                      );
                      setAddItemModal(false);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold"
                  >
                    + เพิ่ม
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module05OrderPO;
