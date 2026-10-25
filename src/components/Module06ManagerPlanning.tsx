import React, { useState } from 'react';
import {
  CheckCircle2,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Send,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Settings,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import type {
  Customer,
  RouteMasterItem,
  PlanningOrderItem,
  DeliveryGroup,
  LineSendHistoryItem,
} from '../types';
import {
  MODULE_06_STATS,
  MOCK_ROUTE_MASTER,
  MOCK_VEHICLE_OPTIONS,
  MOCK_DRIVER_OPTIONS,
  MOCK_PLANNING_ORDERS,
  MOCK_DELIVERY_GROUPS,
  MOCK_LINE_HISTORY,
} from '../mockData';

interface Module06ManagerPlanningProps {
  customer: Customer;
  customers: Customer[];
  onNavigateToModule: (moduleId: string) => void;
}

export const Module06ManagerPlanning: React.FC<Module06ManagerPlanningProps> = ({
  onNavigateToModule,
}) => {
  // Navigation mini-stepper state
  const [activeMiniStep, setActiveMiniStep] = useState<number>(1);

  // Selected company filter
  const [companyFilter, setCompanyFilter] = useState<'ALL' | 'AC' | 'TD'>('ALL');

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>('23 ต.ค. 2569');

  // Route Master state (configurable by manager)
  const [routeMaster, setRouteMaster] = useState<RouteMasterItem[]>(MOCK_ROUTE_MASTER);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-south');

  // Orders State (Column 1)
  const [orders, setOrders] = useState<PlanningOrderItem[]>(MOCK_PLANNING_ORDERS);
  const [orderTab, setOrderTab] = useState<'po' | 'so'>('po');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Delivery Groups State (Column 3 & 4)
  const [deliveryGroups, setDeliveryGroups] = useState<DeliveryGroup[]>(MOCK_DELIVERY_GROUPS);

  // Column 2 Subtab
  const [col2Tab, setCol2Tab] = useState<'routes' | 'plans'>('routes');

  // Column 4 Subtab
  const [col4Tab, setCol4Tab] = useState<'summary' | 'by_group' | 'check_po'>('by_group');

  // Column 5 Subtab
  const [col5Mode, setCol5Mode] = useState<'by_group' | 'full_day'>('by_group');

  // Column 6 Subtab
  const [col6Tab, setCol6Tab] = useState<'by_route' | 'by_status'>('by_route');

  // Send History
  const [sendHistory, setSendHistory] = useState<LineSendHistoryItem[]>(MOCK_LINE_HISTORY);

  // Modals state
  const [routeMasterModal, setRouteMasterModal] = useState<boolean>(false);
  const [editingRoute, setEditingRoute] = useState<RouteMasterItem | null>(null);
  const [allocationModal, setAllocationModal] = useState<boolean>(false);
  const [driverModal, setDriverModal] = useState<{ isOpen: boolean; groupId?: string }>({
    isOpen: false,
  });
  const [vehicleModal, setVehicleModal] = useState<{ isOpen: boolean; groupId?: string }>({
    isOpen: false,
  });
  const [lineSentModal, setLineSentModal] = useState<{
    isOpen: boolean;
    groupName: string;
    messageText: string;
    groupTarget: string;
  }>({
    isOpen: false,
    groupName: '',
    messageText: '',
    groupTarget: '',
  });

  // Active Route
  const selectedRoute =
    routeMaster.find((r) => r.id === selectedRouteId) || routeMaster[0];

  // Groups for current route
  const currentRouteGroups = deliveryGroups.filter(
    (g) => g.routeId === selectedRouteId && g.deliveryDate === selectedDate
  );

  // Filter orders for Column 1
  const filteredOrders = orders.filter((o) => {
    if (companyFilter !== 'ALL' && o.company !== companyFilter) return false;
    if (orderTab === 'po' && o.status !== 'ready_delivery') return false;
    if (orderTab === 'so' && o.status !== 'pending_deposit') return false;

    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase().trim();
    return (
      o.poNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.routeName.toLowerCase().includes(q)
    );
  });

  // Calculate selected orders metrics in Column 1
  const selectedOrdersData = orders.filter((o) => selectedOrderIds.includes(o.orderId));
  const selectedWeight = selectedOrdersData.reduce((sum, o) => sum + o.weightKg, 0);

  // Toggle order selection checkbox
  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Add selected orders to active group
  const handleAddOrdersToGroup = (targetGroupId: string) => {
    if (selectedOrderIds.length === 0) {
      alert('กรุณาเลือกออเดอร์ในตารางก่อน');
      return;
    }

    const itemsToAdd = orders.filter((o) => selectedOrderIds.includes(o.orderId));

    setDeliveryGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === targetGroupId) {
          const updatedOrders = [
            ...g.orders,
            ...itemsToAdd.map((item, idx) => ({
              ...item,
              sequence: g.orders.length + idx + 1,
              groupId: g.id,
              isAllocated: true,
            })),
          ];
          const newTotalWeight = updatedOrders.reduce((sum, item) => sum + item.weightKg, 0);
          return {
            ...g,
            orders: updatedOrders,
            totalWeightKg: newTotalWeight,
          };
        }
        return g;
      })
    );

    setOrders((prev) =>
      prev.map((o) =>
        selectedOrderIds.includes(o.orderId)
          ? { ...o, isAllocated: true, groupId: targetGroupId }
          : o
      )
    );

    setSelectedOrderIds([]);
  };

  // Move order sequence in group (Up/Down)
  const handleMoveOrderSequence = (
    groupId: string,
    orderIndex: number,
    direction: 'up' | 'down'
  ) => {
    setDeliveryGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          const list = [...g.orders];
          const targetIndex = direction === 'up' ? orderIndex - 1 : orderIndex + 1;
          if (targetIndex < 0 || targetIndex >= list.length) return g;

          const temp = list[orderIndex];
          list[orderIndex] = list[targetIndex];
          list[targetIndex] = temp;

          // Reassign sequence
          const resequenced = list.map((item, idx) => ({
            ...item,
            sequence: idx + 1,
          }));

          return {
            ...g,
            orders: resequenced,
          };
        }
        return g;
      })
    );
  };

  // Remove order from group
  const handleRemoveOrderFromGroup = (groupId: string, orderId: string) => {
    setDeliveryGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          const remaining = g.orders.filter((o) => o.orderId !== orderId);
          const resequenced = remaining.map((item, idx) => ({
            ...item,
            sequence: idx + 1,
          }));
          const newWeight = resequenced.reduce((sum, o) => sum + o.weightKg, 0);
          return {
            ...g,
            orders: resequenced,
            totalWeightKg: newWeight,
          };
        }
        return g;
      })
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, isAllocated: false, groupId: undefined } : o
      )
    );
  };

  // AI Suggest Sequence (optimizes sequence based on delivery location)
  const handleAISuggestSequence = (groupId: string) => {
    setDeliveryGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          // Sort by customer name or simulated route order
          const sorted = [...g.orders].sort((a, b) => a.customerName.localeCompare(b.customerName));
          const resequenced = sorted.map((item, idx) => ({
            ...item,
            sequence: idx + 1,
          }));
          return {
            ...g,
            orders: resequenced,
          };
        }
        return g;
      })
    );
  };

  // Add new delivery group
  const handleAddNewGroup = () => {
    const groupLetter = String.fromCharCode(65 + currentRouteGroups.length); // A, B, C...
    const newGroup: DeliveryGroup = {
      id: `grp-${Date.now()}`,
      groupName: `กรุ๊ป ${groupLetter}`,
      routeId: selectedRouteId,
      routeName: selectedRoute.name,
      deliveryDate: selectedDate,
      vehicleType: selectedRoute.defaultVehicle,
      vehicleCapacityKg: selectedRoute.vehicleCapacityKg,
      driverName: `${selectedRoute.defaultDriver} (ประจำสาย)`,
      driverPhone: selectedRoute.driverPhone,
      orders: [],
      totalWeightKg: 0,
      status: 'draft',
      warehouseInstructions: '*คลังจัดเบิกตามลำดับคัน ห้ามสลับกล่องสินค้า',
    };

    setDeliveryGroups((prev) => [...prev, newGroup]);
  };

  // Approve group by manager (Slides 25, 29)
  const handleApproveGroup = (groupId: string) => {
    const group = deliveryGroups.find((g) => g.id === groupId);
    if (!group) return;

    // Check if group contains pending deposit orders
    const hasPendingDeposit = group.orders.some((o) => o.status === 'pending_deposit');
    if (hasPendingDeposit) {
      alert(
        '⚠️ ไม่สามารถอนุมัติได้: มีออเดอร์รอมัดจำ ต้องมี PO และผ่านเงื่อนไขก่อนอนุมัติจัดส่งจริง ตามกฎ Slide 26 และ 29'
      );
      return;
    }

    setDeliveryGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              status: 'approved',
              approvedBy: 'คุณสมชาย (ผู้จัดการ)',
              approvedAt: `วันนี้ ${new Date().toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              })} น.`,
            }
          : g
      )
    );
  };

  // Generate LINE message text for group
  const generateLineMessageText = (group: DeliveryGroup) => {
    const lines = [
      `แผนจัดส่ง ${group.routeName} | ${group.deliveryDate}`,
      `${group.groupName} (${group.status === 'sent' ? 'ส่งแล้ว' : 'ฉบับอนุมัติ'})`,
      '--------------------------------',
      `รถ: ${group.vehicleType}`,
      `คนขับ: ${group.driverName} (${group.driverPhone})`,
      `จำนวน: ${group.orders.length} ร้าน (${group.totalWeightKg.toLocaleString()} กก.)`,
      '',
      '📍 ลำดับการจัดส่ง:',
      ...group.orders.map(
        (o, idx) =>
          `${idx + 1}. ${o.customerName} ${o.weightKg} กก. (${o.productName}${
            o.status === 'pending_deposit' ? ' - รอมัดจำ' : ''
          })`
      ),
      '',
      `หมายเหตุคลัง: ${group.warehouseInstructions || '*คลังจัดเบิกตามลำดับคัน ห้ามสลับกล่องสินค้า'}`,
      `น้ำหนักรวม: ${group.totalWeightKg.toLocaleString()} กก. (${Math.round(
        (group.totalWeightKg / group.vehicleCapacityKg) * 100
      )}%)`,
    ];
    return lines.join('\n');
  };

  // Simulate send plan to LINE group (Slide 28)
  const handleSendToLine = (group: DeliveryGroup) => {
    if (group.status !== 'approved' && group.status !== 'sent') {
      alert('⚠️ ต้องได้รับการอนุมัติจากผู้จัดการก่อนส่งแผนเข้า LINE กลุ่มคลัง (Slide 28)');
      return;
    }

    const messageText = generateLineMessageText(group);
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    setDeliveryGroups((prev) =>
      prev.map((g) =>
        g.id === group.id
          ? {
              ...g,
              status: 'sent',
              lineHandoff: {
                isSent: true,
                sentAt: `${selectedDate} ${nowTime} น.`,
                sentBy: 'คุณสมชาย (ผู้จัดการ)',
                targetGroupName: `กลุ่ม LINE คลังห้องเย็น-${group.routeName}`,
                messageText,
              },
            }
          : g
      )
    );

    const newHistory: LineSendHistoryItem = {
      id: `lh-${Date.now()}`,
      timestamp: `${selectedDate} ${nowTime}`,
      title: `ส่งแผน ${group.routeName} ${group.groupName}`,
      action: `ส่งแผนเข้ากลุ่ม LINE คลังเรียบร้อยแล้ว (${group.orders.length} ร้าน, ${group.totalWeightKg} กก.)`,
      operator: 'คุณสมชาย (ผู้จัดการ)',
      groupName: group.groupName,
      routeName: group.routeName,
      status: 'sent',
    };

    setSendHistory((prev) => [newHistory, ...prev]);

    setLineSentModal({
      isOpen: true,
      groupName: group.groupName,
      messageText,
      groupTarget: `กลุ่ม LINE คลังห้องเย็น-${group.routeName}`,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden select-none">
      {/* ========================================================= */}
      {/* TOP HEADER: Module Title, Manager Profile & Stats Bar    */}
      {/* ========================================================= */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 shrink-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                Phase 1 · AI Autonomous + Human Approval
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                Manager Decision Rights (Slide 25 & 29)
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>06 แผนจัดรถ + แผนห้องเย็น/คลัง (จัดส่งเป็นกรุ๊ปตามสาย)</span>
              <span className="text-xs font-normal text-slate-500">
                Manager Planning & Warehouse Plan (JD 06)
              </span>
            </h1>
          </div>

          {/* Quick stats pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">บริษัท:</span>
              <button
                onClick={() => setCompanyFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  companyFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setCompanyFilter('AC')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  companyFilter === 'AC'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                A&C
              </button>
              <button
                onClick={() => setCompanyFilter('TD')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  companyFilter === 'TD'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                TD
              </button>
            </div>

            <button
              onClick={() => setRouteMasterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold shadow-2xs transition-all"
            >
              <Settings size={13} className="text-slate-500" />
              <span>Route & Cut-off Master (Slide 27)</span>
            </button>

            <button
              onClick={() => setAllocationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold shadow-2xs transition-all"
            >
              <SlidersHorizontal size={13} className="text-amber-700" />
              <span>ระบบจัดสรรออเดอร์ (เกลี่ยยอด)</span>
            </button>

            <button
              onClick={() => onNavigateToModule('05')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
            >
              <span>← ย้อนกลับโมดูล 05</span>
            </button>
          </div>
        </div>

        {/* Objective banner from Slide 26 */}
        <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
          <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 leading-relaxed text-[11px]">
            <span className="font-bold text-blue-900">วัตถุประสงค์ระบบจัดส่ง: </span>
            วางแผนจัดส่งหลายวัน จัดกลุ่มการจัดส่งตามสาย (Delivery Group) โดยผูกคนขับประจำสาย
            เป็นค่าเริ่มต้น สามารถมีหลายรถ/หลายกรุ๊ปในสายเดียวกัน ตรวจสอบและอนุมัติ
            และส่งแผนให้คลังผ่าน LINE
          </div>
          <div className="shrink-0 flex items-center gap-3 text-[11px] font-mono font-bold text-slate-700 bg-white/80 px-2 py-1 rounded border border-blue-100">
            <span>ออเดอร์รวม: {MODULE_06_STATS.totalOrders} รายการ</span>
            <span>|</span>
            <span>น้ำหนัก: {MODULE_06_STATS.totalWeightKg.toLocaleString()} กก.</span>
          </div>
        </div>

        {/* Mini 6-step Workflow Pipeline from Slide 26 */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 text-xs">
          {[
            { num: 1, title: 'เลือกออเดอร์', sub: 'PO พร้อมส่ง + คาดการณ์' },
            { num: 2, title: 'เลือกสายและวันที่', sub: 'คนขับประจำสาย' },
            { num: 3, title: 'จัดกลุ่มการจัดส่ง', sub: 'Delivery Group' },
            { num: 4, title: 'ตรวจสอบและอนุมัติ', sub: 'ตรวจความถูกต้อง' },
            { num: 5, title: 'ส่งแผนผ่าน LINE', sub: 'แจ้งคลังห้องเย็น' },
            { num: 6, title: 'ติดตามสถานะ', sub: 'Sent / History' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveMiniStep(s.num)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left shrink-0 transition-all ${
                activeMiniStep === s.num
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeMiniStep === s.num ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {s.num}
              </span>
              <div>
                <div className="text-[11px] font-bold leading-tight">{s.title}</div>
                <div
                  className={`text-[9px] ${
                    activeMiniStep === s.num ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {s.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN WORKSPACE: 6-COLUMN KANBAN (Faithful to Slide 26)    */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 min-w-0">
        <div className="flex gap-3 h-full min-w-max pb-1">
          {/* ======================================================= */}
          {/* COLUMN 1: เลือกออเดอร์จาก JD 05 (PO พร้อมจัดส่ง + คาดการณ์) */}
          {/* ======================================================= */}
          <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col shadow-2xs shrink-0 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    เลือกออเดอร์จาก JD 05
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {filteredOrders.length} รายการ
                </span>
              </div>

              {/* Subtabs: PO พร้อมส่ง vs ออเดอร์คาดการณ์ */}
              <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold text-center">
                <button
                  onClick={() => setOrderTab('po')}
                  className={`py-1 rounded-md transition-all text-[11px] ${
                    orderTab === 'po'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PO พร้อมจัดส่ง (12)
                </button>
                <button
                  onClick={() => setOrderTab('so')}
                  className={`py-1 rounded-md transition-all text-[11px] ${
                    orderTab === 'so'
                      ? 'bg-white text-amber-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ออเดอร์คาดการณ์ (8)
                </button>
              </div>

              {/* Date Filter & Search */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  <span className="text-slate-500">ช่วงวันที่:</span>
                  <span className="font-bold text-slate-800">23 ต.ค. 2569 - 29 ต.ค. 2569</span>
                </div>
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="ค้นหาลูกค้า, เลขที่ PO/SO, สินค้า..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrderIds.includes(ord.orderId);
                return (
                  <div
                    key={ord.orderId}
                    className={`p-2.5 rounded-lg transition-all text-xs flex items-start gap-2 ${
                      isSelected ? 'bg-blue-50/80 border border-blue-300' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOrder(ord.orderId)}
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {ord.poNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            ord.status === 'ready_delivery'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status === 'ready_delivery' ? 'พร้อมจัดส่ง' : 'รอมัดจำ'}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 truncate mt-0.5">
                        {ord.customerName}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({ord.company})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{ord.productName}</span>
                        <span className="font-bold text-slate-700 font-mono">
                          {ord.weightKg} กก.
                        </span>
                      </div>
                      {ord.isAllocated && (
                        <div className="mt-1 text-[9px] text-blue-600 font-semibold bg-blue-50 px-1 py-0.2 rounded inline-block">
                          ✓ อยู่ใน {ord.groupId === 'grp-a' ? 'กรุ๊ป A' : 'กรุ๊ป B'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection Action Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">
                  เลือกแล้ว {selectedOrderIds.length} รายการ
                </span>
                <span className="text-blue-700 font-mono">{selectedWeight} กก.</span>
              </div>
              <button
                onClick={() => {
                  const targetGroup = currentRouteGroups[0]?.id || 'grp-a';
                  handleAddOrdersToGroup(targetGroup);
                }}
                disabled={selectedOrderIds.length === 0}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
              >
                <span>เพิ่มเข้าแผน (กรุ๊ป A)</span>
                <ArrowRight size={13} />
              </button>

              {/* Note banner from Slide 26 */}
              <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 space-y-0.5 leading-tight">
                <div>• เลือกได้ทั้ง PO และออเดอร์คาดการณ์ (รอมัดจำ)</div>
                <div>• ออเดอร์คาดการณ์ใช้ประกอบแผนได้ แต่อนุมัติจัดส่งต้องมี PO</div>
                <div>• ระบบป้องกันการอนุมัติ PO ซ้ำ ในหลายกรุ๊ป</div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 2: เลือกสายจัดส่งและวันที่ (คนขับประจำสาย)        */}
          {/* ======================================================= */}
          <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col shadow-2xs shrink-0 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    เลือกสายจัดส่งและวันที่
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  คนขับประจำสาย
                </span>
              </div>

              {/* Date Picker Input */}
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg text-xs">
                <span className="text-slate-500 font-medium">วันที่จัดส่ง:</span>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="font-bold text-blue-700 font-mono bg-transparent border-none focus:outline-none cursor-pointer text-xs"
                >
                  <option value="23 ต.ค. 2569">23 ต.ค. 2569</option>
                  <option value="24 ต.ค. 2569">24 ต.ค. 2569</option>
                  <option value="25 ต.ค. 2569">25 ต.ค. 2569</option>
                </select>
              </div>

              {/* Toggle: สายจัดส่ง vs รายการแผน */}
              <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold text-center">
                <button
                  onClick={() => setCol2Tab('routes')}
                  className={`py-1 rounded-md transition-all text-[11px] ${
                    col2Tab === 'routes'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  สายจัดส่ง
                </button>
                <button
                  onClick={() => setCol2Tab('plans')}
                  className={`py-1 rounded-md transition-all text-[11px] ${
                    col2Tab === 'plans'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  รายการแผน
                </button>
              </div>
            </div>

            {/* Routes List */}
            <div className="p-3 space-y-2">
              {routeMaster.slice(0, 4).map((r) => {
                const isSelected = r.id === selectedRouteId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-400 shadow-2xs ring-1 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-600" />
                        <span>{r.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {r.operatingDaysSummary}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      คนขับ : <span className="font-semibold">{r.defaultDriver}</span>
                      {isSelected && (
                        <span className="text-[10px] text-blue-700 ml-1 font-bold">
                          (ประจำสาย)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Route Map Preview (Slide 26) */}
            <div className="flex-1 px-3 space-y-2 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>แผนที่{selectedRoute.name} (ตัวอย่างเส้นทาง)</span>
                <span className="text-[10px] text-blue-600">4 จุดส่ง</span>
              </div>
              <div className="h-44 rounded-xl border border-slate-200 overflow-hidden relative group">
                <img
                  src="/assets/route_map.jpg"
                  alt="Delivery Route Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-bold">
                  {selectedRoute.name} - 23 ต.ค. 2569
                </div>
              </div>

              {/* Driver & Truck box */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">คนขับประจำสาย:</div>
                    <div className="font-bold text-slate-800">
                      {selectedRoute.defaultDriver}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {selectedRoute.driverPhone}
                    </div>
                  </div>
                  <button
                    onClick={() => setDriverModal({ isOpen: true, groupId: 'grp-a' })}
                    className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-bold"
                  >
                    เปลี่ยนคนขับ
                  </button>
                </div>

                <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">รถประจำสาย:</div>
                    <div className="font-bold text-slate-800">
                      {selectedRoute.defaultVehicle}
                    </div>
                  </div>
                  <button
                    onClick={() => setVehicleModal({ isOpen: true, groupId: 'grp-a' })}
                    className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-bold"
                  >
                    เปลี่ยนรถ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 3: จัดกลุ่มการจัดส่ง (Delivery Group)           */}
          {/* ======================================================= */}
          <div className="w-88 xl:w-96 bg-white rounded-xl border border-slate-200 flex flex-col shadow-2xs shrink-0 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    จัดกลุ่มการจัดส่ง (Delivery Group)
                  </span>
                </div>
                <button
                  onClick={handleAddNewGroup}
                  className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[10px] font-bold"
                >
                  + เพิ่มกรุ๊ป
                </button>
              </div>
              <div className="text-[10px] text-slate-500">
                สายเดียวกันมีหลายกรุ๊ปในวันเดียวกันได้ ({currentRouteGroups.length} กรุ๊ป)
              </div>
            </div>

            {/* Groups list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {currentRouteGroups.map((group) => {
                const percent = Math.min(
                  100,
                  Math.round((group.totalWeightKg / group.vehicleCapacityKg) * 100)
                );
                return (
                  <div
                    key={group.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {group.groupName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {group.routeName} | {group.deliveryDate}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          group.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : group.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {group.status === 'sent'
                          ? 'ส่งแล้ว'
                          : group.status === 'approved'
                          ? 'อนุมัติแล้ว'
                          : 'Draft'}
                      </span>
                    </div>

                    {/* Truck & Driver Selectors */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          รถจัดส่ง
                        </label>
                        <select
                          value={group.vehicleType}
                          onChange={(e) => {
                            const v = MOCK_VEHICLE_OPTIONS.find(
                              (opt) => opt.name === e.target.value
                            );
                            setDeliveryGroups((prev) =>
                              prev.map((g) =>
                                g.id === group.id
                                  ? {
                                      ...g,
                                      vehicleType: e.target.value,
                                      vehicleCapacityKg: v?.capacityKg || 6000,
                                    }
                                  : g
                              )
                            );
                          }}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-[11px] text-slate-800 font-semibold"
                        >
                          {MOCK_VEHICLE_OPTIONS.map((v) => (
                            <option key={v.id} value={v.name}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">คนขับ</label>
                        <select
                          value={group.driverName}
                          onChange={(e) =>
                            setDeliveryGroups((prev) =>
                              prev.map((g) =>
                                g.id === group.id ? { ...g, driverName: e.target.value } : g
                              )
                            )
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-[11px] text-slate-800 font-semibold"
                        >
                          {MOCK_DRIVER_OPTIONS.map((d) => (
                            <option key={d.id} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Weight Capacity Progress Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">น้ำหนักรวม:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {group.totalWeightKg.toLocaleString()} /{' '}
                          {group.vehicleCapacityKg.toLocaleString()} กก. ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent > 90
                              ? 'bg-rose-500'
                              : percent > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Order Items Table in this Group */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>รายการจัดส่ง ({group.orders.length} รายการ)</span>
                        <button
                          onClick={() => handleAISuggestSequence(group.id)}
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Sparkles size={11} className="text-blue-500" />
                          <span>จัดลำดับอัตโนมัติ (AI)</span>
                        </button>
                      </div>

                      <div className="divide-y divide-slate-200/80 bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                        {group.orders.map((ord, idx) => (
                          <div
                            key={ord.orderId}
                            className="p-2 flex items-center justify-between hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate text-[11px]">
                                  {ord.customerName}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {ord.poNumber} • {ord.productName}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold text-slate-700 text-[11px]">
                                {ord.weightKg} กก.
                              </span>
                              <div className="flex flex-col">
                                <button
                                  onClick={() =>
                                    handleMoveOrderSequence(group.id, idx, 'up')
                                  }
                                  disabled={idx === 0}
                                  className="text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                >
                                  <ChevronUp size={11} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleMoveOrderSequence(group.id, idx, 'down')
                                  }
                                  disabled={idx === group.orders.length - 1}
                                  className="text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                >
                                  <ChevronDown size={11} />
                                </button>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveOrderFromGroup(group.id, ord.orderId)
                                }
                                className="text-slate-300 hover:text-rose-600 p-0.5"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 4: ตรวจสอบและอนุมัติแผน (รายกรุ๊ป)                */}
          {/* ======================================================= */}
          <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col shadow-2xs shrink-0 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    4
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    ตรวจสอบและอนุมัติแผน
                  </span>
                </div>
                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  สิทธิ์ผู้จัดการ
                </span>
              </div>

              {/* Subtabs: สรุปทั้งวัน vs ตามกรุ๊ป vs ตรวจสอบ PO */}
              <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold text-center">
                <button
                  onClick={() => setCol4Tab('summary')}
                  className={`py-1 rounded text-[10px] ${
                    col4Tab === 'summary' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  สรุปทั้งวัน
                </button>
                <button
                  onClick={() => setCol4Tab('by_group')}
                  className={`py-1 rounded text-[10px] ${
                    col4Tab === 'by_group' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ตามกรุ๊ป
                </button>
                <button
                  onClick={() => setCol4Tab('check_po')}
                  className={`py-1 rounded text-[10px] ${
                    col4Tab === 'check_po' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ตรวจ PO
                </button>
              </div>
            </div>

            {/* Review Cards for each group */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {currentRouteGroups.map((grp) => {
                const hasPendingDeposit = grp.orders.some((o) => o.status === 'pending_deposit');
                return (
                  <div
                    key={grp.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {grp.groupName} - {grp.routeName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          grp.status === 'approved' || grp.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {grp.status === 'sent'
                          ? 'ส่งแล้ว'
                          : grp.status === 'approved'
                          ? 'อนุมัติแล้ว'
                          : 'Draft'}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <div>รถจัดส่ง: {grp.vehicleType}</div>
                      <div>คนขับ: {grp.driverName}</div>
                      <div>จำนวนลูกค้า: {grp.orders.length} ร้าน</div>
                      <div>น้ำหนักรวม: {grp.totalWeightKg.toLocaleString()} กก.</div>
                    </div>

                    {/* Status & Approval logic (Slide 26) */}
                    {hasPendingDeposit ? (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <AlertTriangle size={13} className="text-amber-600" />
                          <span>ยังอนุมัติไม่ได้</span>
                        </div>
                        <div>มีออเดอร์รอมัดจำ 2 รายการ</div>
                        <div className="text-[10px] text-amber-700">
                          ต้องมี PO และผ่านเงื่อนไขก่อนอนุมัติจัดส่งจริง
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>ตรวจสอบแล้ว ไม่มีปัญหา</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => alert('แก้ไขข้อมูลแผน')}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded text-xs font-semibold"
                      >
                        ✏ แก้ไข
                      </button>
                      <button
                        onClick={() => handleApproveGroup(grp.id)}
                        disabled={hasPendingDeposit || grp.status === 'approved' || grp.status === 'sent'}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded text-xs font-bold transition-all shadow-xs"
                      >
                        {grp.status === 'sent'
                          ? 'อนุมัติและส่งแล้ว'
                          : grp.status === 'approved'
                          ? 'อนุมัติเรียบร้อย'
                          : 'อนุมัติกรุ๊ปนี้'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Duplicate PO validation banner (from Slide 26) */}
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span>การตรวจสอบ PO ซ้ำ</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>✓ ไม่พบ PO ซ้ำในกรุ๊ปอื่นของวันที่ {selectedDate}</div>
                  <div>✓ ไม่พบ PO ที่อนุมัติจัดส่งไปแล้ว</div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 5: ส่งแผนให้คลังผ่าน LINE (ส่งรายกรุ๊ปหรือทั้งวัน)   */}
          {/* ======================================================= */}
          <div className="w-88 xl:w-96 bg-white rounded-xl border border-slate-200 flex flex-col shadow-2xs shrink-0 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    5
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    ส่งแผนให้คลังผ่าน LINE
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedDate}
                </span>
              </div>

              {/* Mode: ส่งรายกรุ๊ป vs ส่งทั้งวัน */}
              <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold text-center">
                <button
                  onClick={() => setCol5Mode('by_group')}
                  className={`py-1 rounded text-[11px] ${
                    col5Mode === 'by_group'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  ส่งรายกรุ๊ป
                </button>
                <button
                  onClick={() => setCol5Mode('full_day')}
                  className={`py-1 rounded text-[11px] ${
                    col5Mode === 'full_day'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  ส่งทั้งวัน
                </button>
              </div>
            </div>

            {/* Simulated LINE Messages Preview (Slide 26 & 28) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="text-[11px] font-bold text-slate-600">
                ตัวอย่างข้อความที่จะส่งไป LINE คลัง:
              </div>

              {currentRouteGroups.map((grp) => {
                const isSent = grp.status === 'sent';
                return (
                  <div
                    key={grp.id}
                    className="rounded-xl border border-slate-300 overflow-hidden shadow-xs bg-[#7494c0]/10"
                  >
                    {/* LINE Message Box */}
                    <div className="p-3.5 bg-white font-mono text-xs text-slate-800 space-y-2 leading-relaxed">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-bold text-emerald-800">
                          แผนจัดส่ง {grp.routeName} | {grp.deliveryDate}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isSent ? 'ส่งแล้ว' : 'รออนุมัติ'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        <div>{grp.groupName} ({isSent ? 'ส่งแล้ว' : 'ฉบับอนุมัติ'})</div>
                        <div>รถ: {grp.vehicleType}</div>
                        <div>คนขับ: {grp.driverName} ({grp.driverPhone})</div>
                        <div>จำนวน: {grp.orders.length} ร้าน ({grp.totalWeightKg.toLocaleString()} กก.)</div>
                      </div>

                      <div className="pt-1">
                        <div className="font-bold text-slate-900 text-[11px]">📍 ลำดับการจัดส่ง:</div>
                        <div className="space-y-0.5 text-[11px] text-slate-700 pl-2 mt-0.5">
                          {grp.orders.map((o, idx) => (
                            <div key={o.orderId}>
                              {idx + 1}. {o.customerName} {o.weightKg} กก.{' '}
                              {o.status === 'pending_deposit' && '(รอมัดจำ)'}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        *หมายเหตุคลัง: {grp.warehouseInstructions}
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 text-right">
                        น้ำหนักรวม: {grp.totalWeightKg} กก.
                      </div>
                    </div>

                    {/* Send Action */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {isSent ? `ส่งเมื่อ: ${grp.lineHandoff?.sentAt}` : 'ยังไม่ส่ง'}
                      </span>
                      <button
                        onClick={() => handleSendToLine(grp)}
                        disabled={grp.status !== 'approved'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                          isSent
                            ? 'bg-emerald-600 text-white'
                            : grp.status === 'approved'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Send size={12} />
                        <span>{isSent ? 'ส่งซ้ำ' : 'ส่งกรุ๊ปนี้ผ่าน LINE'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 6: ติดตามสถานะ (สถานะและประวัติการส่ง)           */}
          {/* ======================================================= */}
          <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col shadow-2xs shrink-0 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    6
                  </span>
                  <span className="text-xs font-bold text-slate-900">ติดตามสถานะ</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedDate}
                </span>
              </div>

              {/* Subtabs: แสดงตามสาย vs แสดงตามสถานะ */}
              <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold text-center">
                <button
                  onClick={() => setCol6Tab('by_route')}
                  className={`py-1 rounded text-[11px] ${
                    col6Tab === 'by_route'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  แสดงตามสาย
                </button>
                <button
                  onClick={() => setCol6Tab('by_status')}
                  className={`py-1 rounded text-[11px] ${
                    col6Tab === 'by_status'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  แสดงตามสถานะ
                </button>
              </div>
            </div>

            {/* Route Status Summary */}
            <div className="p-3 border-b border-slate-200 bg-white space-y-2 text-xs">
              <div className="font-bold text-slate-800">
                {selectedRoute.name} ({currentRouteGroups.length} กรุ๊ป)
              </div>

              <div className="space-y-1.5">
                {currentRouteGroups.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{grp.groupName}</div>
                      <div className="text-[10px] text-slate-500">
                        {grp.orders.length} ร้าน | {grp.totalWeightKg} กก.
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        grp.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : grp.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {grp.status === 'sent'
                        ? 'Sent'
                        : grp.status === 'approved'
                        ? 'Approved'
                        : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* LINE Handoff History */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>ประวัติการส่ง LINE (Handoff History)</span>
                <span className="text-[10px] text-slate-400">
                  {sendHistory.length} รายการ
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {sendHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-bold">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{item.action}</div>
                    <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>โดย: {item.operator}</span>
                      <span className="font-mono">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Route & Cut-off Master Configuration (Slide 27) */}
      {/* ========================================================= */}
      {routeMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Route & Cut-off Master (ตารางมาสเตอร์สายส่งและเวลาตัดรอบ)
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    อ้างอิง Slide 27: ผู้จัดการสามารถเพิ่ม/แก้ไข/ปิด Route วันรถออก และ Cut-off
                    ได้ โดยตารางเป็นค่าเริ่มต้น ไม่ Hard-code
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRouteMasterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {routeMaster.map((r) => (
                  <div key={r.id} className="p-3.5 hover:bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{r.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            r.category === 'morning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {r.category === 'morning' ? 'รอบเช้า' : 'รอบกลางคืน'}
                        </span>
                        <span className="text-[11px] text-slate-600 font-semibold">
                          วันรถออก: {r.operatingDaysSummary}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingRoute(r);
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold"
                        >
                          ✏ แก้ไข
                        </button>
                        <button
                          onClick={() => {
                            setRouteMaster((prev) =>
                              prev.map((item) =>
                                item.id === r.id ? { ...item, isActive: !item.isActive } : item
                              )
                            );
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold ${
                            r.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {r.isActive ? 'เปิดใช้งาน' : 'ปิดชั่วคราว'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <div>
                        <strong>Cut-off Rule:</strong> {r.cutoffRule}
                      </div>
                      <div>
                        <strong>วันรับสินค้า:</strong> {r.deliveryArrivalRule}
                      </div>
                      <div>
                        <strong>คนขับประจำสาย:</strong> {r.defaultDriver} ({r.driverPhone})
                      </div>
                      <div>
                        <strong>รถประจำสาย:</strong> {r.defaultVehicle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editing Route Subform */}
              {editingRoute && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 mt-2">
                  <div className="font-bold text-xs text-blue-900 flex items-center justify-between">
                    <span>แก้ไขข้อมูล {editingRoute.name}</span>
                    <button
                      onClick={() => setEditingRoute(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">วันรถออก</label>
                      <input
                        type="text"
                        value={editingRoute.operatingDaysSummary}
                        onChange={(e) =>
                          setEditingRoute({ ...editingRoute, operatingDaysSummary: e.target.value })
                        }
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Cut-off Rule</label>
                      <input
                        type="text"
                        value={editingRoute.cutoffRule}
                        onChange={(e) =>
                          setEditingRoute({ ...editingRoute, cutoffRule: e.target.value })
                        }
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingRoute(null)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => {
                        setRouteMaster((prev) =>
                          prev.map((item) => (item.id === editingRoute.id ? editingRoute : item))
                        );
                        setEditingRoute(null);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold"
                    >
                      บันทึกการแก้ไข
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                กฎ Route เป็นข้อมูลสำหรับแนะนำรอบ ไม่ใช่การรับประกันวันส่งสินค้า
              </span>
              <button
                onClick={() => setRouteMasterModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Order Allocation / เกลี่ยยอด (Slide 26 Footnote) */}
      {/* ========================================================= */}
      {allocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-amber-700" />
                <h3 className="text-sm font-bold text-amber-900">
                  ระบบจัดสรรออเดอร์ (เกลี่ยยอด) — Manager Manual Allocation
                </h3>
              </div>
              <button
                onClick={() => setAllocationModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto text-xs">
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 leading-relaxed text-[11px]">
                <strong>ข้อกำหนด Slide 26 & 29:</strong>{' '}
                ผู้จัดการสามารถเลือกและจัดสรรออเดอร์เพื่อเกลี่ยยอดตามความจุของรถ (เช่น รถ 6 ล้อ
                6,000 กก.) โดยระบบจะไม่ตัดหรือย้ายออเดอร์โดยอัตโนมัติ
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Group A Box */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>กรุ๊ป A (สายใต้)</span>
                    <span className="font-mono text-blue-700">
                      {deliveryGroups[0]?.totalWeightKg || 800} กก.
                    </span>
                  </div>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {deliveryGroups[0]?.orders.map((o) => (
                      <div
                        key={o.orderId}
                        className="p-2 bg-white rounded border border-slate-200 text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{o.customerName}</div>
                          <div className="text-[10px] text-slate-400">
                            {o.poNumber} • {o.weightKg} กก.
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Move from Group A to Group B
                            handleRemoveOrderFromGroup('grp-a', o.orderId);
                            setDeliveryGroups((prev) =>
                              prev.map((g) =>
                                g.id === 'grp-b'
                                  ? {
                                      ...g,
                                      orders: [...g.orders, { ...o, groupId: 'grp-b' }],
                                      totalWeightKg: g.totalWeightKg + o.weightKg,
                                    }
                                  : g
                              )
                            );
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold"
                        >
                          ย้ายไป B →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group B Box */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>กรุ๊ป B (สายใต้)</span>
                    <span className="font-mono text-amber-700">
                      {deliveryGroups[1]?.totalWeightKg || 450} กก.
                    </span>
                  </div>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {deliveryGroups[1]?.orders.map((o) => (
                      <div
                        key={o.orderId}
                        className="p-2 bg-white rounded border border-slate-200 text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{o.customerName}</div>
                          <div className="text-[10px] text-slate-400">
                            {o.poNumber} • {o.weightKg} กก.
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Move from Group B to Group A
                            handleRemoveOrderFromGroup('grp-b', o.orderId);
                            setDeliveryGroups((prev) =>
                              prev.map((g) =>
                                g.id === 'grp-a'
                                  ? {
                                      ...g,
                                      orders: [...g.orders, { ...o, groupId: 'grp-a' }],
                                      totalWeightKg: g.totalWeightKg + o.weightKg,
                                    }
                                  : g
                              )
                            );
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold"
                        >
                          ← ย้ายไป A
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAllocationModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                บันทึกการเกลี่ยยอด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: LINE Sent Confirmation (Slide 28)                */}
      {/* ========================================================= */}
      {lineSentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50 text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold">
                  จำลองส่งแผนจัดส่งเข้า LINE คลังสำเร็จ!
                </h3>
              </div>
              <button
                onClick={() => setLineSentModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 block mb-1">
                  กลุ่มเป้าหมาย: {lineSentModal.groupTarget}
                </span>
                <p className="text-[11px] text-slate-500">
                  ระบบได้ส่งข้อความแผนจัดส่ง (Warehouse Plan) รูปแบบเดิมเข้ากลุ่มคลังเรียบร้อยแล้ว
                  พร้อมบันทึกประวัติการส่ง (Handoff History)
                </p>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                {lineSentModal.messageText}
              </div>

              <div className="text-[10px] text-slate-400 italic text-center">
                *การส่งเป็นแบบจำลอง (Demo / Simulation) สิ้นสุดขอบเขตเฟส 1 ตาม Slide 28
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setLineSentModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Driver Selection Modal                           */}
      {/* ========================================================= */}
      {driverModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900">เลือกคนขับประจำสาย / รถ</h3>
              <button
                onClick={() => setDriverModal({ isOpen: false })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
              {MOCK_DRIVER_OPTIONS.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    if (driverModal.groupId) {
                      setDeliveryGroups((prev) =>
                        prev.map((g) =>
                          g.id === driverModal.groupId
                            ? { ...g, driverName: d.name, driverPhone: d.phone }
                            : g
                        )
                      );
                    }
                    setDriverModal({ isOpen: false });
                  }}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer rounded-lg flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="font-bold text-slate-800">{d.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{d.phone}</div>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    เลือก
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: Vehicle Selection Modal                         */}
      {/* ========================================================= */}
      {vehicleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900">เลือกรถจัดส่ง</h3>
              <button
                onClick={() => setVehicleModal({ isOpen: false })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
              {MOCK_VEHICLE_OPTIONS.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    if (vehicleModal.groupId) {
                      setDeliveryGroups((prev) =>
                        prev.map((g) =>
                          g.id === vehicleModal.groupId
                            ? { ...g, vehicleType: v.name, vehicleCapacityKg: v.capacityKg }
                            : g
                        )
                      );
                    }
                    setVehicleModal({ isOpen: false });
                  }}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer rounded-lg flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="font-bold text-slate-800">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ทะเบียน: {v.plate} ({v.capacityKg.toLocaleString()} กก.)
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    เลือก
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module06ManagerPlanning;
