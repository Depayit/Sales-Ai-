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
import { CustomerCardModal } from './CustomerCardModal';

interface CustomerDetailPanelProps {
  customer: Customer;
  onActionClick: (actionName: string, customer: Customer) => void;
  onClose?: () => void;
  isDrawer?: boolean;
}

export const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({
  customer,
  onActionClick,
  onClose,
  isDrawer = false,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'history'>('profile');
  const [tags, setTags] = useState<CustomerTag[]>(customer.tags);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

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
    <div
      className={`h-full bg-white border-l border-slate-200 flex flex-col shrink-0 select-none overflow-hidden ${
        isDrawer ? 'w-full' : 'w-88 xl:w-96'
      }`}
    >
      {/* Top Tab Navigation & Drawer Close */}
      <div className="border-b border-slate-200 px-3 pt-2 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลลูกค้า
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลการสั่ง
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-b-blue-600 text-blue-600 font-bold'
                : 'border-b-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ประวัติการสนทนา
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors mb-1.5"
            title="ปิดหน้าต่าง"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Customer Header Info */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {customer.name}
              </h3>
              <button
                onClick={() => setIsCardModalOpen(true)}
                className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full shrink-0 transition-colors flex items-center gap-1"
                title="เปิดหน้าจอ Customer Card & Tag Rules (สไลด์ 5)"
              >
                <span>Customer Card</span>
              </button>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                {customer.id.toUpperCase()}
              </span>
            </div>

            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Building size={12} className="text-slate-400" /> {customer.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium truncate">
                <User size={12} className="text-slate-400" /> {customer.contactPerson}
              </span>
            </div>
          </div>

          <button
            onClick={handleCopyPhone}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shrink-0"
            title="คัดลอกเบอร์โทร"
          >
            {copiedPhone ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span className="font-mono">{customer.phone}</span>
          </button>
        </div>

        {/* Section 1: 2-Column Key-Value Grid (No text overlap) */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
            <span>ข้อมูลลูกค้า (Lead Profile)</span>
            <span className="text-[10px] text-slate-400 font-normal">
              บันทึก: {customer.registeredAt}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                ประเภทธุรกิจ
              </span>
              <span className="text-slate-800 font-semibold truncate block mt-0.5">
                {customer.category}
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                ผู้ติดต่อ
              </span>
              <span className="text-slate-800 font-semibold truncate block mt-0.5">
                {customer.contactPerson}
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                จังหวัด / อำเภอ
              </span>
              <span className="text-slate-800 font-semibold truncate block mt-0.5">
                จ.{customer.province} / อ.{customer.district}
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                ช่องทางที่มา
              </span>
              <span className="text-slate-800 font-semibold truncate block mt-0.5">
                {customer.sourceChannel}
              </span>
            </div>

            <div className="col-span-2 min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                ที่อยู่จัดส่ง / พิกัดหน้าร้าน
              </span>
              <div className="flex items-start gap-1.5 mt-0.5 text-slate-800 font-medium">
                <MapPin size={13} className="text-rose-500 shrink-0 mt-0.5" />
                <span className="break-words leading-tight">{customer.address}</span>
              </div>
            </div>

            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                วันที่ต้องการรับสินค้า
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-semibold truncate">
                <Calendar size={12} className="text-blue-600 shrink-0" />
                <span className="truncate">{customer.requestedDate}</span>
              </div>
            </div>

            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                ความถี่ในการสั่งซื้อ
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-semibold truncate">
                <Clock size={12} className="text-emerald-600 shrink-0" />
                <span className="truncate">{customer.frequency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Area & Route Section */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Truck size={14} className="text-blue-600" /> พื้นที่จัดส่งและ Route
            </span>
            <button
              onClick={() => onActionClick('ดูรายละเอียด Route', customer)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <span>รายละเอียด</span>
              <ExternalLink size={10} />
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-22 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
              <img
                src={customer.routeMapUrl || '/assets/route_map.jpg'}
                alt="Route thumbnail"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-xs space-y-1 min-w-0">
              <div>
                {customer.isRegularRoute ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    อยู่ในพื้นที่ส่งประจำ ({customer.routeCode})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full">
                    <AlertCircle size={10} />
                    อยู่นอกสายส่งประจำ (ส่งพิจารณา)
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-600 truncate">
                <span className="font-semibold text-slate-700">พื้นที่ส่ง:</span>{' '}
                {customer.province} ({customer.district})
              </div>
              <div className="text-[11px] text-slate-600 truncate">
                <span className="font-semibold text-slate-700">รอบส่ง:</span> {customer.routeDays}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                รถควบคุมอุณหภูมิห้องเย็น A&C Fleet
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Customer Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Tag ของลูกค้า ({tags.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCardModalOpen(true)}
                className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                title="จัดการ Tag 4 หมวด & ตรวจสอบลูกค้ารายซ้ำ (สไลด์ 5)"
              >
                <span>Tag 4 หมวด (Slide 5)</span>
              </button>
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>เพิ่ม Tag</span>
              </button>
            </div>
          </div>

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

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors"
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              รายการสินค้าที่สนใจ ({customer.interestedProducts.length})
            </span>
            <button
              onClick={() => onActionClick('เพิ่มสินค้า', customer)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <Plus size={12} />
              <span>เพิ่มสินค้า</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-2.5">สินค้า</th>
                  <th className="py-2 px-1 text-center">รูป</th>
                  <th className="py-2 px-1.5 text-right">จำนวน</th>
                  <th className="py-2 px-1.5 text-right">ราคา</th>
                  <th className="py-2 px-2 text-right">ยอดรวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.interestedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-2.5 font-medium text-slate-900">
                      <div className="truncate max-w-[120px]">{p.name}</div>
                      {p.subName && (
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[110px]">
                          {p.subName}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <img
                        src={p.imageUrl || '/assets/pork_belly.jpg'}
                        alt={p.name}
                        className="w-7 h-7 rounded object-cover mx-auto border border-slate-200"
                      />
                    </td>
                    <td className="py-2 px-1.5 text-right font-semibold text-slate-800 whitespace-nowrap">
                      {p.qty}
                    </td>
                    <td className="py-2 px-1.5 text-right text-slate-600 whitespace-nowrap">
                      {p.unitPrice}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-emerald-700 whitespace-nowrap">
                      {p.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2.5 p-2 bg-amber-50/90 border border-amber-200/90 rounded-lg text-[11px] text-amber-900 leading-snug flex items-start gap-1.5">
            <CheckCircle2 size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ตรงตามตารางส่งประจำ:</span>{' '}
              {customer.interestedProducts[0]?.note ||
                'จัดส่งโดยรถห้องเย็น A&C Fleet มีรอบส่งตรงกับวันที่ระบุ'}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer Actions */}
      <div className="sticky bottom-0 z-10 p-3 bg-slate-50 border-t border-slate-200 space-y-2 shadow-sm shrink-0">
        <button
          onClick={() => onActionClick('ส่งเข้า LINE กลุ่มทีมขาย', customer)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          <Send size={13} />
          <span>ส่งเข้า LINE กลุ่มทีมขาย</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onActionClick('สร้างใบเสนอราคา (PDF)', customer)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all shadow-2xs"
          >
            <FileText size={12} className="text-slate-500" />
            <span>ใบเสนอราคา (PDF)</span>
          </button>
          <button
            onClick={() => onActionClick('สร้าง Sales Order', customer)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all shadow-2xs"
          >
            <ShoppingCart size={12} className="text-slate-500" />
            <span>สร้าง Sales Order</span>
          </button>
        </div>
      </div>

      {/* Customer Card & Tag Rules Modal (Slide 5) */}
      <CustomerCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        customer={customer}
        onUpdateCustomerTags={setTags}
      />
    </div>
  );
};
