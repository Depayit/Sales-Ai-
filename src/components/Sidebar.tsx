import React from 'react';
import {
  Inbox,
  UserCheck,
  ShoppingBag,
  FileText,
  FileCheck2,
  Truck,
  Users,
  Calendar,
  Tag,
  Warehouse,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
}) => {
  const coreModules = [
    {
      id: '01',
      title: '01 รับลูกค้าและบันทึกข้อมูล',
      shortTitle: '01 รับลูกค้า',
      sub: 'AI Lead Reception',
      icon: Inbox,
      badge: activeModule === '01' ? 'Active' : 'เสร็จแล้ว',
    },
    {
      id: '02',
      title: '02 วิเคราะห์ความต้องการและคัดกรองลูกค้า',
      shortTitle: '02 คัดกรอง',
      sub: 'AI Lead Qualification',
      icon: UserCheck,
      badge: activeModule === '02' ? 'Active' : 'พร้อมใช้งาน',
    },
    {
      id: '03',
      title: '03 นำเสนอสินค้าและสื่อการขาย',
      shortTitle: '03 สินค้า/สื่อ',
      sub: 'AI Product Presentation',
      icon: ShoppingBag,
      badge: activeModule === '03' ? 'Active' : 'โมดูล 03',
    },
    {
      id: '04',
      title: '04 แจ้งเงื่อนไขการค้าและเปิด CV',
      shortTitle: '04 เงื่อนไข/CV',
      sub: 'Trading Terms & CV',
      icon: FileText,
      badge: '',
    },
    {
      id: '05',
      title: '05 ยืนยันคำสั่งซื้อ + PO ภายใน',
      shortTitle: '05 ยืนยัน/PO',
      sub: 'Order Confirmation & PO',
      icon: FileCheck2,
      badge: '',
    },
    {
      id: '06',
      title: '06 สรุปออเดอร์ + แผนจัดรถให้คลัง',
      shortTitle: '06 สรุป/จัดรถ',
      sub: 'Manager & Truck Plan',
      icon: Truck,
      badge: '',
    },
  ];

  const generalMenus = [
    { id: 'customers', title: 'ลูกค้าทั้งหมด', icon: Users },
    { id: 'calendar', title: 'ปฏิทินนัดหมาย', icon: Calendar },
    { id: 'products', title: 'สินค้า / ราคาขาย', icon: Tag },
    { id: 'warehouse', title: 'คลังสินค้า', icon: Warehouse },
    { id: 'reports', title: 'รายงานการขาย', icon: BarChart3 },
    { id: 'settings', title: 'ตั้งค่าระบบ', icon: Settings },
  ];

  return (
    <aside
      className={`sidebar transition-all duration-300 ease-in-out select-none flex flex-col justify-between h-screen bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & Logo */}
      <div>
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
              A
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-white text-sm tracking-tight leading-none">
                  <span>Sales AI</span>
                  <Sparkles size={12} className="text-sky-400" />
                </div>
                <div className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5">
                  Automation OS
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* 6 Core Modules */}
        <div className="px-2 pt-3 pb-1">
          {!isCollapsed && (
            <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              6 โมดูลหลัก (Core JDs)
            </div>
          )}

          <nav className="space-y-1">
            {coreModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={item.title}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate text-left text-[12px]">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ml-1 shrink-0 ${
                            isActive
                              ? 'bg-blue-700/80 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="my-2 mx-3 border-t border-slate-800/80" />

        {/* General Management Menus */}
        <div className="px-2">
          {!isCollapsed && (
            <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ระบบจัดการทั่วไป
            </div>
          )}

          <nav className="space-y-1">
            {generalMenus.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={item.title}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={17} className="shrink-0 text-slate-400" />
                  {!isCollapsed && (
                    <span className="truncate text-left text-[12px]">{item.title}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!isCollapsed ? (
          <div>
            <div className="text-[11px] font-semibold text-slate-200 truncate">
              A&C Foods | ไทยแบล็ค | KC Express
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>Sales AI v1.0.0</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo Mode
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="A&C Foods • Sales AI v1.0.0">
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
