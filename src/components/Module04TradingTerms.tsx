import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  ExternalLink,
  Check,
  X,
  Phone,
  ArrowRight,
  Bot,
  Copy,
  Send,
  Building,
  User,
  ShieldCheck,
  Layers,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import type {
  Customer,
  CompanyCode,
  CVDocument,
  CVRegistrationRecord,
} from '../types';
import {
  MODULE_04_STATS,
  EXISTING_CV_DATABASE,
  type ExistingCVLookupRecord,
} from '../mockData';

interface Module04TradingTermsProps {
  customer: Customer;
  customers: Customer[];
  onSelectCustomer: (cust: Customer) => void;
  onUpdateCV: (customerId: string, updatedRecord: Partial<CVRegistrationRecord>) => void;
  onNavigateToModule: (moduleId: string) => void;
}

export const Module04TradingTerms: React.FC<Module04TradingTermsProps> = ({
  customer,
  customers,
  onSelectCustomer,
  onUpdateCV,
  onNavigateToModule,
}) => {
  // Mode switcher: View 1 (Trading Terms Workspace) vs View 2 (CV Registration & LINE Summary)
  const [activeView, setActiveView] = useState<'terms' | 'registration'>('terms');

  // Subtabs in View 1 Center Panel
  const [activeSubtab, setActiveSubtab] = useState<'summary' | 'terms' | 'cv' | 'chat' | 'docs'>('terms');

  // Customer filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'ai' | 'sales' | 'pending'>('all');

  // Selected company for registration (A&C vs TD)
  const [companySelection, setCompanySelection] = useState<CompanyCode>(
    customer.cvRegistration?.company || 'AC'
  );

  // Modals
  const [docPreviewModal, setDocPreviewModal] = useState<{
    isOpen: boolean;
    doc?: CVDocument;
  }>({ isOpen: false });

  const [mapPreviewModal, setMapPreviewModal] = useState(false);

  const [staffCvModal, setStaffCvModal] = useState<{
    isOpen: boolean;
    cvCode: string;
    notes: string;
  }>({
    isOpen: false,
    cvCode: `CV-${customer.cvRegistration?.company || 'AC'}-2026-081`,
    notes: 'เปิด CV สำเร็จในโปรแกรมขายเรียบร้อยแล้ว',
  });

  const [needInfoModal, setNeedInfoModal] = useState<{
    isOpen: boolean;
    missingItems: string[];
    customNote: string;
  }>({
    isOpen: false,
    missingItems: [],
    customNote: '',
  });

  const [lineSentModal, setLineSentModal] = useState<{
    isOpen: boolean;
    company: CompanyCode;
    message: string;
  }>({
    isOpen: false,
    company: 'AC',
    message: '',
  });

  const [copiedToast, setCopiedToast] = useState(false);

  // Existing CV Search (in View 2)
  const [lookupPhone, setLookupPhone] = useState(customer.phone);
  const [lookupResult, setLookupResult] = useState<ExistingCVLookupRecord | null>(null);
  const [hasSearchedLookup, setHasSearchedLookup] = useState(false);

  // Synchronize company selection when customer changes
  React.useEffect(() => {
    if (customer.cvRegistration?.company) {
      setCompanySelection(customer.cvRegistration.company);
    }
    setLookupPhone(customer.phone);
    setLookupResult(null);
    setHasSearchedLookup(false);
  }, [customer]);

  // Filter customers for Left Panel
  const filteredCustomers = customers.filter((c) => {
    if (customerFilter === 'ai' && c.status !== 'ai') return false;
    if (customerFilter === 'sales' && c.status !== 'sales') return false;
    if (customerFilter === 'pending' && c.cvRegistration?.status !== 'pending_sales') return false;

    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q)
    );
  });

  // Handle switching company
  const handleSwitchCompany = (comp: CompanyCode) => {
    setCompanySelection(comp);
    onUpdateCV(customer.id, {
      company: comp,
    });
    setStaffCvModal((prev) => ({
      ...prev,
      cvCode: `CV-${comp}-2026-081`,
    }));
  };

  // Perform existing CV lookup
  const handlePerformLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSearchedLookup(true);
    const cleanPhone = lookupPhone.trim();
    const found = EXISTING_CV_DATABASE.find(
      (rec) => rec.phone === cleanPhone || rec.customerName.includes(customer.name)
    );
    setLookupResult(found || null);
  };

  // Handle Approve CV by Sales
  const handleApproveCv = () => {
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const updatedTimeline = [
      {
        id: `tl-${Date.now()}`,
        time: nowStr,
        action: 'ฝ่ายขายตรวจสอบและอนุมัติคำขอเปิด CV',
        status: 'success' as const,
        operator: 'คุณแอน (ฝ่ายขาย)',
      },
      ...(customer.cvRegistration?.timeline || []),
    ];

    onUpdateCV(customer.id, {
      status: 'processing',
      statusLabel: 'กำลังดำเนินการ',
      timeline: updatedTimeline,
    });
    alert('✅ ฝ่ายขายอนุมัติคำขอเปิด CV เรียบร้อยแล้ว (สถานะเปลี่ยนเป็น: กำลังดำเนินการ)');
  };

  // Handle Reject CV
  const handleRejectCv = () => {
    const reason = prompt('กรุณาระบุเหตุผลการไม่อนุมัติ:');
    if (reason === null) return;

    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const updatedTimeline = [
      {
        id: `tl-${Date.now()}`,
        time: nowStr,
        action: `ไม่อนุมัติคำขอ: ${reason || 'ข้อมูลไม่ผ่านเกณฑ์'}`,
        status: 'rejected' as const,
        operator: 'คุณแอน (ฝ่ายขาย)',
      },
      ...(customer.cvRegistration?.timeline || []),
    ];

    onUpdateCV(customer.id, {
      status: 'rejected',
      statusLabel: 'ไม่อนุมัติ',
      timeline: updatedTimeline,
      staffNotes: reason,
    });
    alert('❌ บันทึกสถานะ "ไม่อนุมัติ" เรียบร้อยแล้ว');
  };

  // Handle Submit Need Info
  const handleSubmitNeedInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const itemsText = needInfoModal.missingItems.join(', ');
    const noteText = needInfoModal.customNote ? ` (${needInfoModal.customNote})` : '';

    const updatedTimeline = [
      {
        id: `tl-${Date.now()}`,
        time: nowStr,
        action: `ขอข้อมูลเพิ่มเติม: ${itemsText}${noteText}`,
        status: 'warning' as const,
        operator: 'AI Bot แจ้งเตือนลูกค้า',
      },
      ...(customer.cvRegistration?.timeline || []),
    ];

    onUpdateCV(customer.id, {
      status: 'need_info',
      statusLabel: 'ขอข้อมูลเพิ่ม',
      missingFields: needInfoModal.missingItems,
      timeline: updatedTimeline,
    });

    setNeedInfoModal({ isOpen: false, missingItems: [], customNote: '' });
    alert('⚠️ ส่งแจ้งเตือนขอข้อมูลเพิ่มเติมไปยังลูกค้าผ่าน LINE OA เรียบร้อยแล้ว');
  };

  // Handle Save Staff CV Code
  const handleSaveStaffCvCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffCvModal.cvCode.trim()) {
      alert('กรุณาระบุรหัส CV');
      return;
    }

    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const updatedTimeline = [
      {
        id: `tl-${Date.now()}`,
        time: nowStr,
        action: `เจ้าหน้าที่บันทึกรหัส CV: ${staffCvModal.cvCode} (บริษัท ${companySelection})`,
        status: 'success' as const,
        operator: 'เจ้าหน้าที่เปิด CV (โปรแกรมเดิม)',
      },
      ...(customer.cvRegistration?.timeline || []),
    ];

    onUpdateCV(customer.id, {
      cvCode: staffCvModal.cvCode.trim(),
      status: 'completed',
      statusLabel: 'เปิด CV แล้ว',
      timeline: updatedTimeline,
      staffNotes: staffCvModal.notes,
    });

    setStaffCvModal((prev) => ({ ...prev, isOpen: false }));
    alert(`🎉 บันทึกรหัส CV: ${staffCvModal.cvCode.trim()} สำเร็จ! สถานะเปลี่ยนเป็น "เปิด CV แล้ว"`);
  };

  // Prepare formatted LINE Summary text
  const generateLineSummaryText = (comp: CompanyCode) => {
    const contactName = customer.cvRegistration?.contactPerson || customer.contactPerson;
    const phone = customer.cvRegistration?.phone || customer.phone;
    const address = customer.cvRegistration?.address || customer.address;
    const mapUrl = customer.cvRegistration?.googleMapsUrl || 'https://maps.app.goo.gl/Jei1Z9vVmERR4Sx6';

    return `เปิด CV-ใหม่ ${comp === 'AC' ? 'A&C' : 'TD'}\n${customer.name}\n${address}\n${mapUrl}\nเบอร์ติดต่อ ${phone} (${contactName})\n\nเอกสารแนบ: รูปบัตรประชาชน / หนังสือรับรองบริษัท\n(ตามที่ลูกค้าส่ง)`;
  };

  // Handle Send to LINE Group simulation
  const handleSendToLineGroup = () => {
    const text = generateLineSummaryText(companySelection);
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const updatedTimeline = [
      {
        id: `tl-${Date.now()}`,
        time: nowStr,
        action: `ส่งข้อมูลเข้ากลุ่ม LINE "เปิด CV-ใหม่ ${companySelection === 'AC' ? 'A&C' : 'TD'}"`,
        status: 'success' as const,
        operator: 'Sales AI Dispatcher',
      },
      ...(customer.cvRegistration?.timeline || []),
    ];

    onUpdateCV(customer.id, {
      status: 'processing',
      statusLabel: 'กำลังดำเนินการ',
      timeline: updatedTimeline,
    });

    setLineSentModal({
      isOpen: true,
      company: companySelection,
      message: text,
    });
  };

  // Copy LINE summary text
  const handleCopyLineSummary = () => {
    const text = generateLineSummaryText(companySelection);
    navigator.clipboard?.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const currentCvRecord = customer.cvRegistration;
  const isCvCompleted = currentCvRecord?.status === 'completed' || Boolean(currentCvRecord?.cvCode);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden min-h-0 select-none">
      {/* Top Banner: Module 04 Stats & View Switcher */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Key Metrics Chips */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] min-w-0 py-0.5">
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">ลูกค้าทั้งหมด:</span>
              <span className="font-bold text-slate-800">{MODULE_04_STATS.totalCustomers}</span>
              <span className="text-emerald-600 font-semibold text-[10px]">
                {MODULE_04_STATS.totalCustomersDiff}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 text-emerald-800 font-semibold flex items-center gap-1">
              <Bot size={13} className="text-emerald-600" />
              <span className="text-emerald-700 font-medium">AI ดำเนินการแล้ว:</span>
              <span>{MODULE_04_STATS.aiProcessedCount} ({MODULE_04_STATS.aiProcessedPercent})</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0 text-amber-800 font-semibold flex items-center gap-1">
              <Clock size={13} className="text-amber-600" />
              <span className="text-amber-700 font-medium">รอการตรวจสอบ:</span>
              <span>{MODULE_04_STATS.pendingReviewCount} ({MODULE_04_STATS.pendingReviewPercent})</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg shrink-0 text-rose-800 font-semibold flex items-center gap-1">
              <AlertCircle size={13} className="text-rose-600" />
              <span className="text-rose-700 font-medium">รอข้อมูลเพิ่มเติม:</span>
              <span>{MODULE_04_STATS.needInfoCount} ({MODULE_04_STATS.needInfoPercent})</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 text-blue-800 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} className="text-blue-600" />
              <span className="text-blue-700 font-medium">เปิด CV สำเร็จ:</span>
              <span>{MODULE_04_STATS.cvCompletedCount} ({MODULE_04_STATS.cvCompletedPercent})</span>
            </div>

            <div className="bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg shrink-0 text-purple-800 font-semibold flex items-center gap-1">
              <ArrowRight size={13} className="text-purple-600" />
              <span className="text-purple-700 font-medium">ส่งต่อโมดูล 05:</span>
              <span>{MODULE_04_STATS.forwardedTo05Count} ({MODULE_04_STATS.forwardedTo05Percent})</span>
            </div>
          </div>

          {/* View Switcher: Slide 18 Image 1 vs Image 2 */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 border border-slate-200">
            <button
              onClick={() => setActiveView('terms')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'terms'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck size={14} />
              <span>1. เงื่อนไขการค้าและบริการ</span>
            </button>

            <button
              onClick={() => setActiveView('registration')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'registration'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building size={14} />
              <span>2. เปิด CV และส่งกลุ่ม LINE (A&C / TD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Stepper (Slide 18) */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-semibold min-w-max">
          {activeView === 'terms' ? (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">01</span>
                <span>รับข้อมูลจากโมดูล 03</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">02</span>
                <span>ตรวจสอบลูกค้าเดิม และเงื่อนไขการค้า</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">03</span>
                <span>แจ้งเงื่อนไขการให้บริการ และขอข้อมูลเปิด CV</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-xs">
                <span className="w-4 h-4 rounded-full bg-white text-amber-700 text-[10px] flex items-center justify-center font-bold">04</span>
                <span>ตรวจสอบและอนุมัติ เอกสารเปิด CV</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">05</span>
                <span>ส่งต่อข้อมูลไป โมดูล 05 ยืนยันคำสั่งซื้อ</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white">
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] flex items-center justify-center font-bold">1</span>
                <span>ตรวจสอบลูกค้าเดิม (มี CV หรือยัง)</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white">
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] flex items-center justify-center font-bold">2</span>
                <span>แจ้งเงื่อนไขการค้า (จัดส่งฟรี/เก็บเงินปลายทาง)</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white">
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] flex items-center justify-center font-bold">3</span>
                <span>รวบรวมข้อมูลและเอกสาร</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-xs">
                <span className="w-4 h-4 rounded-full bg-white text-amber-700 text-[10px] flex items-center justify-center font-bold">4</span>
                <span>สรุปข้อมูลส่งเข้ากลุ่มทีมขาย</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">5</span>
                <span>ทีมขายเปิด CV และบันทึกผล</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">6</span>
                <span>พร้อมใช้งานในโมดูล 05</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Customer List (w-72 or w-80)                */}
        {/* ========================================================= */}
        <div className="w-76 xl:w-80 h-full border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                {activeView === 'terms' ? 'รายชื่อลูกค้า (86)' : 'รายการลูกค้าที่อยู่ระหว่างเปิด CV'}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">
                {filteredCustomers.length} รายการ
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold text-center mb-2">
              <button
                onClick={() => setCustomerFilter('all')}
                className={`py-1 rounded ${
                  customerFilter === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setCustomerFilter('ai')}
                className={`py-1 rounded ${
                  customerFilter === 'ai' ? 'bg-white font-bold text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                AI ดูแล
              </button>
              <button
                onClick={() => setCustomerFilter('sales')}
                className={`py-1 rounded ${
                  customerFilter === 'sales' ? 'bg-white font-bold text-amber-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                รออนุมัติ
              </button>
              <button
                onClick={() => setCustomerFilter('pending')}
                className={`py-1 rounded ${
                  customerFilter === 'pending' ? 'bg-white font-bold text-rose-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                รอข้อมูล
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, จังหวัด..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Customer List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredCustomers.map((c) => {
              const isSelected = c.id === customer.id;
              const company = c.cvRegistration?.company || 'AC';
              const status = c.cvRegistration?.status || 'pending_sales';

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCustomer(c)}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs truncate ${isSelected ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'}`}>
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {c.lastMessageTime}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mb-1.5">
                    {c.category} • จ.{c.province}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    {/* Company Tag */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        company === 'AC'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {company === 'AC' ? 'A&C' : 'TD'}
                    </span>

                    {/* Status badge */}
                    {status === 'completed' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        เปิด CV แล้ว
                      </span>
                    )}
                    {status === 'pending_sales' && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        รอตรวจสอบ
                      </span>
                    )}
                    {status === 'processing' && (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        กำลังดำเนินการ
                      </span>
                    )}
                    {status === 'need_info' && (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        ขอข้อมูลเพิ่ม
                      </span>
                    )}
                    {status === 'rejected' && (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        ไม่อนุมัติ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: TRADING TERMS WORKSPACE (Slide 18 Image 1)        */}
        {/* ========================================================= */}
        {activeView === 'terms' && (
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Center: Trading Terms & Services */}
            <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto border-r border-slate-200 min-w-0">
              {/* Customer Header & Subtabs */}
              <div className="bg-white p-4 border-b border-slate-200 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-2xs"
                      style={{ backgroundColor: customer.avatarColor }}
                    >
                      {customer.name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">{customer.name}</h2>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ลูกค้าประจำ
                        </span>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          {customer.routeCode} - {customer.province} (ในพื้นที่)
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {customer.category} | เบอร์โทร {customer.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="ค้นหา">
                      <Search size={15} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="โทร">
                      <Phone size={15} />
                    </button>
                  </div>
                </div>

                {/* Subtabs matching Slide 18 Image 1 */}
                <div className="flex items-center gap-1 border-b border-slate-200 -mb-4 pt-1 text-xs">
                  <button
                    onClick={() => setActiveSubtab('summary')}
                    className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
                      activeSubtab === 'summary'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    สรุปข้อมูล
                  </button>
                  <button
                    onClick={() => setActiveSubtab('terms')}
                    className={`pb-2.5 px-3 font-bold transition-all border-b-2 ${
                      activeSubtab === 'terms'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    เงื่อนไขการค้า
                  </button>
                  <button
                    onClick={() => setActiveSubtab('cv')}
                    className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
                      activeSubtab === 'cv'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    เปิดรหัสลูกค้า (CV)
                  </button>
                  <button
                    onClick={() => setActiveSubtab('chat')}
                    className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
                      activeSubtab === 'chat'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ประวัติการสนทนา
                  </button>
                  <button
                    onClick={() => setActiveSubtab('docs')}
                    className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
                      activeSubtab === 'docs'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ไฟล์เอกสาร
                  </button>
                </div>
              </div>

              {/* Workspace Content */}
              <div className="p-4 space-y-4">
                {/* 1. เงื่อนไขการให้บริการของบริษัท (4 Cards) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        1
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">
                        เงื่อนไขการให้บริการของ {companySelection === 'AC' ? 'A&C Foods Supply' : 'TD Foods Supply'}
                      </h3>
                    </div>
                    <button
                      onClick={() => alert('แก้ไขเงื่อนไขการให้บริการ')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      ✏️ แก้ไข
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Card 1: จัดส่งฟรี */}
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-2xs">
                        <Truck size={15} />
                      </div>
                      <div className="text-xs font-bold text-slate-900">จัดส่งฟรี</div>
                      <div className="text-[11px] text-slate-600 leading-tight">
                        ตามพื้นที่และเงื่อนไขของบริษัทฯ
                      </div>
                    </div>

                    {/* Card 2: เก็บเงินปลายทาง */}
                    <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-1.5 shadow-2xs">
                        <ShieldCheck size={15} />
                      </div>
                      <div className="text-xs font-bold text-slate-900">เก็บเงินปลายทาง</div>
                      <div className="text-[11px] text-slate-600 leading-tight">
                        ลูกค้าตรวจสอบสินค้าก่อนชำระเงิน
                      </div>
                    </div>

                    {/* Card 3: สินค้าขายขาด */}
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-1.5 shadow-2xs">
                        <Layers size={15} />
                      </div>
                      <div className="text-xs font-bold text-slate-900">สินค้าขายขาด</div>
                      <div className="text-[11px] text-slate-600 leading-tight">
                        เมื่อชำระเงินแล้ว ไม่รับคืนภายหลัง
                      </div>
                    </div>

                    {/* Card 4: การสมัครสมาชิก */}
                    <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center mb-1.5 shadow-2xs">
                        <FileText size={15} />
                      </div>
                      <div className="text-xs font-bold text-slate-900">การสมัครสมาชิก</div>
                      <div className="text-[11px] text-slate-600 leading-tight">
                        บัตรประชาชน หรือหนังสือรับรองบริษัท
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. รายละเอียดเงื่อนไขการค้าของลูกค้า (Checklist Table) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">
                      รายละเอียดเงื่อนไขการค้าของลูกค้า
                    </h3>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <div className="divide-y divide-slate-100">
                      <div className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <span className="text-slate-500 font-medium">พื้นที่จัดส่ง</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {customer.cvRegistration?.tradingTerms.deliveryZoneText || `${customer.province} (ในพื้นที่) จัดส่งฟรี`}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                            <Check size={12} className="text-emerald-600" />
                            อยู่ในพื้นที่บริการ
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <span className="text-slate-500 font-medium">ขั้นต่ำการสั่งซื้อ (MOQ)</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {customer.cvRegistration?.tradingTerms.moq || '100 กก. / รายการ (ตัวอย่าง)'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                            <Check size={12} className="text-emerald-600" />
                            เป็นไปตามเงื่อนไข
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <span className="text-slate-500 font-medium">การชำระเงิน</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {customer.cvRegistration?.tradingTerms.paymentMethod || 'เก็บเงินปลายทาง'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                            <Check size={12} className="text-emerald-600" />
                            มาตรฐานของบริษัทฯ
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <span className="text-slate-500 font-medium">รอบจัดส่ง</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            สัปดาห์ละ 3 ครั้ง ({customer.routeDays})
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                            <Check size={12} className="text-emerald-600" />
                            ตาม Route
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <span className="text-slate-500 font-medium">ระยะเวลาการจัดส่ง</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {customer.cvRegistration?.tradingTerms.deliveryLeadTime || '1-2 วัน'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                            <Check size={12} className="text-emerald-600" />
                            ปกติ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    * เงื่อนไขอาจแตกต่างตามสินค้า และพื้นที่จัดส่ง โปรดตรวจสอบอีกครั้งก่อนยืนยันคำสั่งซื้อ
                  </p>
                </div>

                {/* 3. สินค้าที่จะสั่งซื้อ (จากโมดูล 03) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">
                      สินค้าที่จะสั่งซื้อ (จากโมดูล 03)
                    </h3>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <img
                      src={customer.interestedProducts[0]?.imageUrl || '/assets/pork_belly.jpg'}
                      alt="Product"
                      className="w-24 h-24 rounded-lg object-cover border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-xs font-bold text-slate-900">
                          {customer.interestedProducts[0]?.name || 'เศษสามชั้น (สำหรับทำหมูกรอบ)'}
                        </h4>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          หมูกรอบ
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          สินค้าใช้ประจำ
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                          ยอดนิยม
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mb-2">
                        เศษสามชั้นคุณภาพดี เหมาะสำหรับทำหมูกรอบ ไขมันและเนื้อสมดุล ตัดแต่งสะอาด
                      </p>

                      {/* Tiered price table */}
                      <div className="text-[11px] border border-slate-200 rounded overflow-hidden max-w-sm">
                        <div className="bg-slate-200/60 px-2.5 py-1 font-semibold text-slate-700 flex justify-between">
                          <span>จำนวนสั่งซื้อ</span>
                          <span>ราคาขาย (บาท/กก.)</span>
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                          <div className="px-2.5 py-0.5 flex justify-between">
                            <span className="text-slate-600">1 - 199 กก.</span>
                            <span className="font-semibold text-slate-800">92</span>
                          </div>
                          <div className="px-2.5 py-0.5 flex justify-between">
                            <span className="text-slate-600">200 - 499 กก.</span>
                            <span className="font-semibold text-slate-800">88</span>
                          </div>
                          <div className="px-2.5 py-0.5 flex justify-between bg-emerald-50 text-emerald-800 font-bold">
                            <span>500 กก. ขึ้นไป</span>
                            <span>85</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer Bar */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 mt-auto shrink-0 flex items-center justify-between gap-2 shadow-sm">
                <span className="text-xs font-bold text-slate-700">การดำเนินการ:</span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleApproveCv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <Check size={14} />
                    <span>อนุมัติคำขอเปิด CV</span>
                  </button>

                  <button
                    onClick={() =>
                      setNeedInfoModal({
                        isOpen: true,
                        missingItems: ['สำเนาบัตรประชาชนไม่ชัดเจน'],
                        customNote: 'รบกวนส่งรูปบัตรประชาชนใหม่อีกครั้งค่ะ',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <AlertTriangle size={14} />
                    <span>ขอข้อมูลเพิ่มเติม</span>
                  </button>

                  <button
                    onClick={handleRejectCv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <X size={14} />
                    <span>ไม่อนุมัติ</span>
                  </button>

                  <button
                    onClick={() => onNavigateToModule('05')}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <span>ส่งต่อโมดูล 05</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Registration & Documents Panel (Slide 18 Image 1) */}
            <div className="w-80 xl:w-88 h-full bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 p-3.5 space-y-3.5">
              {/* Header & Status */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    เปิดรหัสลูกค้า (Customer Registration / CV)
                  </h3>
                  <button
                    onClick={() => alert('ประวัติการเปิด CV')}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    ดูประวัติ
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">สถานะการเปิด CV:</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isCvCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isCvCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {customer.cvRegistration?.statusLabel || 'รอตรวจสอบ'}
                  </span>
                </div>
              </div>

              {/* Checklist Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs divide-y divide-slate-100 bg-slate-50/50">
                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>ตรวจสอบลูกค้าเดิม</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ไม่พบรหัสเดิม
                  </span>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>ข้อมูลลูกค้า</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ครบถ้วน
                  </span>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={14} className="text-amber-500 shrink-0" />
                    <span>เอกสารสมัครสมาชิก</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      รอตรวจสอบ
                    </span>
                    <button
                      onClick={() =>
                        setDocPreviewModal({
                          isOpen: true,
                          doc: customer.cvRegistration?.documents[0],
                        })
                      }
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      ดูไฟล์
                    </button>
                  </div>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>โลเคชันสถานที่จัดส่ง</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      ได้รับแล้ว
                    </span>
                    <button
                      onClick={() => setMapPreviewModal(true)}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      ดูแผนที่
                    </button>
                  </div>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>เบอร์ติดต่อ</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ได้รับแล้ว
                  </span>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <AlertCircle size={14} className="text-slate-400 shrink-0" />
                    <span>รหัสลูกค้า (CV)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        currentCvRecord?.cvCode
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {currentCvRecord?.cvCode || 'ยังไม่ออก'}
                    </span>
                    <button
                      onClick={() => setStaffCvModal((prev) => ({ ...prev, isOpen: true }))}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      บันทึกรหัส CV
                    </button>
                  </div>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <span className="text-slate-500">วิธีดำเนินการ</span>
                  <span className="text-[10px] font-semibold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    Manual (เฟส 1)
                  </span>
                </div>
              </div>

              {/* Notice Banner: Future Phase 2 */}
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 leading-snug">
                <div className="font-bold flex items-center gap-1 mb-0.5">
                  <span>⚡ เชื่อมต่อโปรแกรมขาย (อนาคต - เฟส 2)</span>
                  <span className="text-[9px] font-normal text-blue-600 bg-blue-100/70 px-1.5 py-0.2 rounded">
                    ยังไม่เปิดใช้งาน
                  </span>
                </div>
                <div className="text-[10px] text-slate-600">
                  เตรียมจุดเชื่อมต่อ API สำหรับส่งข้อมูลเปิด CV และรับรหัสจากโปรแกรมขายในอนาคต โดยยังไม่พัฒนาในเฟสนี้
                </div>
              </div>

              {/* Document Thumbnails Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    เอกสารประกอบการสมัครสมาชิก
                  </span>
                  <button
                    onClick={() => alert('เพิ่มเอกสาร')}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    + เพิ่มเอกสาร
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {/* Doc 1: บัตรประชาชน */}
                  <div
                    onClick={() =>
                      setDocPreviewModal({
                        isOpen: true,
                        doc: customer.cvRegistration?.documents[0],
                      })
                    }
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg cursor-pointer transition-all space-y-1"
                  >
                    <div className="h-10 bg-blue-100/80 rounded flex items-center justify-center text-blue-700 font-bold">
                      <User size={18} />
                    </div>
                    <div className="font-semibold text-slate-800 truncate">บัตรประชาชน</div>
                    <span className="text-[9px] text-emerald-700 font-medium block">ได้รับแล้ว</span>
                  </div>

                  {/* Doc 2: หนังสือรับรองบริษัท */}
                  <div
                    onClick={() =>
                      setDocPreviewModal({
                        isOpen: true,
                        doc: customer.cvRegistration?.documents[1],
                      })
                    }
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg cursor-pointer transition-all space-y-1"
                  >
                    <div className="h-10 bg-amber-100/80 rounded flex items-center justify-center text-amber-700 font-bold">
                      <Building size={18} />
                    </div>
                    <div className="font-semibold text-slate-800 truncate">หนังสือรับรอง</div>
                    <span className="text-[9px] text-amber-700 font-medium block">รอตรวจสอบ</span>
                  </div>

                  {/* Doc 3: โลเคชันจัดส่ง */}
                  <div
                    onClick={() => setMapPreviewModal(true)}
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg cursor-pointer transition-all space-y-1"
                  >
                    <div className="h-10 bg-emerald-100/80 rounded flex items-center justify-center text-emerald-700 font-bold">
                      <Truck size={18} />
                    </div>
                    <div className="font-semibold text-slate-800 truncate">โลเคชันจัดส่ง</div>
                    <span className="text-[9px] text-emerald-700 font-medium block">ได้รับแล้ว</span>
                  </div>
                </div>
              </div>

              {/* Timeline (Slide 18 Image 1) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    ประวัติการดำเนินการ
                  </span>
                  <button
                    onClick={() => alert('ดูประวัติทั้งหมด')}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    ดูทั้งหมด
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {(customer.cvRegistration?.timeline || []).slice(0, 5).map((tl) => (
                    <div key={tl.id} className="flex items-start gap-2">
                      <span className="font-mono text-slate-400 text-[10px] w-10 shrink-0 mt-0.5">
                        {tl.time}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 text-[11px] truncate">
                          {tl.action}
                        </div>
                        <div className="text-[9px] text-slate-400">{tl.operator}</div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          tl.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tl.status === 'warning'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tl.status === 'success' ? 'สำเร็จ' : tl.status === 'warning' ? 'รอข้อมูล' : 'ไม่อนุมัติ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="pt-3 border-t border-slate-200 mt-2">
                <button
                  onClick={() => onNavigateToModule('05')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <span>ส่งต่อโมดูล 05 ยืนยันคำสั่งซื้อ + PO ภายใน</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CV REGISTRATION & LINE DISPATCH (Slide 18 Image 2)*/}
        {/* ========================================================= */}
        {activeView === 'registration' && (
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Center: Customer Form & Document Verification */}
            <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto border-r border-slate-200 min-w-0 p-4 space-y-4">
              {/* Customer Card with Company Switcher */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-2xs"
                      style={{ backgroundColor: customer.avatarColor }}
                    >
                      {customer.name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">{customer.name}</h2>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ลูกค้ารายใหม่
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          เปิด CV-ใหม่
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        ประเภทลูกค้า: {customer.category} | รหัสชั่วคราว: {customer.cvRegistration?.tempId || 'CUST-20250110-001'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('แก้ไขข้อมูลลูกค้า')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    ✏️ แก้ไข
                  </button>
                </div>

                {/* Company Switcher Row (A&C vs TD) */}
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      เลือกบริษัทที่เปิด CV (Company Separation):
                    </span>
                    <span className="text-[11px] text-slate-600">
                      แยกฐานข้อมูลลูกค้าและกลุ่ม LINE เปิด CV ชัดเจนตามกฎบริษัท
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSwitchCompany('AC')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        companySelection === 'AC'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Check size={13} className={companySelection === 'AC' ? 'inline' : 'hidden'} />
                      <span>A&C (A&C Foods)</span>
                    </button>

                    <button
                      onClick={() => handleSwitchCompany('TD')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        companySelection === 'TD'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Check size={13} className={companySelection === 'TD' ? 'inline' : 'hidden'} />
                      <span>TD (ไทยเด็ด / TD Foods)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">ผู้ติดต่อหลัก</span>
                    <span className="font-semibold text-slate-800">{customer.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">เบอร์โทรศัพท์</span>
                    <span className="font-semibold text-slate-800 font-mono">{customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">สายจัดส่ง (Route)</span>
                    <span className="font-semibold text-blue-700">{customer.routeCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">รอบรถประจำ</span>
                    <span className="font-semibold text-slate-800">{customer.routeDays}</span>
                  </div>
                </div>
              </div>

              {/* 1. เอกสารเปิด CV */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">เอกสารเปิด CV</h3>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      ✓ ได้รับแล้ว
                    </span>
                  </div>

                  <button
                    onClick={() => alert('เพิ่มไฟล์เอกสาร')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + เพิ่มไฟล์
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Uploaded Card 1 */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold border border-blue-200 shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">บัตรประชาชน ID_CARD.jpg</div>
                        <div className="text-[10px] text-slate-400">ขนาด 1.4 MB • ได้รับเมื่อ 10:31 น.</div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setDocPreviewModal({
                          isOpen: true,
                          doc: customer.cvRegistration?.documents[0],
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700"
                    >
                      ดูรูป
                    </button>
                  </div>

                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-lg p-3 text-center flex flex-col items-center justify-center cursor-pointer bg-slate-50/50">
                    <span className="text-xs font-semibold text-slate-700">+ เพิ่มไฟล์เอกสาร</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      รองรับไฟล์รูปภาพ / PDF (บัตรประชาชน หรือหนังสือรับรองบริษัท)
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. สถานที่จัดส่ง */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">สถานที่จัดส่ง</h3>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      ✓ ได้รับแล้ว
                    </span>
                  </div>

                  <button
                    onClick={() => setMapPreviewModal(true)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    <ExternalLink size={12} />
                    <span>เปิดแผนที่</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800">{customer.name}</div>
                  <div className="text-blue-600 underline text-[11px] break-all">
                    {customer.cvRegistration?.googleMapsUrl || 'https://maps.app.goo.gl/Jei1Z9vVmERR4Sx6'}
                  </div>
                  <div className="text-slate-600 text-[11px]">{customer.address}</div>
                </div>
              </div>

              {/* 3. ข้อมูลเพิ่มเติม */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">ข้อมูลเพิ่มเติม</h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    ✓ ครบถ้วน
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">ชื่อร้าน / กิจการ</label>
                    <input
                      type="text"
                      readOnly
                      value={customer.name}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">ชื่อผู้ติดต่อ</label>
                    <input
                      type="text"
                      readOnly
                      value={customer.contactPerson}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">เบอร์ติดต่อ</label>
                    <input
                      type="text"
                      readOnly
                      value={customer.phone}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">Route (ถ้ามี)</label>
                    <input
                      type="text"
                      readOnly
                      value={`${customer.routeCode} - ${customer.province}`}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-blue-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-slate-500 block mb-1">หมายเหตุขนส่ง</label>
                    <input
                      type="text"
                      readOnly
                      value={customer.cvRegistration?.staffNotes || 'ติดต่อก่อนเข้าพื้นที่ มีที่จอดรถด้านหน้า'}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => alert('บันทึกข้อมูลชั่วคราวเรียบร้อย')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all"
                >
                  บันทึกชั่วคราว
                </button>

                <button
                  onClick={handleCopyLineSummary}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>{copiedToast ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความสรุป'}</span>
                </button>

                <button
                  onClick={handleSendToLineGroup}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>ส่งเข้ากลุ่มทีมขาย (เปิด CV-ใหม่ {companySelection})</span>
                </button>
              </div>
            </div>

            {/* Right: LINE Summary Preview & Progress (Slide 18 Image 2) */}
            <div className="w-80 xl:w-88 h-full bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 p-3.5 space-y-4">
              {/* LINE Message Summary Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    ตัวอย่างข้อความที่จะส่งเข้ากลุ่มทีมขาย
                  </h4>
                  <button
                    onClick={() => alert('แก้ไขข้อความสรุป')}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    ✏️ แก้ไขข้อความ
                  </button>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 space-y-2 font-mono whitespace-pre-wrap leading-relaxed shadow-2xs">
                  {generateLineSummaryText(companySelection)}
                </div>
              </div>

              {/* สถานะการดำเนินการ (Workflow Progress) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    สถานะการดำเนินการ
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    {customer.cvRegistration?.statusLabel || 'รอส่งทีมขาย'}
                  </span>
                </div>

                {/* 4-step Horizontal Indicator */}
                <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-bold">
                  <div className="p-1 rounded bg-emerald-500 text-white">
                    1. รวบรวม
                  </div>
                  <div className="p-1 rounded bg-amber-500 text-white">
                    2. รอส่งทีม
                  </div>
                  <div className={`p-1 rounded ${currentCvRecord?.status === 'processing' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    3. ดำเนินการ
                  </div>
                  <div className={`p-1 rounded ${isCvCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    4. เปิด CV
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  {(customer.cvRegistration?.timeline || []).slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-slate-400 text-[10px]">{t.time}</span>
                        <span className="text-slate-700 truncate">{t.action}</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 shrink-0">
                        {t.status === 'success' ? 'สำเร็จ' : 'รอดำเนินการ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ตรวจสอบ CV เดิม (A&C / TD) Lookup Box */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Building size={14} className="text-blue-600" />
                  <span>ตรวจสอบ CV เดิม (A&C / TD)</span>
                </div>

                <form onSubmit={handlePerformLookup} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยเบอร์โทร..."
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="flex-1 p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0"
                  >
                    ค้นหา
                  </button>
                </form>

                {/* Lookup result display */}
                {hasSearchedLookup && (
                  <div className="p-2.5 rounded-lg text-xs">
                    {lookupResult ? (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800">{lookupResult.customerName}</div>
                        <div className="text-[11px] text-slate-600">
                          บริษัท A&C:{' '}
                          <span className={lookupResult.companyAC ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                            {lookupResult.companyAC || 'ไม่มีรหัสเดิม'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          บริษัท TD:{' '}
                          <span className={lookupResult.companyTD ? 'font-bold text-amber-700' : 'text-slate-400'}>
                            {lookupResult.companyTD || 'ไม่มีรหัสเดิม'}
                          </span>
                        </div>
                        {companySelection === 'AC' && lookupResult.companyAC && (
                          <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[10px] font-bold">
                            ⚠️ ลูกค้ามีรหัส CV ใน A&C แล้ว ({lookupResult.companyAC}) ห้ามเปิดซ้ำ!
                          </div>
                        )}
                        {companySelection === 'TD' && lookupResult.companyTD && (
                          <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[10px] font-bold">
                            ⚠️ ลูกค้ามีรหัส CV ใน TD แล้ว ({lookupResult.companyTD}) ห้ามเปิดซ้ำ!
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>ไม่พบรหัส CV เดิมในระบบ ({companySelection === 'AC' ? 'A&C' : 'TD'}) สามารถเปิดใหม่ได้</span>
                      </div>
                    )}
                  </div>
                )}
                {!hasSearchedLookup && (
                  <div className="text-[10px] text-slate-400">
                    พิมพ์เบอร์โทรและกดค้นหา เพื่อตรวจสอบประวัติ CV เดิมในฐานข้อมูล
                  </div>
                )}
              </div>

              {/* Sticky Action Footer */}
              <div className="pt-2 border-t border-slate-200 mt-auto shrink-0">
                <button
                  onClick={() => onNavigateToModule('05')}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <span>ส่งต่อโมดูล 05 ยืนยันคำสั่งซื้อ + PO ภายใน</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Document Preview Modal (Mockup Demo Only)       */}
      {/* ========================================================= */}
      {docPreviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {docPreviewModal.doc?.title || 'ตัวอย่างเอกสาร'}
                </h3>
              </div>
              <button
                onClick={() => setDocPreviewModal({ isOpen: false })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Illustrative Mockup Document Card with Watermark */}
              <div className="relative border-2 border-slate-200 rounded-xl p-6 bg-linear-to-br from-slate-50 to-blue-50/30 overflow-hidden shadow-inner">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-25deg]">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-wider">
                    DEMO MOCKUP ONLY
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 bg-slate-200 rounded-lg border border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <User size={32} />
                    <span className="text-[9px] mt-1 font-semibold">ภาพถ่ายจำลอง</span>
                  </div>

                  <div className="flex-1 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ชื่อ-นามสกุล</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {customer.contactPerson}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ชื่อร้าน / นิติบุคคล</span>
                      <span className="font-semibold text-slate-800">{customer.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ที่อยู่</span>
                      <span className="text-slate-700">{customer.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
                  <span>สถานะการยืนยัน: ตรวจสอบผ่านเบอร์โทรศัพท์แล้ว</span>
                  <span className="font-mono text-emerald-700 font-bold">VERIFIED</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                🔒 <strong>การควบคุมสิทธิ์:</strong> เอกสารจำลองสำหรับการทดสอบระบบเท่านั้น ห้ามใช้ข้อมูลส่วนบุคคลจริงตามข้อกำหนดความปลอดภัย PDPA
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  alert('อนุมัติเอกสารนี้ผ่านเกณฑ์');
                  setDocPreviewModal({ isOpen: false });
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                ✓ เอกสารถูกต้อง (Approve)
              </button>
              <button
                onClick={() => setDocPreviewModal({ isOpen: false })}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Map Preview Modal                                */}
      {/* ========================================================= */}
      {mapPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  ตำแหน่งจัดส่ง (Google Maps)
                </h3>
              </div>
              <button
                onClick={() => setMapPreviewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="h-56 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                <img
                  src="/assets/route_map.jpg"
                  alt="Delivery Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-bold">
                  {customer.routeCode} - {customer.province}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-900">{customer.name}</div>
                <div className="text-slate-600">{customer.address}</div>
                <div className="text-blue-600 font-mono text-[11px] truncate">
                  {customer.cvRegistration?.googleMapsUrl || 'https://maps.app.goo.gl/Jei1Z9vVmERR4Sx6'}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setMapPreviewModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Staff Record CV Code Modal                       */}
      {/* ========================================================= */}
      {staffCvModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <form
            onSubmit={handleSaveStaffCvCode}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  บันทึกรหัสลูกค้า (CV Code)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStaffCvModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 leading-snug">
                เจ้าหน้าที่เปิด CV ในโปรแกรมขายเดิมเรียบร้อยแล้ว และนำรหัส CV บันทึกกลับเข้าระบบ Sales AI OS
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  บริษัทที่เปิด CV
                </label>
                <input
                  type="text"
                  readOnly
                  value={companySelection === 'AC' ? 'A&C Foods Supply (AC)' : 'TD Foods Supply (TD)'}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  รหัส CV (CV Code) *
                </label>
                <input
                  type="text"
                  required
                  value={staffCvModal.cvCode}
                  onChange={(e) =>
                    setStaffCvModal((prev) => ({ ...prev, cvCode: e.target.value }))
                  }
                  placeholder={`เช่น CV-${companySelection}-2026-081`}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  หมายเหตุเจ้าหน้าที่
                </label>
                <textarea
                  rows={2}
                  value={staffCvModal.notes}
                  onChange={(e) =>
                    setStaffCvModal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStaffCvModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                บันทึกรหัส CV และอัปเดตสถานะ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Request More Info Modal                          */}
      {/* ========================================================= */}
      {needInfoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <form
            onSubmit={handleSubmitNeedInfo}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  ขอข้อมูลเพิ่มเติมจากลูกค้า (ผ่าน LINE OA)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNeedInfoModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  เลือกข้อมูลที่ต้องการขอเพิ่ม:
                </label>
                {[
                  'สำเนาบัตรประชาชนไม่ชัดเจน ขอให้ส่งใหม่',
                  'หนังสือรับรองบริษัทเกิน 6 เดือน',
                  'พิกัด Google Maps ไม่ถูกต้อง ขอปักหมุดหน้าร้าน',
                  'ขอชื่อและเบอร์โทรศัพท์ผู้รับสินค้าหน้าร้าน',
                ].map((item) => {
                  const checked = needInfoModal.missingItems.includes(item);
                  return (
                    <label
                      key={item}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setNeedInfoModal((prev) => ({
                            ...prev,
                            missingItems: checked
                              ? prev.missingItems.filter((i) => i !== item)
                              : [...prev.missingItems, item],
                          }));
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-slate-700">{item}</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ข้อความเพิ่มเติม
                </label>
                <textarea
                  rows={3}
                  value={needInfoModal.customNote}
                  onChange={(e) =>
                    setNeedInfoModal((prev) => ({ ...prev, customNote: e.target.value }))
                  }
                  placeholder="ระบุข้อความที่ต้องการให้ AI แจ้งเตือนลูกค้า..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNeedInfoModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                ส่งข้อความขอข้อมูลเพิ่ม
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: LINE Sent Confirmation Modal                     */}
      {/* ========================================================= */}
      {lineSentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50 text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold">
                  จำลองส่งข้อมูลเข้ากลุ่ม LINE เปิด CV สำเร็จ!
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
                  กลุ่มปลายทาง: กลุ่มเปิด CV-ใหม่ {lineSentModal.company === 'AC' ? 'A&C' : 'TD'}
                </span>
                <p className="text-[11px] text-slate-500">
                  ระบบได้สร้างคำขอและจัดส่งสรุปข้อมูลเข้ากลุ่มทีมขายของบริษัท {lineSentModal.company === 'AC' ? 'A&C' : 'TD'} เรียบร้อยแล้ว สถานะของลูกค้าเปลี่ยนเป็น "กำลังดำเนินการ"
                </p>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                {lineSentModal.message}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setLineSentModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module04TradingTerms;
