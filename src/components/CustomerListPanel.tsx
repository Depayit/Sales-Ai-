import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Bot, AlertTriangle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Customer, FilterTab } from '../types';

interface CustomerListPanelProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: Customer) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

export const CustomerListPanel: React.FC<CustomerListPanelProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter based on active tab and search query
  const filteredCustomers = customers.filter((c) => {
    // Tab filter
    if (activeTab === 'ai' && c.status !== 'ai') return false;
    if (activeTab === 'pending' && c.status !== 'sales' && c.status !== 'out_of_route') return false;

    // Search filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="customer-list-panel flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">แชท LINE OA</h2>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {customers.length} รายการ
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <button
              className="p-1 rounded hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={14} />
            </button>
            <button
              className="p-1 rounded hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="ตัวกรองขั้นสูง"
            >
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg mb-2.5 text-center text-xs font-medium">
          <button
            onClick={() => onTabChange('all')}
            className={`py-1 rounded-md transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด (128)
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`py-1 rounded-md transition-all ${
              activeTab === 'ai'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI ดูแล (112)
          </button>
          <button
            onClick={() => onTabChange('pending')}
            className={`py-1 rounded-md transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-amber-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รอคนตอบ (16)
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, จังหวัด..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Customer List Stream */}
      <div className="customer-items-stream flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            ไม่พบรายชื่อลูกค้าที่ค้นหา
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const isSelected = cust.id === selectedCustomerId;

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust)}
                className={`customer-list-item flex items-start gap-3 p-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-l-4 border-l-blue-600 shadow-xs'
                    : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Avatar with indicator */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
                    style={{ backgroundColor: cust.avatarColor }}
                  >
                    {cust.name.substring(0, 2)}
                  </div>
                  {cust.status === 'ai' ? (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white p-0.5 rounded-full border border-white">
                      <Bot size={10} />
                    </div>
                  ) : cust.status === 'out_of_route' ? (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-rose-500 text-white p-0.5 rounded-full border border-white">
                      <AlertTriangle size={10} />
                    </div>
                  ) : (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white p-0.5 rounded-full border border-white">
                      <User size={10} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-xs truncate ${
                        isSelected ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'
                      }`}
                    >
                      {cust.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                      {cust.lastMessageTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-1.5 leading-snug">
                    {cust.lastMessage}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {cust.status === 'ai' && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          AI ดูแล
                        </span>
                      )}
                      {cust.status === 'sales' && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                          รอคนตอบ
                        </span>
                      )}
                      {cust.status === 'out_of_route' && (
                        <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          นอก Route
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 truncate max-w-[85px]">
                        {cust.province}
                      </span>
                    </div>

                    {cust.unreadCount && cust.unreadCount > 0 ? (
                      <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cust.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="panel-pagination border-t border-slate-200 p-2 flex items-center justify-between bg-slate-50 text-[11px] text-slate-600">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
          disabled={currentPage === 1}
        >
          <ChevronLeft size={13} />
        </button>

        <div className="flex items-center gap-1 font-medium">
          <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-[10px]">
            1
          </span>
          <span className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 cursor-pointer text-[10px]">
            2
          </span>
          <span className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 cursor-pointer text-[10px]">
            3
          </span>
          <span className="text-slate-400 text-[10px]">...</span>
          <span className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 cursor-pointer text-[10px]">
            13
          </span>
        </div>

        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          className="p-1 rounded hover:bg-slate-200"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};
