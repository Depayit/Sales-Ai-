import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Bot,
  Search,
  Check,
  Sparkles,
  BarChart2,
  Send,
  Save,
} from 'lucide-react';
import type { Customer, Module02Qualification as IQualification, CustomerBuyingDNA } from '../types';
import {
  MODULE_02_STATS,
  MOCK_BUYING_DNA_MAP,
  MOCK_OPPORTUNITY_LEADS,
  MOCK_PRODUCT_FIT_SEARCH,
} from '../mockData';

interface Module02QualificationProps {
  customer: Customer;
  customers: Customer[];
  onSelectCustomer: (cust: Customer) => void;
  onNavigateToModule03: () => void;
  onOpenChatModal?: (customer: Customer) => void;
}

export const Module02Qualification: React.FC<Module02QualificationProps> = ({
  customer,
  customers,
  onSelectCustomer,
  onNavigateToModule03,
}) => {
  // Mode switcher: Tab 1 (Main Qualification Form - Slide 9) vs Tab 2 (Buying DNA & Opportunity Board - Slide 10)
  const [activeTab, setActiveTab] = useState<'qualification' | 'buying_dna'>('qualification');

  // Customer List Filters (Left Pane)
  const [searchLead, setSearchLead] = useState('');
  const [leadFilter, setLeadFilter] = useState<'all' | 'ai' | 'sales'>('all');

  // Editable Form State for Qualification Form (Slide 9)
  const currentQual: IQualification = customer.qualification || {
    interestedSku: 'เศษสามชั้น (สำหรับทำหมูกรอบ)',
    expectedQty: '500 กก./ครั้ง',
    purpose: 'ผลิตหมูกรอบจำหน่ายหน้าร้าน',
    orderFrequency: 'ทุกสัปดาห์',
    urgentLevel: 'ปกติ',
    aiScore: 'A - สูง',
    confidence: 92,
    tags: ['Route: R1 ขอนแก่น', 'หมูกรอบ', '500 กก.', 'ลูกค้าซื้อซ้ำ'],
    routeFeasibility: 'อยู่ในพื้นที่จัดส่งประจำ (R1 - ขอนแก่น)',
    note: 'สั่งประจำ ต้องการส่งตรงเวลา รถรอบเช้าก่อน 07:00 น.',
    buyingPattern: 'regular',
    monthlyVolumeEst: '2,000 กก. / เดือน',
    constraints: {
      deliveryTime: '08:00 - 16:00 น.',
      locationType: 'หน้าร้าน (มีตู้แช่)',
      packaging: 'ไม่ระบุ (มาตรฐานโรงงาน)',
      paymentTerm: 'เก็บเงินปลายทาง / มัดจำตามรอบ',
      specialNotes: 'ติดต่อก่อนเข้าพื้นที่ 15 นาที',
    },
  };

  const [formState, setFormState] = useState<IQualification>(currentQual);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if customer changes
  React.useEffect(() => {
    setFormState(customer.qualification || currentQual);
    setIsSaved(false);
  }, [customer]);

  // Buying DNA state (Slide 10)
  const buyingDNA: CustomerBuyingDNA =
    MOCK_BUYING_DNA_MAP[customer.id] || MOCK_BUYING_DNA_MAP['cust-1'];

  // AI Product Fit Search state (Slide 10 Pillar 3)
  const [selectedSkuQuery, setSelectedSkuQuery] = useState<'เศษสามชั้น' | 'ซี่โครงหมู'>('เศษสามชั้น');
  const [opportunityLeads] = useState(MOCK_OPPORTUNITY_LEADS);
  const [oppFilter, setOppFilter] = useState<'all' | 'ready' | 'review' | 'unfit'>('all');

  // Handoff to sales via LINE state
  const [salesPitchMessage, setSalesPitchMessage] = useState(
    `ลูกค้าร้าน ${customer.name}\nAI Score: ${buyingDNA.recommendedProducts[0]?.confidence || 92}%\nสินค้าแนะนำ: ${buyingDNA.recommendedProducts[0]?.skuName || 'เศษสามชั้น 500 กก.'}\nเหตุผล: ${buyingDNA.recommendedProducts[0]?.reason || 'ตรงตามสเปกเมนูหลักหน้าร้าน'}\nรอบส่ง R1 ผ่านวันพุธนี้ เหมาะสำหรับการปิดการขายรอบแรกครับ`
  );
  const [handoffSent, setHandoffSent] = useState(false);

  // Filter leads for left list
  const filteredCustomers = customers.filter((c) => {
    if (leadFilter === 'ai' && c.status !== 'ai') return false;
    if (leadFilter === 'sales' && c.status !== 'sales') return false;

    if (!searchLead.trim()) return true;
    const q = searchLead.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q)
    );
  });

  const handleSaveQualification = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSendSalesHandoff = () => {
    setHandoffSent(true);
    setTimeout(() => setHandoffSent(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden select-none">
      {/* 1. TOP STATS BAR & VIEW SWITCHER (Slide 9 & 10) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Key KPI Stats Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] min-w-0 py-0.5">
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">ลูกค้าทั้งหมด:</span>
              <span className="font-bold text-slate-800">{MODULE_02_STATS.totalLeads}</span>
              <span className="text-emerald-600 font-semibold text-[10px]">
                {MODULE_02_STATS.totalLeadsDiff}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 text-blue-800 font-semibold">
              <span className="text-blue-600 font-medium">AI ดูแล:</span>{' '}
              <span>{MODULE_02_STATS.aiHandledCount} ({MODULE_02_STATS.aiHandledPercent})</span>
            </div>

            <div className="bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg shrink-0 text-purple-800 font-semibold">
              <span className="text-purple-600 font-medium">เซลล์ตอบ:</span>{' '}
              <span>{MODULE_02_STATS.salesHandledCount} ({MODULE_02_STATS.salesHandledPercent})</span>
            </div>

            <div className="hidden xl:flex items-center gap-1 shrink-0 pl-1">
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600">
                ลูกค้าใหม่: <strong className="text-slate-800">{MODULE_02_STATS.newLeadsCount}</strong>
              </span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600">
                กำลังสนทนา: <strong className="text-slate-800">{MODULE_02_STATS.chattingCount}</strong>
              </span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600">
                รอเช็กสต็อก: <strong className="text-slate-800">{MODULE_02_STATS.checkingStockCount}</strong>
              </span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                สั่งซื้อสำเร็จ: <strong>{MODULE_02_STATS.orderedCount}</strong>
              </span>
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700">
                นอกเส้นทาง: <strong>{MODULE_02_STATS.outOfRouteCount}</strong>
              </span>
            </div>
          </div>

          {/* Sub-view Switcher & Action Button */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200">
              <button
                onClick={() => setActiveTab('qualification')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'qualification'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>1. คัดกรองและประเมิน Lead</span>
              </button>

              <button
                onClick={() => setActiveTab('buying_dna')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'buying_dna'
                    ? 'bg-white text-purple-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={13} className="text-purple-600" />
                <span>2. Buying DNA & Opportunity</span>
                <span className="text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full font-bold">
                  ใหม่
                </span>
              </button>
            </div>

            <button
              onClick={onNavigateToModule03}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs shrink-0"
            >
              <span>ส่งต่อไปโมดูล 03</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT PANEL: LEAD LIST (128 LEADS) */}
        <div className="w-80 h-full shrink-0 flex flex-col border-r border-slate-200 bg-white">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อร้าน, เบอร์โทร, จังหวัด..."
                value={searchLead}
                onChange={(e) => setSearchLead(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Filter Tabs (ทั้งหมด 128 | AI ดูแล 112 | เซลล์ตอบ 16) */}
            <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold text-center">
              <button
                onClick={() => setLeadFilter('all')}
                className={`py-1 rounded-md transition-colors ${
                  leadFilter === 'all'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด (128)
              </button>
              <button
                onClick={() => setLeadFilter('ai')}
                className={`py-1 rounded-md transition-colors ${
                  leadFilter === 'ai'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                AI ดูแล (112)
              </button>
              <button
                onClick={() => setLeadFilter('sales')}
                className={`py-1 rounded-md transition-colors ${
                  leadFilter === 'sales'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                เซลล์ตอบ (16)
              </button>
            </div>
          </div>

          {/* Lead Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredCustomers.map((c) => {
              const isSelected = c.id === customer.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCustomer(c)}
                  className={`p-3 cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: c.avatarColor }}
                  >
                    {c.name.substring(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.lastMessageTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.category} • จ.{c.province}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.qualification?.aiScore || 'A - 92%'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {c.routeCode}
                      </span>
                      {c.status === 'out_of_route' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          นอกสายส่ง
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: DETAIL VIEW (TAB 1 VS TAB 2) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: LEAD QUALIFICATION 6 CORE DIMENSIONS (Strictly Slide 9 & 11) */}
          {activeTab === 'qualification' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Customer Header Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-2xs"
                    style={{ backgroundColor: customer.avatarColor }}
                  >
                    {customer.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{customer.name}</h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {customer.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Bot size={11} />
                        <span>Lead Score: {formState.aiScore} ({formState.confidence}%)</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                      <span>โทร: <strong className="font-mono text-slate-700">{customer.phone}</strong></span>
                      <span>•</span>
                      <span>ผู้ติดต่อ: {customer.contactPerson}</span>
                      <span>•</span>
                      <span>จังหวัด: จ.{customer.province} ({customer.district})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {isSaved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                      <Check size={14} /> บันทึกข้อมูลแล้ว
                    </span>
                  )}
                  <button
                    onClick={handleSaveQualification}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                  >
                    <Save size={13} />
                    <span>บันทึกผลการคัดกรอง</span>
                  </button>
                </div>
              </div>

              {/* 6 Core Qualification Dimensions Grid (from Slide 9) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                {/* 1. วิเคราะห์สินค้าและปริมาณ */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">1</span>
                      <span>สินค้าและปริมาณ</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ยืนยันแล้ว</span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block uppercase">สินค้าที่ต้องการ</label>
                      <input
                        type="text"
                        value={formState.interestedSku}
                        onChange={(e) => setFormState({ ...formState, interestedSku: e.target.value })}
                        className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block uppercase">ปริมาณที่ต้องการ</label>
                        <input
                          type="text"
                          value={formState.expectedQty}
                          onChange={(e) => setFormState({ ...formState, expectedQty: e.target.value })}
                          className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block uppercase">หน่วย</label>
                        <input
                          type="text"
                          value="กก."
                          readOnly
                          className="w-full text-xs px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600"
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-900 leading-tight">
                      <strong>AI วิเคราะห์:</strong> ลูกค้าต้องการนำไปผลิตหมูกรอบ ปริมาณ 500 กก. สม่ำเสมอ เหมาะกับราคาส่ง Tier 3
                    </div>
                  </div>
                </div>

                {/* 2. ประเมินรูปแบบการซื้อและโอกาสซื้อประจำ */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">2</span>
                      <span>รูปแบบการซื้อ & โอกาส</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">ซื้อประจำ</span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block uppercase">รูปแบบการซื้อ</label>
                      <div className="grid grid-cols-3 gap-1 pt-0.5">
                        {['ครั้งเดียว', 'ครั้งคราว', 'ซื้อประจำ'].map((pattern) => (
                          <button
                            key={pattern}
                            type="button"
                            onClick={() =>
                              setFormState({
                                ...formState,
                                buyingPattern: pattern === 'ซื้อประจำ' ? 'regular' : pattern === 'ครั้งคราว' ? 'occasional' : 'once',
                              })
                            }
                            className={`py-1 text-[11px] font-semibold rounded border transition-colors ${
                              (pattern === 'ซื้อประจำ' && formState.buyingPattern === 'regular') ||
                              (pattern === 'ครั้งคราว' && formState.buyingPattern === 'occasional') ||
                              (pattern === 'ครั้งเดียว' && formState.buyingPattern === 'once')
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pattern}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block uppercase">ความถี่ในการสั่งซื้อ</label>
                      <input
                        type="text"
                        value={formState.orderFrequency}
                        onChange={(e) => setFormState({ ...formState, orderFrequency: e.target.value })}
                        className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                      />
                    </div>

                    <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg text-[11px] text-emerald-900 flex items-center justify-between">
                      <span>ระดับโอกาสขาย: <strong>{formState.aiScore}</strong></span>
                      <span className="font-bold text-emerald-700">มั่นใจ {formState.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* 3. ตรวจสอบพื้นที่จัดส่งและความเป็นไปได้ */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">3</span>
                      <span>พื้นที่จัดส่ง & Route</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {customer.routeCode}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block uppercase">ผลตรวจ Route Master</label>
                      <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                        {customer.deliveryZone}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-0.5">
                      <div><strong className="text-slate-700">รอบรถประจำ:</strong> {customer.routeDays}</div>
                      <div><strong className="text-slate-700">รถบริการ:</strong> รถห้องเย็น A&C Fleet (-18°C ถึง 4°C)</div>
                    </div>

                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500">
                      *กฎสำคัญ: อยู่นอกเส้นทางต้องเสนอให้ฝ่ายขายพิจารณา ไม่ตัดลูกค้าออก
                    </div>
                  </div>
                </div>

                {/* 4. ประเมินความเร่งด่วนของความต้องการ */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">4</span>
                      <span>ความเร่งด่วน & วันที่</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {formState.urgentLevel}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block uppercase">วันที่ต้องการรับสินค้า</label>
                      <input
                        type="text"
                        value={customer.requestedDate}
                        readOnly
                        className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block uppercase">ระยะเวลาเตรียมการ</label>
                      <div className="text-xs font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        5 วัน (ตรงรอบส่งประจำวันพุธ ไม่ต้องจัดรถพิเศษ)
                      </div>
                    </div>
                    <div className="p-2 bg-purple-50/70 border border-purple-100 rounded-lg text-[11px] text-purple-900 leading-tight">
                      <strong>AI วิเคราะห์:</strong> ลูกค้าสั่งล่วงหน้าตามเกณฑ์ ไม่เกิน Cut-off รอบรถปกติ
                    </div>
                  </div>
                </div>

                {/* 5. จัด Tag ลูกค้า */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">5</span>
                      <span>Tag คัดกรอง</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      {customer.tags.length} แท็ก
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 min-h-[60px] pt-1">
                    {customer.tags.map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 italic">
                    *Tag เฉพาะ Route/พื้นที่ + กลุ่มช่องทาง (ไม่สร้าง Tag ซ้ำซ้อน)
                  </div>
                </div>

                {/* 6. ข้อจำกัดหรือเงื่อนไขเฉพาะของลูกค้า */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">6</span>
                      <span>ข้อจำกัดและเงื่อนไข</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ปกติ</span>
                  </div>

                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <div><strong className="text-slate-800">เวลาส่งสินค้า:</strong> 08:00 - 16:00 น.</div>
                    <div><strong className="text-slate-800">สถานที่ส่ง:</strong> หน้าร้าน (มีตู้แช่เก็บเนื้อสด)</div>
                    <div><strong className="text-slate-800">การชำระเงิน:</strong> เก็บเงินปลายทาง / โอนผ่านแอป</div>
                    <div><strong className="text-slate-800">หมายเหตุ:</strong> โทรแจ้งล่วงหน้า 15 นาที</div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>ข้อมูลคัดกรองครบถ้วน พร้อมนำเสนอสินค้าและสื่อในโมดูล 03 (Product Presentation)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectCustomer(customers[0])}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveQualification}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    บันทึกข้อมูล
                  </button>
                  <button
                    onClick={onNavigateToModule03}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>ส่งต่อไปโมดูล 03 เสนอสินค้าและราคา</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUYING DNA & SALES OPPORTUNITY (Strictly Slide 10) */}
          {activeTab === 'buying_dna' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Header Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      CUSTOMER INSIGHT | Buying DNA • Opportunity Board (ฟังก์ชันเพิ่มเติม)
                    </h3>
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      วิเคราะห์ 5 ปัจจัยซื้อ ปรับแต่งโดยผู้จัดการ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    เข้าใจพฤติกรรมและความต้องการของลูกค้า เพื่อให้ AI แนะนำสินค้าและโอกาสขายที่เหมาะสม (Slide 10)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-lg flex items-center gap-1">
                    <Bot size={13} className="text-purple-600" />
                    <span>AI Lead Score: {customer.qualification?.aiScore || 'A (92%)'}</span>
                  </span>
                </div>
              </div>

              {/* 1. 5 Buying Factors (5 ปัจจัยซื้อจาก Slide 10) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span>1. ข้อมูลลูกค้าและ 5 ปัจจัยซื้อ (Customer Insight & 5 Buying DNA Factors)</span>
                  <span className="text-[11px] text-slate-400">ร้าน: {customer.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {Object.entries(buyingDNA.factors).map(([key, f]) => (
                    <div
                      key={key}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{f.name.split(' ')[0]}</span>
                        <span
                          className="text-xs font-bold px-1.5 py-0.2 rounded"
                          style={{ backgroundColor: `${f.color}15`, color: f.color }}
                        >
                          {f.score}
                        </span>
                      </div>

                      {/* Score Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${f.score}%`, backgroundColor: f.color }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-700 font-semibold leading-tight pt-1">
                        {f.highlight}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {f.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2 & 3: AI Product Recommendations & AI Customer Fit Search */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 2. AI แนะนำสินค้าให้ลูกค้า (AI Sales Advisor) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Bot size={15} className="text-blue-600" />
                        <span>2. AI แนะนำสินค้าให้ลูกค้า (AI Sales Advisor)</span>
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold">อ้างอิง Buying DNA</span>
                    </div>

                    <div className="space-y-2 mt-3">
                      {buyingDNA.recommendedProducts.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3 hover:border-blue-300 transition-all"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{p.skuName}</span>
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                                {p.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{p.reason}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                              ความมั่นใจ: {p.confidence}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>*วิเคราะห์จาก Buying DNA, ปริมาณการใช้ และประวัติการซื้อซ้ำ</span>
                    <button
                      onClick={onNavigateToModule03}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>ไปยังโมดูล 03 นำเสนอสื่อ</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* 3. AI ค้นหาลูกค้าที่เหมาะสม (ถาม AI ว่า "สินค้า X ควรเสนอใคร?") */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Search size={15} className="text-purple-600" />
                        <span>3. AI ค้นหาลูกค้าที่เหมาะสม (Reverse Fit)</span>
                      </span>
                      <span className="text-[10px] text-purple-600 font-semibold">ถาม AI ว่าสินค้า X ควรเสนอใคร</span>
                    </div>

                    {/* Query Selector */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">เลือกสินค้าที่ต้องการดัน:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedSkuQuery('เศษสามชั้น')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                            selectedSkuQuery === 'เศษสามชั้น'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          เศษสามชั้น
                        </button>
                        <button
                          onClick={() => setSelectedSkuQuery('ซี่โครงหมู')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                            selectedSkuQuery === 'ซี่โครงหมู'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          ซี่โครงหมู
                        </button>
                      </div>
                    </div>

                    {/* Ranked Customers List */}
                    <div className="space-y-2 mt-3 max-h-[220px] overflow-y-auto">
                      {MOCK_PRODUCT_FIT_SEARCH[selectedSkuQuery]?.matches.map((m) => (
                        <div
                          key={m.customerId}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-purple-300 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{m.customerName}</span>
                              <span className="text-[10px] text-slate-400">({m.category})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[280px]">
                              {m.fitReason}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                              AI: {m.aiScore}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                    ระบบเรียงลำดับตามคะแนนความเหมาะสม (AI Score) จากประวัติการสั่งและเส้นทาง
                  </div>
                </div>
              </div>

              {/* 4. Opportunity Board (Slide 10 Pillar 4) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={15} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      4. Opportunity Board (จัดกลุ่มโอกาสการขาย)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <button
                      onClick={() => setOppFilter('all')}
                      className={`px-2.5 py-0.5 rounded ${
                        oppFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      onClick={() => setOppFilter('ready')}
                      className={`px-2.5 py-0.5 rounded ${
                        oppFilter === 'ready' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      พร้อมเสนอ (12)
                    </button>
                    <button
                      onClick={() => setOppFilter('review')}
                      className={`px-2.5 py-0.5 rounded ${
                        oppFilter === 'review' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      ต้องตรวจสอบ (5)
                    </button>
                    <button
                      onClick={() => setOppFilter('unfit')}
                      className={`px-2.5 py-0.5 rounded ${
                        oppFilter === 'unfit' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      ไม่เหมาะสม (3)
                    </button>
                  </div>
                </div>

                {/* 3 Column Kanban style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Column 1: พร้อมเสนอ */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-100 pb-1.5">
                      <span>🟢 พร้อมเสนอ (Ready)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        {opportunityLeads.filter((l) => l.group === 'ready').length} ราย
                      </span>
                    </div>

                    <div className="space-y-2">
                      {opportunityLeads
                        .filter((l) => l.group === 'ready')
                        .map((l) => (
                          <div
                            key={l.id}
                            className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{l.customerName}</span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                                AI: {l.aiScore}%
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              แนะนำ: <strong className="text-slate-800">{l.recommendedSku}</strong>
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">
                              {l.leadReason}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Column 2: ต้องตรวจสอบ */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-100 pb-1.5">
                      <span>🟡 ต้องตรวจสอบ (Review)</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                        {opportunityLeads.filter((l) => l.group === 'review').length} ราย
                      </span>
                    </div>

                    <div className="space-y-2">
                      {opportunityLeads
                        .filter((l) => l.group === 'review')
                        .map((l) => (
                          <div
                            key={l.id}
                            className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{l.customerName}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                                AI: {l.aiScore}%
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              แนะนำ: <strong className="text-slate-800">{l.recommendedSku}</strong>
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">
                              {l.leadReason}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Column 3: ไม่เหมาะสม */}
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900 border-b border-rose-100 pb-1.5">
                      <span>🔴 ไม่เหมาะสม (Unfit)</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                        {opportunityLeads.filter((l) => l.group === 'unfit').length} ราย
                      </span>
                    </div>

                    <div className="space-y-2">
                      {opportunityLeads
                        .filter((l) => l.group === 'unfit')
                        .map((l) => (
                          <div
                            key={l.id}
                            className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{l.customerName}</span>
                              <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-mono">
                                AI: {l.aiScore}%
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              แนะนำ: <strong className="text-slate-800">{l.recommendedSku}</strong>
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">
                              {l.leadReason}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. ส่งต่อให้ฝ่ายขายผ่าน LINE (Slide 10 Pillar 5) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Send size={15} className="text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      5. ส่งต่อข้อความแนะนำให้ฝ่ายขาย (Handoff to Sales via LINE)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    AI สร้างข้อความแนะนำส่งต่อฝ่ายขายผ่าน LINE ติดตามสถานะ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 block">
                      ข้อความแนะนำที่ AI ร่างสำหรับฝ่ายขาย (ปรับแก้ได้)
                    </label>
                    <textarea
                      rows={4}
                      value={salesPitchMessage}
                      onChange={(e) => setSalesPitchMessage(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block mb-1">ผู้รับผิดชอบงาน</span>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <div>ฝ่ายขาย: <strong className="text-slate-800">คุณสมชาย (สาย R1)</strong></div>
                        <div>ช่องทาง: <strong className="text-emerald-700">กลุ่ม LINE ทีมขาย A&C</strong></div>
                      </div>
                    </div>

                    <button
                      onClick={handleSendSalesHandoff}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                    >
                      <Send size={13} />
                      <span>{handoffSent ? 'ส่งเข้า LINE สำเร็จแล้ว ✅' : 'ส่งต่อให้ฝ่ายขายผ่าน LINE'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
