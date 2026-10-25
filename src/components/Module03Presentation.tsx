import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Check,
  X,
  ShieldAlert,
  Phone,
  BarChart2,
  ArrowRight,
  Bot,
} from 'lucide-react';
import type {
  Customer,
  ProductSKU,
} from '../types';
import {
  MOCK_PRODUCTS,
  MODULE_03_STATS,
  APPROVED_MEDIA_ASSETS,
  MOCK_CAMPAIGN_DATA,
} from '../mockData';

interface Module03PresentationProps {
  customer: Customer;
  customers: Customer[];
  onSelectCustomer: (cust: Customer) => void;
  onSendMediaToChat: (product: ProductSKU, customer: Customer) => void;
  onNavigateToModule: (moduleId: string) => void;
}

export const Module03Presentation: React.FC<Module03PresentationProps> = ({
  customer,
  customers,
  onSelectCustomer,
  onSendMediaToChat,
  onNavigateToModule,
}) => {
  // Mode switcher: Main Presentation vs Product Campaign Advisor
  const [activeTab, setActiveTab] = useState<'presentation' | 'advisor'>('presentation');

  // Products state (to allow Mode B approval toggle)
  const [products, setProducts] = useState<ProductSKU[]>(MOCK_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>(MOCK_PRODUCTS[0].id);
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'ai' | 'sales' | 'pending'>('all');

  // Media preview modal state
  const [previewMedia, setPreviewMedia] = useState<{
    isOpen: boolean;
    product?: ProductSKU;
    mediaType?: string;
  }>({ isOpen: false });

  // Campaign Advisor wizard step (1 to 5)
  const [campaignStep, setCampaignStep] = useState<number>(1);
  const campaignTargets = MOCK_CAMPAIGN_DATA.targets;
  const [campaignDoneModal, setCampaignDoneModal] = useState(false);

  // Filter customers for Left Panel
  const filteredCustomers = customers.filter((c) => {
    if (customerFilter === 'ai' && c.status !== 'ai') return false;
    if (customerFilter === 'sales' && c.status !== 'sales') return false;
    if (customerFilter === 'pending' && c.status !== 'out_of_route') return false;

    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  // Handle Mode B human approval by sales
  const handleApproveProductMedia = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, approvalStatus: 'approved' } : p))
    );
  };

  const handleRejectProductMedia = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, approvalStatus: 'rejected' } : p))
    );
  };

  // Handle sending media simulation
  const handleSendMedia = (prod: ProductSKU) => {
    if (prod.approvalMode === 'MODE_C') {
      alert('โหมด C: ห้าม AI ส่ง ต้องให้ฝ่ายขายดำเนินการด้วยตนเอง');
      return;
    }
    if (prod.approvalMode === 'MODE_B' && prod.approvalStatus !== 'approved') {
      alert('โหมด B: ร่างสื่อยังไม่ได้รับอนุมัติจากฝ่ายขาย');
      return;
    }
    onSendMediaToChat(prod, customer);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden min-h-0 select-none">
      {/* Top Banner: Statistics & View Switcher */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Statistics summary chips */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] min-w-0 py-0.5">
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
              <span className="text-slate-500 font-medium">ลูกค้าทั้งหมด:</span>{' '}
              <span className="font-bold text-slate-800">{MODULE_03_STATS.totalCustomers}</span>
              <span className="text-emerald-600 font-semibold ml-1 text-[10px]">
                {MODULE_03_STATS.totalCustomersDiff}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 text-emerald-800 font-semibold">
              <span className="text-emerald-600 font-medium">AI นำเสนอแล้ว:</span>{' '}
              <span>{MODULE_03_STATS.presentedCount}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 text-blue-800 font-semibold">
              <span className="text-blue-600 font-medium">ส่งสื่อ/ราคาแล้ว:</span>{' '}
              <span>{MODULE_03_STATS.mediaSentCount}</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0 text-amber-800 font-semibold">
              <span className="text-amber-600 font-medium">รอเซลล์ตอบ:</span>{' '}
              <span>{MODULE_03_STATS.waitingSalesCount}</span>
            </div>

            <div className="bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg shrink-0 text-purple-800 font-semibold">
              <span className="text-purple-600 font-medium">อนุมัติสื่อแล้ว:</span>{' '}
              <span>{MODULE_03_STATS.approvedAndSentCount}</span>
            </div>
          </div>

          {/* Sub-module View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0 text-xs font-semibold self-start lg:self-center">
            <button
              onClick={() => setActiveTab('presentation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'presentation'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag size={13} />
              <span>นำเสนอสินค้าและสื่อ (AI Presentation)</span>
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'advisor'
                  ? 'bg-white text-purple-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles size={13} className="text-purple-600" />
              <span>Product Campaign Advisor (แคมเปญ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'presentation' ? (
        /* =========================================================================
           VIEW 1: Standard AI Product Presentation (3-Column Layout from Slide 14)
           ========================================================================= */
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Column 1: Customer Selection List (w-72 or responsive) */}
          <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  รายชื่อลูกค้า ({filteredCustomers.length})
                </span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  โมดูล 03
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อลูกค้า, ประเภท..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-slate-200/60 p-0.5 rounded-md text-[10px] font-medium text-center">
                <button
                  onClick={() => setCustomerFilter('all')}
                  className={`py-0.5 rounded ${
                    customerFilter === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setCustomerFilter('ai')}
                  className={`py-0.5 rounded ${
                    customerFilter === 'ai' ? 'bg-white font-bold text-emerald-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  AI ดูแล
                </button>
                <button
                  onClick={() => setCustomerFilter('sales')}
                  className={`py-0.5 rounded ${
                    customerFilter === 'sales' ? 'bg-white font-bold text-amber-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  เซลล์ตอบ
                </button>
                <button
                  onClick={() => setCustomerFilter('pending')}
                  className={`py-0.5 rounded ${
                    customerFilter === 'pending' ? 'bg-white font-bold text-rose-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  นอกสาย
                </button>
              </div>
            </div>

            {/* Customer List items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredCustomers.map((c) => {
                const isSelected = c.id === customer.id;
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
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs truncate ${isSelected ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'}`}>
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.lastMessageTime}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mb-1">
                      {c.category} • จ.{c.province}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-700 font-medium bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded truncate max-w-[130px]">
                        {c.interestedProducts[0]?.name || 'สนใจหมูสด'}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                        AI ดูแล
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Product Presentation Workspace (Center) */}
          <div className="flex-1 flex flex-col bg-slate-50/70 border-r border-slate-200 overflow-hidden min-w-0">
            {/* Header of Center: Customer Summary & Sub-Tabs */}
            <div className="p-3.5 bg-white border-b border-slate-200 shadow-2xs shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                    style={{ backgroundColor: customer.avatarColor }}
                  >
                    {customer.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">{customer.name}</h2>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ในพื้นที่ {customer.routeCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {customer.category} • เบอร์โทร: {customer.phone}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md block">
                    AI Qualification: A (92%)
                  </span>
                </div>
              </div>

              {/* Requirement Summary Callout */}
              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <Sparkles size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">สรุปความต้องการ (จากโมดูล 02):</span>{' '}
                  {customer.qualification?.interestedSku || 'เศษสามชั้น (ทำหมูกรอบ)'}{' '}
                  จำนวน {customer.qualification?.expectedQty || '500 กก./ครั้ง'}{' '}
                  ความถี่ {customer.qualification?.orderFrequency || 'ทุกสัปดาห์'}{' '}
                  (ส่งสาย {customer.routeCode} ขอนแก่น)
                </div>
              </div>
            </div>

            {/* Center Body: Recommended Product Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-blue-600" />
                  สินค้าแนะนำ (จากการวิเคราะห์ความต้องการ & Quotation Master)
                </h3>
                <span className="text-[11px] text-slate-500">
                  {products.length} รายการที่ตรงเงื่อนไข
                </span>
              </div>

              {/* Product Cards List */}
              <div className="space-y-3.5">
                {products.map((prod) => {
                  const isModeA = prod.approvalMode === 'MODE_A';
                  const isModeB = prod.approvalMode === 'MODE_B';
                  const isModeC = prod.approvalMode === 'MODE_C';
                  const isPending = prod.approvalStatus === 'pending';
                  const isApproved = prod.approvalStatus === 'approved';

                  return (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all p-3.5 cursor-pointer ${
                        selectedProductId === prod.id
                          ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3.5">
                        {/* Product Image Thumbnail */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 relative group">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {prod.matchScore && (
                            <span className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                              ตรง {prod.matchScore}%
                            </span>
                          )}
                        </div>

                        {/* Product Info & Specifications */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <h4 className="text-xs font-bold text-slate-900">{prod.name}</h4>

                            {/* Media Approval Mode Badge */}
                            {isModeA && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <CheckCircle2 size={11} className="text-emerald-600" />
                                โหมด A: อนุมัติแล้ว (AI ส่งได้ทันที)
                              </span>
                            )}
                            {isModeB && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isApproved
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                  : 'text-amber-700 bg-amber-50 border border-amber-200'
                              }`}>
                                <Clock size={11} className={isApproved ? 'text-emerald-600' : 'text-amber-600'} />
                                {isApproved
                                  ? 'โหมด B: ฝ่ายขายอนุมัติแล้ว'
                                  : 'โหมด B: รอฝ่ายขายอนุมัติก่อนส่ง'}
                              </span>
                            )}
                            {isModeC && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <ShieldAlert size={11} className="text-rose-600" />
                                โหมด C: ฝ่ายขายส่งเอง (ห้าม AI ส่ง)
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {prod.description}
                          </p>

                          <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                            <div>
                              <span className="font-semibold text-slate-700">การบรรจุ:</span>{' '}
                              {prod.packInfo}
                            </div>
                            {prod.customerSpecificPrice && (
                              <div className="text-blue-700 font-semibold">
                                <span className="text-slate-700">ราคาสัญญาประจำ:</span>{' '}
                                {prod.customerSpecificPrice}
                              </div>
                            )}
                          </div>

                          {/* Approved Tiered Price Table */}
                          <div className="mt-2.5">
                            <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center justify-between">
                              <span>ตารางราคาขายส่ง (อ้างอิง Quotation Program)</span>
                              <span>หน่วย: บาท / กก.</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                              {prod.standardPrices.map((tier, idx) => (
                                <div
                                  key={idx}
                                  className="p-1 rounded bg-slate-50 border border-slate-200"
                                >
                                  <div className="text-slate-400 font-medium">{tier.range}</div>
                                  <div className="font-bold text-slate-800 text-xs">
                                    {tier.pricePerKg} ฿
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Controls for this product */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                            <button
                              onClick={() =>
                                setPreviewMedia({ isOpen: true, product: prod, mediaType: 'all' })
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200"
                            >
                              <Eye size={13} />
                              <span>ดูตัวอย่างสื่อ & ตารางราคา</span>
                            </button>

                            <div className="flex items-center gap-2">
                              {/* If Mode B is pending approval, show Approve/Reject buttons for Sales */}
                              {isModeB && isPending && (
                                <>
                                  <button
                                    onClick={() => handleApproveProductMedia(prod.id)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors"
                                  >
                                    <Check size={13} />
                                    <span>อนุมัติสื่อ</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectProductMedia(prod.id)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-2 py-1.5 rounded-lg transition-colors"
                                  >
                                    <X size={13} />
                                    <span>ปฏิเสธ</span>
                                  </button>
                                </>
                              )}

                              {/* Send Button */}
                              {isModeC ? (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-not-allowed"
                                  title="โหมด C ห้าม AI ส่ง ต้องให้ฝ่ายขายดำเนินการ"
                                >
                                  <ShieldAlert size={13} />
                                  <span>ฝ่ายขายส่งเอง (AI ถูกจำกัด)</span>
                                </button>
                              ) : isModeB && isPending ? (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-not-allowed"
                                  title="ต้องให้ฝ่ายขายอนุมัติก่อน"
                                >
                                  <Clock size={13} />
                                  <span>รอการอนุมัติก่อนส่ง</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSendMedia(prod)}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all shadow-xs"
                                >
                                  <Send size={13} />
                                  <span>จำลอง AI ส่งสื่อเข้า LINE</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Customer Context & Approved Media Library (Right) */}
          <div className="w-88 xl:w-96 bg-white flex flex-col shrink-0 overflow-hidden border-l border-slate-200">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <span className="text-xs font-bold text-slate-900">
                ข้อมูลลูกค้า (Lead Profile & Context)
              </span>
            </div>

            {/* Scrollable Context Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Profile Card */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">{customer.name}</div>
                <div className="text-slate-600">{customer.category}</div>
                <div className="text-slate-500 flex items-center gap-1 font-mono">
                  <Phone size={11} /> {customer.phone}
                </div>
                <div className="text-slate-500 pt-1 border-t border-slate-200/60 leading-tight">
                  {customer.address}
                </div>
              </div>

              {/* Module 02 Qualification Summary Card */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/80 text-xs space-y-2">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>ความสนใจและความต้องการ (จากโมดูล 02)</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                    AI Score: A
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900">สินค้าหลัก:</span>{' '}
                    {customer.qualification?.interestedSku || 'เศษสามชั้น (สำหรับทำหมูกรอบ)'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">ปริมาณ:</span>{' '}
                    {customer.qualification?.expectedQty || '500 กก./ครั้ง'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">ความถี่:</span>{' '}
                    {customer.qualification?.orderFrequency || 'ทุกสัปดาห์'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">วัตถุประสงค์:</span>{' '}
                    {customer.qualification?.purpose || 'ผลิตหมูกรอบจำหน่าย'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">หมายเหตุ:</span>{' '}
                    {customer.qualification?.note || 'สั่งประจำ ต้องการส่งตรงเวลา'}
                  </div>
                </div>
              </div>

              {/* Pricing Rights Section (Slide 15) */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <BarChart2 size={13} className="text-blue-600" />
                  <span>สิทธิ์การเสนอราคา (Quotation Governance)</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">สิทธิ์ที่ได้รับ:</span> เสนอราคาอนุมัติ (โหมด A)
                </div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 leading-tight">
                  ⚠️ ข้อห้าม: AI ห้ามเดาราคาและห้ามสร้างใบเสนอราคาเป็นทางการเองโดยไม่มีสิทธิ์ตามสไลด์ 15
                </div>
              </div>

              {/* Approved Media Library (Slide 14) */}
              <div>
                <div className="text-xs font-bold text-slate-900 mb-2">
                  ตัวอย่างสื่อที่พร้อมส่งให้ลูกค้าได้
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {APPROVED_MEDIA_ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() =>
                        setPreviewMedia({
                          isOpen: true,
                          product: selectedProduct,
                          mediaType: asset.type,
                        })
                      }
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all"
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-slate-700 font-semibold text-[11px]">
                        {asset.type === 'image' && <ImageIcon size={13} className="text-blue-600" />}
                        {asset.type === 'brochure' && <FileText size={13} className="text-rose-600" />}
                        {asset.type === 'price_sheet' && <FileText size={13} className="text-emerald-600" />}
                        {asset.type === 'link' && <ExternalLink size={13} className="text-purple-600" />}
                        <span className="truncate">{asset.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {asset.countLabel}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Presentation History */}
              <div>
                <div className="text-xs font-bold text-slate-900 mb-2">
                  ประวัติการนำเสนอและการตอบกลับ
                </div>
                <div className="space-y-2 text-[11px]">
                  {customer.mediaHistory?.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.timestamp} • {item.sender === 'ai' ? 'ส่งโดย AI' : 'ส่งโดยฝ่ายขาย'}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          item.status === 'sent'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        {item.status === 'sent' ? 'ส่งสำเร็จ' : 'ไม่สำเร็จ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
              <button
                onClick={() => onNavigateToModule('04')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <span>ส่งต่อโมดูล 04 แจ้งเงื่อนไขการค้าและเปิด CV</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIEW 2: Product Campaign Advisor (Matching Slide 14 Bottom UI)
           ========================================================================= */
        <div className="flex-1 flex flex-col overflow-y-auto p-4 bg-slate-50">
          <div className="max-w-5xl mx-auto w-full space-y-4">
            {/* Advisor Stepper Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-600" />
                    Product Campaign Advisor (ฟังก์ชันเพิ่มเติม)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ช่วยฝ่ายขายและบอสเฟ้นหาและแนะนำสินค้าที่เหมาะกับแต่ละกลุ่มลูกค้า โดยใช้ Buying DNA และข้อมูลที่ได้รับอนุมัติแล้ว
                  </p>
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  ขั้นตอนที่ {campaignStep} / 5
                </span>
              </div>

              {/* 5-Step Progress Bar */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-center">
                {[
                  { step: 1, title: 'Product Brief', sub: 'ผู้จัดการตั้งโจทย์' },
                  { step: 2, title: 'AI Consultation', sub: 'ปรึกษา AI ปรับกลุ่ม' },
                  { step: 3, title: 'Target Panel', sub: 'จัดอันดับลูกค้า' },
                  { step: 4, title: 'Preview', sub: 'ราคา/สินค้า + ข้อความ' },
                  { step: 5, title: 'Review', sub: 'สร้างงานขาย' },
                ].map((s) => (
                  <div
                    key={s.step}
                    onClick={() => setCampaignStep(s.step)}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      campaignStep === s.step
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : campaignStep > s.step
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{s.title}</div>
                    <div className="text-[9px] opacity-80 truncate">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Product Brief */}
            {campaignStep === 1 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                  1. Product Brief — ตั้งโจทย์แคมเปญ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      เลือกสินค้าเป้าหมาย
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={MOCK_CAMPAIGN_DATA.productName}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ช่วงเวลาแคมเปญ
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={MOCK_CAMPAIGN_DATA.period}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      กลุ่มเป้าหมาย (Customer Segment)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={MOCK_CAMPAIGN_DATA.segmentName}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setCampaignStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
                  >
                    <span>ถัดไป: ปรึกษา AI</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: AI Consultation */}
            {campaignStep === 2 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Bot size={15} className="text-purple-600" />
                  2. AI Consultation — ปรึกษา AI ปรับกลุ่มเป้าหมายตาม Buying DNA
                </h4>

                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs text-purple-950">
                  <div className="font-bold">AI วิเคราะห์และให้คำแนะนำ:</div>
                  <p>
                    จากการวิเคราะห์ Buying DNA ของฐานลูกค้าทั้งหมด พบลูกค้า 24 ราย ที่มีประวัติซื้อสามชั้นหรือชิ้นส่วนหมูสด แต่ไม่ได้สั่งซื้อซ้ำในรอบ 30 วันที่ผ่านมา
                  </p>
                  <p className="font-semibold text-purple-800">
                    แนะนำให้ใช้ราคาโปรโมชั่น 68 บาท/กก. เมื่อสั่ง 500 กก. ขึ้นไป และเชื่อมกับรอบรถจัดส่งประจำ R1 เพื่อประหยัดต้นทุนการขนส่ง
                  </p>
                  <div className="pt-2 font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> คาดว่าจะเข้าถึงลูกค้าเป้าหมายได้: 24 ราย (อัตรา Conversion คาดการณ์ 65%)
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCampaignStep(1)}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={() => setCampaignStep(3)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
                  >
                    <span>ถัดไป: ดูรายชื่อลูกค้าเป้าหมาย</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Target Panel */}
            {campaignStep === 3 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    3. Target Panel — จัดอันดับลูกค้าที่น่าสนใจ (AI Score)
                  </h4>
                  <span className="text-xs text-slate-500">เลือกแล้ว 5 / 5 รายการ</span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">อันดับ</th>
                        <th className="py-2.5 px-3">ลูกค้า / บริษัท</th>
                        <th className="py-2.5 px-3">AI Score</th>
                        <th className="py-2.5 px-3">เหตุผลที่ AI แนะนำ</th>
                        <th className="py-2.5 px-3 text-right">ราคาแนะนำ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaignTargets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-500">#{t.rank}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            <div>{t.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{t.category}</div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {t.aiScore}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">{t.reason}</td>
                          <td className="py-2 px-3 text-right font-bold text-blue-700 whitespace-nowrap">
                            {t.recommendedPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCampaignStep(2)}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={() => setCampaignStep(4)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
                  >
                    <span>ถัดไป: พรีวิวข้อความ</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {campaignStep === 4 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                  4. Preview — ตัวอย่างข้อเสนอสินค้าและข้อความที่จะส่ง
                </h4>

                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>ตัวอย่างข้อความแชท LINE OA (ร่างโดย AI ภายใต้ราคาที่อนุมัติ):</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans shadow-2xs">
                    {MOCK_CAMPAIGN_DATA.sampleMessage}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    * ข้อความจะถูกปรับแต่งชื่อลูกค้าและเงื่อนไขสายส่งให้ตรงกับพิกัดของแต่ละรายโดยอัตโนมัติ
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCampaignStep(3)}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={() => setCampaignStep(5)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
                  >
                    <span>ถัดไป: สรุปและสร้างงานขาย</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {campaignStep === 5 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                  5. Review — สรุปรายการและสร้างงานขาย
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      แคมเปญ
                    </span>
                    <span className="font-bold text-slate-800">{MOCK_CAMPAIGN_DATA.productName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      จำนวนลูกค้าที่คัดเลือก
                    </span>
                    <span className="font-bold text-purple-700">12 ราย (จากเป้าหมาย 24 ราย)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      ช่องทางนำเสนอ
                    </span>
                    <span className="font-bold text-slate-800">LINE OA (ผ่านการตรวจโดยฝ่ายขาย)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      การปฏิบัติตามกฎ
                    </span>
                    <span className="font-bold text-emerald-700">
                      ใช้ราคาที่อนุมัติ / ไม่มีการ Broadcast อัตโนมัติ
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCampaignStep(4)}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={() => setCampaignDoneModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>สร้างงานขาย (12 ราย) ส่งให้ฝ่ายขายตรวจสอบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Media Modal */}
      {previewMedia.isOpen && previewMedia.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-sm text-slate-900">
                ตัวอย่างสื่อสินค้า: {previewMedia.product.name}
              </div>
              <button
                onClick={() => setPreviewMedia({ isOpen: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 space-y-3">
              <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={previewMedia.product.imageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{previewMedia.product.name}</div>
                <div className="text-slate-500 text-[11px]">{previewMedia.product.description}</div>
                <div className="text-[11px] text-blue-700 font-semibold pt-1">
                  การบรรจุ: {previewMedia.product.packInfo}
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-center text-xs font-semibold">
                ตารางราคาขายส่งได้รับการอนุมัติจาก Quotation Program ถูกต้องตามสไลด์ 15
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewMedia({ isOpen: false })}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Success Modal */}
      {campaignDoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              สร้างงานขายและส่งต่อให้ทีมขายสำเร็จ!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ระบบ Product Campaign Advisor ได้สร้างงานขายจำลองสำหรับลูกค้าเป้าหมาย 12 ราย เรียบร้อยแล้ว โดยส่งรายการเข้าสู่คิวงานให้ฝ่ายขายตรวจสอบรายบุคคล ไม่มีการส่ง Broadcast อัตโนมัติ ตามกฎสไลด์ 14 และ 16
            </p>
            <button
              onClick={() => {
                setCampaignDoneModal(false);
                setActiveTab('presentation');
                setCampaignStep(1);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              กลับสู่หน้าจอหลักโมดูล 03
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
