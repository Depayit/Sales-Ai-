import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Bot,
  User,
  Users,
  KeyRound,
  FileCheck2,
  Check,
} from 'lucide-react';
import { DECISION_RIGHTS_RULES } from '../mockData';

interface DecisionRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionRightsModal: React.FC<DecisionRightsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredRules =
    selectedRole === 'ALL'
      ? DECISION_RIGHTS_RULES
      : DECISION_RIGHTS_RULES.filter((r) => r.role === selectedRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-3 md:p-6 animate-fade-in select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  Decision Rights | ใครมีสิทธิ์ทำอะไร (กฎควบคุมร่วมทุก JD)
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  APPROVED ADDITIONS • Slide 29
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                กำหนดขอบเขตอำนาจและการตัดสินใจในระบบ Sales AI Automation OS Phase 1 สำหรับ AI, ลูกค้า, ฝ่ายขาย, ผู้จัดการ และเจ้าหน้าที่ CV
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

        {/* Role Selector Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-2 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              selectedRole === 'ALL'
                ? 'border-b-blue-600 text-blue-600'
                : 'border-b-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด (5 บทบาท)
          </button>
          <button
            onClick={() => setSelectedRole('AI')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedRole === 'AI'
                ? 'border-b-blue-600 text-blue-600'
                : 'border-b-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot size={13} className="text-purple-600" />
            <span>AI</span>
          </button>
          <button
            onClick={() => setSelectedRole('Customer')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedRole === 'Customer'
                ? 'border-b-blue-600 text-blue-600'
                : 'border-b-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={13} className="text-blue-600" />
            <span>ลูกค้า</span>
          </button>
          <button
            onClick={() => setSelectedRole('Sales')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedRole === 'Sales'
                ? 'border-b-blue-600 text-blue-600'
                : 'border-b-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={13} className="text-emerald-600" />
            <span>ฝ่ายขาย</span>
          </button>
          <button
            onClick={() => setSelectedRole('Manager')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedRole === 'Manager'
                ? 'border-b-blue-600 text-blue-600'
                : 'border-b-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound size={13} className="text-amber-600" />
            <span>ผู้จัดการ</span>
          </button>
          <button
            onClick={() => setSelectedRole('CV_Staff')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedRole === 'CV_Staff'
                ? 'border-b-blue-600 text-blue-600'
                : 'border-b-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 size={13} className="text-indigo-600" />
            <span>เจ้าหน้าที่ CV</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {/* Summary Matrix Grid from Slide 29 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <span>ตารางสรุปหน้าที่และการตัดสินใจหลัก (Summary Matrix)</span>
              <span className="text-[10px] text-slate-400">ควบคุมร่วมทุก JD 01 - JD 06</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/80">
                <div className="font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                  <Bot size={13} />
                  <span>AI</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-snug">
                  รับข้อมูล / คัดกรอง / แนะนำ / ร่าง / แจ้งเตือนภายใต้กฎอนุมัติ
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/80">
                <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                  <User size={13} />
                  <span>ลูกค้า</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-snug">
                  กดยืนยันออเดอร์ด้วยตนเองผ่านหน้าสรุปบนมือถือ
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <Users size={13} />
                  <span>ฝ่ายขาย</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  ตรวจสต็อกนอกระบบ / ราคาตามสิทธิ์ / ยืนยันยอดมัดจำจริง
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80">
                <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <KeyRound size={13} />
                  <span>ผู้จัดการ</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Tag / Buying DNA framework / Cut-off / แคมเปญ / อนุมัติแผนรถ
                </p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200/80">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                  <FileCheck2 size={13} />
                  <span>เจ้าหน้าที่ CV</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-snug">
                  เปิด CV ในโปรแกรมเดิมหลังตรวจเอกสาร
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Role Cards */}
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <div
                key={rule.role}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{rule.roleName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Role: {rule.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{rule.description}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Allowed Actions */}
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70 space-y-1.5">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>สิ่งที่ทำได้ (Allowed Actions)</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {rule.allowedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prohibited Actions / Safeguards */}
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/70 space-y-1.5">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-rose-600" />
                      <span>ข้อห้ามเด็ดขาด (Prohibited Actions / Guardrails)</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {rule.prohibitedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <X size={12} className="text-rose-600 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>ทุกกระบวนการมี Human-in-the-loop เพื่อความแม่นยำ 100%</span>
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
