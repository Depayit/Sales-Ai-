import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import type { Customer } from '../types';

interface Module02QualificationProps {
  customer: Customer;
  onNavigateToModule03: () => void;
}

export const Module02Qualification: React.FC<Module02QualificationProps> = ({
  customer,
  onNavigateToModule03,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-4 select-none">
      <div className="max-w-5xl mx-auto w-full space-y-4">
        {/* Module Header Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                02
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                02 วิเคราะห์ความต้องการและคัดกรองลูกค้า (AI Lead Qualification)
              </h2>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                AI Autonomous + Human Approval
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              วิเคราะห์ความต้องการและจัดกลุ่ม Lead จากบทสนทนา เพื่อกำหนดข้อมูลที่ต้องถามต่อและการติดตาม (อ้างอิงสไลด์ 8-12)
            </p>
          </div>

          <button
            onClick={onNavigateToModule03}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
          >
            <span>ส่งต่อข้อมูล 03 เสนอสินค้าและราคา</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Customer Context Summary Banner */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                style={{ backgroundColor: customer.avatarColor }}
              >
                {customer.name.substring(0, 2)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                <div className="text-xs text-slate-500">{customer.category} • โทร {customer.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Bot size={13} className="text-emerald-600" />
                ระดับโอกาสการขาย: {customer.qualification?.aiScore || 'A - สูง (92%)'}
              </span>
            </div>
          </div>

          {/* 6 Core Qualification Dimensions (from Slide 9 & 11) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* 1. วิเคราะห์สินค้าและปริมาณ */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>1. สินค้าและปริมาณ</span>
                <span className="text-[10px] text-emerald-600 font-semibold">ยืนยันแล้ว</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">สินค้าที่สนใจ</span>
                <span className="font-bold">{customer.qualification?.interestedSku || 'เศษสามชั้น (ทำหมูกรอบ)'}</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">ปริมาณที่ต้องการ</span>
                <span>{customer.qualification?.expectedQty || '500 กก./ครั้ง'}</span>
              </div>
            </div>

            {/* 2. รูปแบบการซื้อและโอกาสซื้อประจำ */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>2. รูปแบบการซื้อ</span>
                <span className="text-[10px] text-blue-600 font-semibold">ซื้อประจำ</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">ความถี่การสั่งซื้อ</span>
                <span className="font-bold">{customer.qualification?.orderFrequency || 'ทุกสัปดาห์'}</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">วัตถุประสงค์การใช้</span>
                <span>{customer.qualification?.purpose || 'ผลิตหมูกรอบจำหน่ายหน้าร้าน'}</span>
              </div>
            </div>

            {/* 3. ตรวจสอบพื้นที่จัดส่งและความเป็นไปได้ */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>3. ความเป็นไปได้ของ Route</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                  {customer.routeCode}
                </span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">ผลการตรวจ Route</span>
                <span className="font-bold text-emerald-700">{customer.deliveryZone}</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">รอบรถประจำ</span>
                <span>{customer.routeDays}</span>
              </div>
            </div>

            {/* 4. ประเมินความเร่งด่วน */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>4. ความเร่งด่วน</span>
                <span className="text-[10px] text-slate-500 font-semibold">ปกติ</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">วันที่ต้องการรับสินค้า</span>
                <span className="font-bold">{customer.requestedDate}</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">สถานะความพร้อม</span>
                <span>ตรงรอบจัดส่ง ไม่ต้องจัดรถพิเศษ</span>
              </div>
            </div>

            {/* 5. จัด Tag ลูกค้า */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>5. Tag ประเมิน</span>
                <span className="text-[10px] text-purple-600 font-semibold">{customer.tags.length} แท็ก</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {customer.tags.map((t) => (
                  <span
                    key={t.id}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* 6. ข้อจำกัดและเงื่อนไขพิเศษ */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>6. ข้อจำกัดและข้อยกเว้น</span>
                <span className="text-[10px] text-slate-400">ไม่มีปัญหา</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">สถานที่ส่ง</span>
                <span>หน้าร้าน (มีตู้แช่เก็บเนื้อสด)</span>
              </div>
              <div className="text-slate-700">
                <span className="text-slate-400 block text-[10px] font-semibold">การชำระเงิน</span>
                <span>เก็บเงินปลายทาง / โอนก่อนรับ</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>ข้อมูลการคัดกรองครบถ้วน พร้อมส่งต่อเข้าสู่การนำเสนอสินค้าและสื่อในโมดูล 03</span>
            </div>

            <button
              onClick={onNavigateToModule03}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
            >
              <span>ส่งต่อข้อมูล 03 เสนอสินค้าและราคา</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
