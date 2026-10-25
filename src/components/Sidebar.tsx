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
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  const coreModules = [
    {
      id: '01',
      title: '01 รับลูกค้าและบันทึกข้อมูล',
      sub: 'AI Lead Reception',
      icon: Inbox,
      badge: 'Active',
    },
    {
      id: '02',
      title: '02 วิเคราะห์ความต้องการและคัดกรองลูกค้า',
      sub: 'AI Lead Qualification',
      icon: UserCheck,
      badge: 'ถัดไป',
    },
    {
      id: '03',
      title: '03 นำเสนอสินค้าและสื่อการขาย',
      sub: 'AI Product Presentation',
      icon: ShoppingBag,
      badge: '',
    },
    {
      id: '04',
      title: '04 แจ้งเงื่อนไขการค้าและเปิด CV',
      sub: 'Trading Terms & CV',
      icon: FileText,
      badge: '',
    },
    {
      id: '05',
      title: '05 ยืนยันคำสั่งซื้อ + PO ภายใน',
      sub: 'Order Confirmation & PO',
      icon: FileCheck2,
      badge: '',
    },
    {
      id: '06',
      title: '06 สรุปออเดอร์ + แผนจัดรถให้คลัง',
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
    <aside className="main-sidebar flex flex-col justify-between select-none">
      {/* Top Logo Header */}
      <div>
        <div className="sidebar-brand flex items-center gap-3">
          <div className="logo-box flex items-center justify-center">
            <span className="logo-a text-white font-bold text-xl tracking-tight">A</span>
            <div className="sparkle-dot" />
          </div>
          <div className="brand-text">
            <div className="brand-name flex items-center gap-1.5 font-bold text-white text-base leading-tight">
              <span>Sales AI</span>
              <Sparkles size={13} className="text-sky-400" />
            </div>
            <div className="brand-sub text-xs text-slate-400 font-medium">Automation OS</div>
          </div>
        </div>

        {/* Core Modules 01-06 */}
        <div className="menu-group-label">6 โมดูลหลัก (Core JDs)</div>
        <nav className="sidebar-nav space-y-0.5">
          {coreModules.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`sidebar-nav-item flex items-center justify-between w-full text-left transition-all ${
                  isActive ? 'active' : ''
                }`}
                title={item.title}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`nav-icon-wrap shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    <Icon size={16} />
                  </div>
                  <span className="nav-title truncate block font-medium text-[12px] leading-tight">
                    {item.title}
                  </span>
                </div>
                {item.badge && (
                  <span
                    className={`module-pill text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0 ml-1 ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-slate-700/80 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        {/* General Management Menus */}
        <div className="menu-group-label">ระบบจัดการทั่วไป</div>
        <nav className="sidebar-nav space-y-0.5">
          {generalMenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`sidebar-nav-item flex items-center gap-2 w-full text-left transition-all ${
                  isActive ? 'active' : ''
                }`}
                title={item.title}
              >
                <div className="nav-icon-wrap text-slate-400 shrink-0">
                  <Icon size={16} />
                </div>
                <span className="nav-title truncate text-[12px] font-medium text-slate-300">{item.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer info */}
      <div className="sidebar-footer">
        <div className="company-badge-box">
          <div className="company-badge text-xs font-semibold text-slate-200">
            A&C Foods | ไทยแบล็ค | KC Express
          </div>
          <div className="version-info flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Sales AI v1.0.0</span>
            <span className="demo-tag text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/40">
              Demo Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
