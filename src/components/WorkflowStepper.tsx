import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export interface StepperStep {
  step: string;
  title: string;
  sub: string;
  status: 'completed' | 'active' | 'upcoming';
}

const STEPS: StepperStep[] = [
  { step: '00', title: 'ค้นหาข้อมูลเก่า', sub: 'เช็ค Tag Route', status: 'completed' },
  { step: '01', title: 'ตรวจสอบจังหวัด', sub: 'พื้นที่จัดส่ง', status: 'active' },
  { step: '02', title: 'สอบถามความต้องการ', sub: 'สินค้า/จำนวน/วันส่ง', status: 'upcoming' },
  { step: '03', title: 'นำเสนอประเภทธุรกิจ', sub: 'เงื่อนไขการค้า', status: 'upcoming' },
  { step: '04', title: 'ส่งรูปสินค้าและราคา', sub: 'แจกแจงยอดรวม', status: 'upcoming' },
  { step: '05', title: 'ยืนยันคำสั่งซื้อ', sub: 'เปิดรหัส CV', status: 'upcoming' },
  { step: '06', title: 'ส่งให้ทีมขาย', sub: 'วางแผนจัดส่ง', status: 'upcoming' },
];

interface WorkflowStepperProps {
  currentStep?: string;
  onStepClick?: (step: string) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep = '01',
  onStepClick,
}) => {
  const currentStepNum = parseInt(currentStep, 10);

  return (
    <div className="py-2 px-4 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 select-none">
      <div className="flex items-center min-w-max gap-1">
        {STEPS.map((s, idx) => {
          const stepNum = parseInt(s.step, 10);
          const isCurrent = s.step === currentStep;
          const isCompleted = stepNum < currentStepNum;

          return (
            <React.Fragment key={s.step}>
              <button
                onClick={() => onStepClick && onStepClick(s.step)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-semibold ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/80 border border-emerald-200 text-slate-700 hover:bg-emerald-100/60'
                    : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {/* Indicator icon / badge */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check size={11} strokeWidth={3} /> : s.step}
                </div>

                {/* Step Titles */}
                <div className="leading-tight">
                  <div
                    className={`text-[11px] whitespace-nowrap ${
                      isCurrent ? 'text-white font-bold' : 'text-slate-800 font-medium'
                    }`}
                  >
                    {s.title}
                  </div>
                  <div
                    className={`text-[9px] whitespace-nowrap ${
                      isCurrent ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {s.sub}
                  </div>
                </div>
              </button>

              {idx < STEPS.length - 1 && (
                <ChevronRight size={13} className="text-slate-300 shrink-0 mx-0.5" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
