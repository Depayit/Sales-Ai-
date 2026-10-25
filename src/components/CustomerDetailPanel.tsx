import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Building,
  User,
  Plus,
  X,
  ExternalLink,
  Send,
  FileText,
  ShoppingCart,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import type { Customer, CustomerTag } from '../types';

interface CustomerDetailPanelProps {
  customer: Customer;
  onActionClick: (actionName: string, customer: Customer) => void;
}

export const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({
  customer,
  onActionClick,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'history' | 'docs' | 'alerts'>(
    'profile'
  );
  const [tags, setTags] = useState<CustomerTag[]>(customer.tags);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Sync tags if customer changes
  React.useEffect(() => {
    setTags(customer.tags);
    setIsAddingTag(false);
  }, [customer]);

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(customer.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;

    const newTag: CustomerTag = {
      id: `tag-${Date.now()}`,
      label: newTagText.trim(),
      category: 'custom',
      color: '#3b82f6',
    };

    setTags((prev) => [...prev, newTag]);
    setNewTagText('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  return (
    <div className="customer-detail-panel flex flex-col h-full bg-white overflow-hidden select-none">
      {/* Top Header Tabs */}
      <div className="border-b border-slate-200 px-4 pt-2.5 bg-slate-50">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลลูกค้า
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลการสั่ง
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ประวัติการสนทนา
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'docs'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            เอกสาร (CV)
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            รายการแจ้งเตือน
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Customer Header Title & Quick Profile */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {customer.name}
              </h2>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Lead ID: {customer.id.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Building size={12} /> {customer.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <User size={12} /> {customer.contactPerson}
              </span>
            </div>
          </div>

          <button
            onClick={handleCopyPhone}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="คัดลอกเบอร์โทร"
          >
            {copiedPhone ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{customer.phone}</span>
          </button>
        </div>

        {/* Section 1: Customer Profile Form Fields */}
        <div className="info-section bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
          <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
            <span>ข้อมูลลูกค้า (Lead Profile)</span>
            <span className="text-[10px] text-slate-400 font-normal">
              บันทึกเมื่อ: {customer.registeredAt}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">
                ประเภทธุรกิจ
              </span>
              <span className="text-slate-800 font-semibold">{customer.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">
                ผู้ติดต่อ
              </span>
              <span className="text-slate-800 font-semibold">{customer.contactPerson}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">
                จังหวัด / อำเภอ
              </span>
              <span className="text-slate-800 font-semibold">
                จ.{customer.province} / อ.{customer.district}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">
                ช่องทางที่มา
              </span>
              <span className="text-slate-800 font-semibold">{customer.sourceChannel}</span>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">
                ที่อยู่จัดส่ง / พิกัดหน้าร้าน
              </span>
              <div className="flex items-start gap-1.5 mt-0.5 text-slate-800 font-medium">
                <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
                <span>{customer.address}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">
                วันที่ต้องการรับสินค้า
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-semibold">
                <Calendar size={12} className="text-blue-600" />
                <span>{customer.requestedDate}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">
                ความถี่ในการสั่งซื้อ
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-semibold">
                <Clock size={12} className="text-emerald-600" />
                <span>{customer.frequency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Area & Route */}
        <div className="route-section bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Truck size={14} className="text-blue-600" /> พื้นที่จัดส่งและ Route
            </span>
            <button
              onClick={() => onActionClick('ดูรายละเอียด Route', customer)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>ดูรายละเอียด Route</span>
              <ExternalLink size={10} />
            </button>
          </div>

          <div className="flex items-start gap-3">
            {/* Map Preview Thumbnail */}
            <div className="w-24 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-200 relative group">
              <img
                src={customer.routeMapUrl || '/assets/route_map.jpg'}
                alt="Route thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-all" />
            </div>

            {/* Route Details */}
            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center gap-1.5">
                {customer.isRegularRoute ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    อยู่ในพื้นที่ส่งประจำ ({customer.routeCode})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full">
                    <AlertCircle size={11} />
                    อยู่นอกสายส่งประจำ (ส่งฝ่ายขายพิจารณา)
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">พื้นที่จัดส่งประจำ:</span>{' '}
                {customer.province} ({customer.district})
              </div>
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">รอบส่งประจำ:</span>{' '}
                {customer.routeDays}
              </div>
              <div className="text-[10px] text-slate-400">
                จัดส่งโดยรถควบคุมอุณหภูมิห้องเย็น A&C Fleet
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Customer Tags */}
        <div className="tag-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Tag ของลูกค้า ({tags.length})
            </span>
            <button
              onClick={() => setIsAddingTag(true)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus size={12} />
              <span>เพิ่ม Tag</span>
            </button>
          </div>

          {/* Add Tag Form */}
          {isAddingTag && (
            <form onSubmit={handleAddTag} className="flex items-center gap-1.5 mb-2.5">
              <input
                type="text"
                placeholder="พิมพ์ชื่อ Tag ใหม่..."
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                autoFocus
                className="flex-1 text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
              >
                บันทึก
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTag(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </form>
          )}

          {/* Tag Chips */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="tag-chip inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:text-rose-500 transition-colors ml-0.5"
                  title="ลบ Tag"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Section 4: Interested Products Table */}
        <div className="products-table-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              รายการสินค้าที่สนใจ ({customer.interestedProducts.length})
            </span>
            <button
              onClick={() => onActionClick('เพิ่มสินค้า', customer)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus size={12} />
              <span>เพิ่มสินค้า</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-2.5">สินค้า</th>
                  <th className="py-2 px-2 text-center">รูป</th>
                  <th className="py-2 px-2 text-right">จำนวน</th>
                  <th className="py-2 px-2 text-right">ราคา/หน่วย</th>
                  <th className="py-2 px-2 text-right">มูลค่ารวม</th>
                  <th className="py-2 px-2.5 text-right">วันที่ต้องการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.interestedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-2.5 font-medium text-slate-900">
                      <div>{p.name}</div>
                      {p.subName && (
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">
                          {p.subName}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <img
                        src={p.imageUrl || '/assets/pork_belly.jpg'}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover mx-auto border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-slate-800">
                      {p.qty}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-600">{p.unitPrice}</td>
                    <td className="py-2 px-2 text-right font-bold text-emerald-700">
                      {p.total}
                    </td>
                    <td className="py-2 px-2.5 text-right text-slate-600">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delivery Schedule Alert Note */}
          <div className="mt-2.5 p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-lg text-[11px] text-amber-900 leading-snug flex items-start gap-2">
            <CheckCircle2 size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">วันที่ต้องการส่งสินค้าตรงกับตารางส่งประจำ:</span>{' '}
              {customer.interestedProducts[0]?.note ||
                'จัดส่งโดยรถห้องเย็น A&C Fleet มีรอบส่งประจำตรงตามรอบที่ลูกค้าระบุ'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons (Workflow Triggers) */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
        <button
          onClick={() => onActionClick('ส่งเข้า LINE กลุ่มทีมขาย', customer)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Send size={14} />
          <span>ส่งเข้า LINE กลุ่มทีมขาย</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onActionClick('สร้างใบเสนอราคา (PDF)', customer)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all"
          >
            <FileText size={13} className="text-slate-500" />
            <span>สร้างใบเสนอราคา (PDF)</span>
          </button>
          <button
            onClick={() => onActionClick('สร้าง Sales Order', customer)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all"
          >
            <ShoppingCart size={13} className="text-slate-500" />
            <span>สร้าง Sales Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
