import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Bot,
  UserCheck,
  ShieldCheck,
  Plus,
  History,
  Tag,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import type { Customer, CustomerTag, DuplicateCustomerMatch, AITagSuggestion, TagAuditLog } from '../types';
import {
  MOCK_FOUR_CATEGORY_TAGS,
  MOCK_DUPLICATE_DETECTION_CASES,
  MOCK_AI_TAG_SUGGESTIONS,
  MOCK_TAG_AUDIT_LOGS,
} from '../mockData';

interface CustomerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onUpdateCustomerTags?: (tags: CustomerTag[]) => void;
}

export const CustomerCardModal: React.FC<CustomerCardModalProps> = ({
  isOpen,
  onClose,
  customer,
  onUpdateCustomerTags,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'duplicate' | 'tags' | 'ai_assistant' | 'audit'>('card');
  
  // Duplicate search state
  const [dupSearchQuery, setDupSearchQuery] = useState(customer.name);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateCustomerMatch[]>(MOCK_DUPLICATE_DETECTION_CASES);
  const [selectedMatch, setSelectedMatch] = useState<DuplicateCustomerMatch | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState(false);

  // Tags state
  const [currentTags, setCurrentTags] = useState<CustomerTag[]>(customer.tags);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<'target_product' | 'trading_terms' | 'promotion' | 'communication'>('target_product');

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<AITagSuggestion[]>(MOCK_AI_TAG_SUGGESTIONS);
  const [auditLogs, setAuditLogs] = useState<TagAuditLog[]>(MOCK_TAG_AUDIT_LOGS);

  // Copy helper
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApplyAiSuggestion = (suggestion: AITagSuggestion) => {
    const newTag: CustomerTag = {
      id: `tag-ai-${Date.now()}`,
      label: suggestion.suggestedValue,
      category: 'custom',
      color:
        suggestion.category === 'target_product'
          ? '#ef4444'
          : suggestion.category === 'trading_terms'
          ? '#3b82f6'
          : suggestion.category === 'promotion'
          ? '#10b981'
          : '#8b5cf6',
    };

    const updated = [...currentTags, newTag];
    setCurrentTags(updated);
    if (onUpdateCustomerTags) onUpdateCustomerTags(updated);

    // Add to audit log
    const newLog: TagAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'เพิ่งเสร็จสิ้น',
      operator: 'คุณสมชาย (ฝ่ายขาย) ยืนยันจาก AI',
      role: 'Sales',
      action: suggestion.actionType === 'add' ? 'ฝ่ายขายเพิ่ม Tag ตาม AI' : 'ฝ่ายขายปรับ Tag ตาม AI',
      tagLabel: suggestion.suggestedValue,
      categoryLabel: suggestion.categoryLabel,
    };
    setAuditLogs([newLog, ...auditLogs]);

    // Remove from suggestions
    setAiSuggestions(aiSuggestions.filter((s) => s.id !== suggestion.id));
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagLabel.trim()) return;

    const newTag: CustomerTag = {
      id: `tag-${Date.now()}`,
      label: newTagLabel.trim(),
      category: 'custom',
      color:
        newTagCategory === 'target_product'
          ? '#ef4444'
          : newTagCategory === 'trading_terms'
          ? '#3b82f6'
          : newTagCategory === 'promotion'
          ? '#10b981'
          : '#8b5cf6',
    };

    const updated = [...currentTags, newTag];
    setCurrentTags(updated);
    if (onUpdateCustomerTags) onUpdateCustomerTags(updated);

    // Add to audit log
    const categoryName =
      newTagCategory === 'target_product'
        ? 'สินค้าเป้าหมาย'
        : newTagCategory === 'trading_terms'
        ? 'เงื่อนไขการค้า'
        : newTagCategory === 'promotion'
        ? 'โปรโมชั่น'
        : 'การสื่อสาร';

    const newLog: TagAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'เพิ่งเสร็จสิ้น',
      operator: 'คุณสมชาย (ฝ่ายขาย)',
      role: 'Sales',
      action: 'ฝ่ายขายเพิ่ม Tag ใหม่',
      tagLabel: newTagLabel.trim(),
      categoryLabel: categoryName,
    };
    setAuditLogs([newLog, ...auditLogs]);
    setNewTagLabel('');
  };

  const handleRemoveTag = (tagId: string) => {
    const targetTag = currentTags.find((t) => t.id === tagId);
    const updated = currentTags.filter((t) => t.id !== tagId);
    setCurrentTags(updated);
    if (onUpdateCustomerTags) onUpdateCustomerTags(updated);

    if (targetTag) {
      const newLog: TagAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: 'เพิ่งเสร็จสิ้น',
        operator: 'คุณสมชาย (ฝ่ายขาย)',
        role: 'Sales',
        action: 'ฝ่ายขายลบ Tag',
        tagLabel: targetTag.label,
        categoryLabel: 'Tag ทั่วไป',
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  const handleMergeDuplicate = (match: DuplicateCustomerMatch) => {
    setSelectedMatch(match);
    setMergeSuccess(true);
    setTimeout(() => {
      setMergeSuccess(false);
      setActiveTab('card');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-3 md:p-6 animate-fade-in select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  Customer Card & Tag Rules (ฟังก์ชันเพิ่มเติม)
                </h3>
                <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  ระบบ Tag 4 หมวด • กฎสื่อสาร • ตรวจลูกค้ารายซ้ำ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                วัตถุประสงค์: จัดเก็บข้อมูลลูกค้า กำหนดและจัดการ Tag 4 หมวด ควบคุมสิทธิ์การเข้าถึง และตรวจสอบลูกค้ารายซ้ำอัตโนมัติ (อ้างอิงสไลด์ 5)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 5-Category Navigation Tabs (from Slide 5) */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-2 flex items-center justify-between overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('card')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'card'
                  ? 'border-b-blue-600 text-blue-600'
                  : 'border-b-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={14} />
              <span>2. หน้าจอ Customer Card</span>
            </button>

            <button
              onClick={() => setActiveTab('duplicate')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'duplicate'
                  ? 'border-b-blue-600 text-blue-600'
                  : 'border-b-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search size={14} />
              <span>1. ค้นหาและตรวจลูกค้ารายซ้ำ</span>
              {duplicateMatches.length > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-bold">
                  {duplicateMatches.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tags')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'tags'
                  ? 'border-b-blue-600 text-blue-600'
                  : 'border-b-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag size={14} />
              <span>3. จัดการ Tag 4 หมวด</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'ai_assistant'
                  ? 'border-b-blue-600 text-blue-600'
                  : 'border-b-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot size={14} />
              <span>4. AI แนะนำและปรับ Tag</span>
              {aiSuggestions.length > 0 && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-bold">
                  {aiSuggestions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-b-blue-600 text-blue-600'
                  : 'border-b-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={14} />
              <span>5. ประวัติและสิทธิ์</span>
            </button>
          </div>

          <div className="pb-2 text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-2">
            <span>Customer ID: <strong className="font-mono text-slate-800">{customer.customerCardCode || 'CUST-20251010-001'}</strong></span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {/* TAB 1: CUSTOMER CARD OVERVIEW */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {/* Customer Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-2xs"
                    style={{ backgroundColor: customer.avatarColor }}
                  >
                    {customer.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{customer.name}</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ลูกค้าปัจจุบัน
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                      <span>รหัสลูกค้า: <strong className="font-mono text-slate-700">{customer.customerCardCode || 'CUST-20251010-001'}</strong></span>
                      <span>•</span>
                      <span>โทร: <strong className="font-mono text-slate-700">{customer.phone}</strong></span>
                      <span>•</span>
                      <span>ผู้ติดต่อ: {customer.contactPerson}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleCopy(`${customer.name} | ${customer.phone} | ${customer.address}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อมูล'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tags')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    <Plus size={13} />
                    <span>จัดการ Tag 4 หมวด</span>
                  </button>
                </div>
              </div>

              {/* 4 Tag Categories Display Card (Slide 5 Pillar 2 & 3) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      แท็กของลูกค้า (Tag 4 หมวด) เพื่อให้ AI แนะนำสินค้าและโอกาสขายได้แม่นยำ
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    รวม {currentTags.length} แท็ก
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Category 1: สินค้าเป้าหมาย */}
                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        1. สินค้าเป้าหมาย
                      </span>
                      <span className="text-[10px] text-rose-600">เช่น หมูสามชั้น, ซี่โครง</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_FOUR_CATEGORY_TAGS.target_product.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-rose-800 border border-rose-200 flex items-center gap-1"
                        >
                          <span>{t.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: เงื่อนไขการค้า */}
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        2. เงื่อนไขการค้า
                      </span>
                      <span className="text-[10px] text-blue-600">เช่น COD, มัดจำ 30%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_FOUR_CATEGORY_TAGS.trading_terms.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-blue-800 border border-blue-200 flex items-center gap-1"
                        >
                          <span>{t.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category 3: โปรโมชั่น */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        3. โปรโมชั่น
                      </span>
                      <span className="text-[10px] text-emerald-600">เช่น ซื้อ 3 แถม 1, ราคาพิเศษ</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_FOUR_CATEGORY_TAGS.promotion.map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1"
                        >
                          <span>{t.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category 4: การสื่อสาร */}
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        4. การสื่อสาร
                      </span>
                      <span className="text-[10px] text-purple-600">เช่น LINE เป็นหลัก, ส่งโปรสัปดาห์</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_FOUR_CATEGORY_TAGS.communication.map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-purple-800 border border-purple-200 flex items-center gap-1"
                        >
                          <span>{t.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Profile & Route Match Details */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">ประเภทธุรกิจ</span>
                  <span className="font-bold text-slate-800">{customer.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">ที่อยู่จัดส่ง / พิกัด</span>
                  <span className="font-medium text-slate-800 truncate block">{customer.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">สายจัดส่ง Route</span>
                  <span className="font-bold text-emerald-700">{customer.routeCode} ({customer.routeDays})</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DUPLICATE DETECTION (Slide 5 Pillar 1) */}
          {activeTab === 'duplicate' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <div className="font-bold">ระบบตรวจสอบลูกค้ารายซ้ำอัตโนมัติ (Duplicate Detection)</div>
                  AI ตรวจสอบความคล้ายคลึงจากชื่อ เบอร์โทร และพิกัดแผนที่ เพื่อป้องกันการเปิด Customer Card ซ้ำซ้อน และรักษาประวัติการติดต่อในฐานข้อมูลเดียว
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
                <Search size={16} className="text-slate-400 ml-1" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ เบอร์โทร หรือเลขประจำตัวผู้เสียภาษี..."
                  value={dupSearchQuery}
                  onChange={(e) => setDupSearchQuery(e.target.value)}
                  className="flex-1 text-xs outline-none bg-transparent text-slate-800 font-medium"
                />
                <button
                  onClick={() => setDuplicateMatches(MOCK_DUPLICATE_DETECTION_CASES)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  ค้นหาซ้ำ
                </button>
              </div>

              {mergeSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>เชื่อมโยงและรวมข้อมูลเข้ากับ Customer Card รหัส {selectedMatch?.existingCardId} เรียบร้อยแล้ว!</span>
                </div>
              )}

              {/* Duplicate Candidates List */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>พบข้อมูลลูกค้าที่อาจซ้ำซ้อน ({duplicateMatches.length} รายการ)</span>
                  <span className="text-[11px] text-slate-400 font-normal">เปรียบเทียบด้วย AI Similarity Algorithm</span>
                </div>

                {duplicateMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-900">{match.name}</h5>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full font-mono">
                            {match.existingCardId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span>เบอร์โทร: <strong className="font-mono text-slate-700">{match.phone}</strong></span>
                          <span>•</span>
                          <span>ที่อยู่: {match.address}</span>
                        </div>
                      </div>

                      {/* Similarity Badge */}
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                          <Sparkles size={12} />
                          <span>ตรงกัน {match.similarity}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">ความคล้ายคลึงสูง</span>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs">
                      <span className="font-semibold text-slate-700 block mb-1">เหตุผลที่ตรวจพบ:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                        {match.matchReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleMergeDuplicate(match)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                      >
                        เชื่อมโยงข้อมูลเดิม
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Option */}
              <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                <span className="text-xs text-slate-500 mr-3">หากตรวจสอบแล้วเป็นลูกค้ารายใหม่ ไม่ต้องการเชื่อมโยง</span>
                <button
                  onClick={() => {
                    alert('สร้าง Customer Card รหัสใหม่สำหรับลูกค้ารายนี้เรียบร้อยแล้ว');
                    setActiveTab('card');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 transition-colors"
                >
                  สร้าง Customer Card ใหม่
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: 4-CATEGORY TAG MANAGER (Slide 5 Pillar 3) */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              {/* Add New Tag Form */}
              <form onSubmit={handleAddCustomTag} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus size={14} className="text-blue-600" />
                  <span>เพิ่ม Tag ใน 4 หมวดหมู่หลัก</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="md:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">เลือกหมวดหมู่</label>
                    <select
                      value={newTagCategory}
                      onChange={(e) => setNewTagCategory(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="target_product">1. สินค้าเป้าหมาย</option>
                      <option value="trading_terms">2. เงื่อนไขการค้า</option>
                      <option value="promotion">3. โปรโมชั่น</option>
                      <option value="communication">4. การสื่อสาร</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">ชื่อ Tag</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="เช่น หมูสามชั้น 500 กก., มัดจำ 30%, ซื้อ 3 แถม 1..."
                        value={newTagLabel}
                        onChange={(e) => setNewTagLabel(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold whitespace-nowrap"
                      >
                        เพิ่ม Tag
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Tag List Grouped by 4 Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. สินค้าเป้าหมาย */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900 border-b border-slate-100 pb-1.5">
                    <span>1. สินค้าเป้าหมาย (Target Product)</span>
                    <span className="text-[10px] text-slate-400">แนะนำโอกาสขาย</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                    {currentTags
                      .filter((t) => t.label.includes('หมู') || t.label.includes('ไก่') || t.label.includes('สามชั้น') || t.label.includes('กก.'))
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200"
                        >
                          <span>{tag.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="hover:text-rose-600 ml-1"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                {/* 2. เงื่อนไขการค้า */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 border-b border-slate-100 pb-1.5">
                    <span>2. เงื่อนไขการค้า (Trading Terms)</span>
                    <span className="text-[10px] text-slate-400">การเงิน/ส่งมอบ</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                    {currentTags
                      .filter((t) => t.label.includes('COD') || t.label.includes('มัดจำ') || t.label.includes('เครดิต') || t.label.includes('Route'))
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200"
                        >
                          <span>{tag.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="hover:text-blue-600 ml-1"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                {/* 3. โปรโมชั่น */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-slate-100 pb-1.5">
                    <span>3. โปรโมชั่น (Promotion)</span>
                    <span className="text-[10px] text-slate-400">สิทธิพิเศษ</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                    {MOCK_FOUR_CATEGORY_TAGS.promotion.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        <span>{tag.label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="hover:text-emerald-600 ml-1"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. การสื่อสาร */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900 border-b border-slate-100 pb-1.5">
                    <span>4. การสื่อสาร (Communication Rules)</span>
                    <span className="text-[10px] text-slate-400">ช่องทาง/เวลา</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[38px]">
                    {MOCK_FOUR_CATEGORY_TAGS.communication.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200"
                      >
                        <span>{tag.label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="hover:text-purple-600 ml-1"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI TAG ASSISTANT (Slide 5 Pillar 4) */}
          {activeTab === 'ai_assistant' && (
            <div className="space-y-3.5">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <Bot size={18} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900 leading-relaxed">
                  <div className="font-bold">AI แนะนำและปรับ Tag (AI Tag Assistant)</div>
                  AI วิเคราะห์จากประวัติการซื้อและพฤติกรรมการสนทนา เพื่อแนะนำหรือปรับเปลี่ยน Tag ให้เหมาะสม ฝ่ายขายสามารถกดยืนยันเพื่อนำไปใช้ได้ทันที
                </div>
              </div>

              <div className="space-y-2.5">
                {aiSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{sug.tagLabel}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {sug.categoryLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        <strong className="text-purple-700">เหตุผล:</strong> {sug.reason}
                      </p>
                      {sug.actionType === 'modify' && sug.currentValue && (
                        <div className="text-[11px] text-slate-400">
                          เปลี่ยนจากเดิม: <span className="line-through">{sug.currentValue}</span> → เป็น: <strong className="text-slate-700">{sug.suggestedValue}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApplyAiSuggestion(sug)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                      >
                        <Check size={13} />
                        <span>{sug.actionType === 'add' ? '+ เพิ่ม Tag' : 'ปรับเป็น Tag นี้'}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {aiSuggestions.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                    ยืนยันคำแนะนำของ AI ครบทุกรายการแล้ว
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS & PERMISSION RIGHTS (Slide 5 Pillar 5) */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {/* Permission Matrix Banner */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>สิทธิ์การเข้าถึงและการควบคุม Tag (Permission Matrix)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-300">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <strong className="text-purple-400 block mb-0.5">🤖 AI (Autonomous)</strong>
                    อ่านข้อมูลเพื่อวิเคราะห์และแนะนำ Tag เท่านั้น ไม่สามารถเปลี่ยนแปลงค่าเองโดยตรง
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <strong className="text-blue-400 block mb-0.5">👤 ฝ่ายขาย (Sales)</strong>
                    มีสิทธิ์เพิ่ม แก้ไข และลบ Tag ทั่วไปในหมวดสินค้าเป้าหมายและการสื่อสาร
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <strong className="text-amber-400 block mb-0.5">👑 ผู้จัดการ (Manager)</strong>
                    อนุมัติ Tag สำคัญ เช่น เครดิตเทอม มัดจำ หรือเงื่อนไขการค้าพิเศษ
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5">
                    <History size={14} className="text-blue-600" />
                    <span>ประวัติการแก้ไข Tag (Tag Modification Log)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{auditLogs.length} รายการ</span>
                </div>

                <div className="space-y-2 text-xs">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.action}:</span>
                          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.2 rounded text-[11px]">
                            {log.tagLabel}
                          </span>
                          <span className="text-[10px] text-slate-400">({log.categoryLabel})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          โดย: <strong className="text-slate-700">{log.operator}</strong>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>เชื่อมโยงระบบ Sales AI Automation OS v1.0.0</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
