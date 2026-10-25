import React from 'react';
import { CheckCircle2, Info, X, Send, FileText, ShoppingCart, AlertCircle } from 'lucide-react';
import type { Customer } from '../types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actionType: string;
  customer?: Customer;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  title,
  actionType,
  customer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              {actionType.includes('LINE') ? (
                <Send size={15} />
              ) : actionType.includes('PDF') ? (
                <FileText size={15} />
              ) : actionType.includes('Order') ? (
                <ShoppingCart size={15} />
              ) : (
                <Info size={15} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                จำลองการทำงาน (Demo Simulation)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 text-xs text-slate-600 space-y-3">
          {actionType.includes('LINE') && customer && (
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">ส่งข้อมูลสรุปเข้า LINE กลุ่มทีมขายสำเร็จ!</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    แจ้งเตือนส่งต่อ Lead Profile ของ <span className="font-semibold">{customer.name}</span> ให้ทีมขายประจำสาย {customer.routeCode} ({customer.province}) เรียบร้อยแล้ว
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                <div>[LINE Sales Notification]:</div>
                <div>• ร้าน: {customer.name} ({customer.contactPerson})</div>
                <div>• เบอร์: {customer.phone}</div>
                <div>• สินค้า: {customer.interestedProducts[0]?.name}</div>
                <div>• จำนวน: {customer.interestedProducts[0]?.qty} ({customer.interestedProducts[0]?.total})</div>
                <div>• วันต้องการ: {customer.requestedDate}</div>
              </div>
            </div>
          )}

          {actionType.includes('PDF') && customer && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
                <FileText size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">สร้างใบเสนอราคาจำลอง (Quotation Draft)</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    ระบบดึงราคาส่งจาก Quotation Program สำหรับ {customer.name} ยอดรวม {customer.interestedProducts[0]?.total}
                  </div>
                </div>
              </div>
              <p className="text-slate-500 text-[11px]">
                ตามขอบเขต Phase 1 ในเอกสาร สิทธิ์การส่งราคาอย่างเป็นทางการจะดำเนินการในโมดูล 03 นำเสนอสินค้าและสื่อการขาย
              </p>
            </div>
          )}

          {actionType.includes('Order') && customer && (
            <div className="space-y-2">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 flex items-start gap-2.5">
                <ShoppingCart size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">ส่งต่อข้อมูลเข้าสู่กระบวนการสร้างออเดอร์</div>
                  <div className="text-[11px] text-purple-700 mt-0.5">
                    ข้อมูลจะถูกส่งต่อไปยังโมดูล 05 (ยืนยันคำสั่งซื้อ + PO ภายใน) หลังผ่านการเปิดรหัส CV ในโมดูล 04
                  </div>
                </div>
              </div>
            </div>
          )}

          {actionType.includes('module') && (
            <div className="space-y-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">โมดูลนี้อยู่ในแผนพัฒนารอบถัดไป</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    ตามขอบเขตงาน Task 01 ได้กำหนดให้พัฒนาเฉพาะโครงสร้าง UI หลักและหน้าจอโมดูล 01 รับลูกค้าและบันทึกข้อมูล (AI Lead Reception) เท่านั้น
                  </div>
                </div>
              </div>
            </div>
          )}

          {actionType.includes('route') && customer && (
            <div className="space-y-2">
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800">
                <div className="font-bold text-xs mb-1">ข้อมูลเส้นทาง Route: {customer.routeCode}</div>
                <div className="text-[11px] space-y-1">
                  <div>• สายส่ง: {customer.deliveryZone}</div>
                  <div>• รอบส่ง: {customer.routeDays}</div>
                  <div>• ประเภทรถ: รถควบคุมอุณหภูมิห้องเย็น 6 ล้อ / 4 ล้อ</div>
                  <div>• มาตรฐานเวลา Cut-off: ส่งแผนล่วงหน้า 1 วัน ก่อน 12:00 น.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            ตกลง / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
