import React from 'react';
import { Bot, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { WORKFLOW_STEPS } from '../mockData';

interface HeaderProps {
  currentStep?: string;
  onStepClick?: (stepNumber: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentStep = '01', onStepClick }) => {
  return (
    <header className="main-header border-b border-slate-200 bg-white">
      {/* Top Header Bar */}
      <div className="header-top-row flex items-center justify-between px-6 py-3.5">
        {/* Module Title & Subtitle */}
        <div className="header-title-group flex items-center gap-3">
          <div className="module-number-badge flex items-center justify-center font-bold text-white bg-blue-600 rounded-lg text-sm shadow-sm w-8 h-8">
            01
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                01 รับลูกค้าและบันทึกข้อมูล (AI Lead Reception)
              </h1>
              <span className="phase-badge text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Phase 1 : AI Autonomous + Human Approval
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ตอบกลับลูกค้าผ่าน LINE OA ตรวจสอบพื้นที่/เชื่อมต่อข้อมูลเดิม เพื่อส่งต่อและแจ้งเตือนตามเงื่อนไขอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Right Status Badges & Profile */}
        <div className="header-meta-group flex items-center gap-4">
          {/* AI Status Badge */}
          <div className="status-badge-card flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="ai-status-icon bg-emerald-500 text-white rounded-full p-1 flex items-center justify-center">
              <Bot size={13} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <span>AI ทำงานอัตโนมัติ 90%</span>
                <span className="live-pulse-dot" />
              </div>
              <div className="text-[10px] text-emerald-600">ช่วยลดเวลาคัดกรอง 90% · ส่งต่อทันที</div>
            </div>
          </div>

          {/* LINE OA Status Badge */}
          <div className="status-badge-card flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>เชื่อมต่อ LINE OA</span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/80 px-1 rounded">
                  Demo
                </span>
              </div>
              <div className="text-[10px] text-slate-500">รับ-ส่งข้อความและเอกสารอัตโนมัติ</div>
            </div>
          </div>

          {/* User Profile */}
          <div className="user-profile-widget flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="avatar-circle w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shadow-xs">
              <User size={15} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">คุณแอน</div>
              <div className="text-[11px] text-slate-500">ฝ่ายขาย / ผู้ดูแล</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Stepper Bar */}
      <div className="stepper-bar-wrap px-5 py-2 bg-slate-50 border-t border-slate-100 overflow-hidden">
        <div className="stepper-container flex items-center justify-between gap-1 w-full">
          {WORKFLOW_STEPS.map((s, index) => {
            const isStepActive = s.step === currentStep;
            const isStepCompleted = s.isCompleted;

            return (
              <React.Fragment key={s.step}>
                <div
                  onClick={() => onStepClick && onStepClick(s.step)}
                  className={`step-item flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                    isStepActive
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700'
                      : isStepCompleted
                      ? 'bg-emerald-50 border border-emerald-200 text-slate-700'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`step-badge text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center justify-center ${
                      isStepActive
                        ? 'bg-blue-800 text-white'
                        : isStepCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isStepCompleted ? <CheckCircle2 size={10} /> : s.step}
                  </div>
                  <div className="step-text leading-tight text-left min-w-0 truncate">
                    <div
                      className={`text-[11px] font-semibold truncate ${
                        isStepActive ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {s.title}
                    </div>
                    <div
                      className={`text-[9px] truncate ${
                        isStepActive ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {s.subtitle}
                    </div>
                  </div>
                </div>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
};
