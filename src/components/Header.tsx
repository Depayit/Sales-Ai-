import React from 'react';
import { Bot, User, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  activeModule?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeModule = '01' }) => {
  const moduleInfo = {
    '01': {
      num: '01',
      title: '01 รับลูกค้าและบันทึกข้อมูล',
      sub: 'Phase 1 : AI Autonomous',
    },
    '02': {
      num: '02',
      title: '02 วิเคราะห์ความต้องการและคัดกรองลูกค้า',
      sub: 'Phase 1 : AI Lead Qualification',
    },
    '03': {
      num: '03',
      title: '03 นำเสนอสินค้าและสื่อการขาย (AI Product Presentation)',
      sub: 'Phase 1 : AI Autonomous + Media Approval',
    },
    '04': {
      num: '04',
      title: '04 แจ้งเงื่อนไขการค้าและเปิด CV',
      sub: 'Phase 1 : Trading Terms & CV',
    },
  }[activeModule] || {
    num: activeModule,
    title: `โมดูล ${activeModule}`,
    sub: 'Sales AI Automation OS',
  };

  return (
    <header className="h-13 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20">
      {/* Left: Module Title & Phase Badge */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="เปิดเมนู"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            {moduleInfo.num}
          </div>
          <div className="flex items-center gap-2 truncate">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              {moduleInfo.title}
            </h1>
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full shrink-0">
              {moduleInfo.sub}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Sleek Compact Status Pills & User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Sleek Status Pill 1: 90% AI Automation */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold">
          <Bot size={13} className="text-emerald-600" />
          <span>90% AI Automation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Sleek Status Pill 2: LINE OA Connected */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-800 hidden sm:inline">LINE OA</span>
          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 px-1 rounded">
            Demo
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            <User size={14} />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-800">คุณแอน</div>
            <div className="text-[10px] text-slate-400 font-medium">ฝ่ายขาย / ผู้ดูแล</div>
          </div>
        </div>
      </div>
    </header>
  );
};
