import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Phone,
  Info,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Send,
  Bot,
  CheckCheck,
  FileCheck,
  Sparkles,
  Truck,
  ArrowLeft,
  ZoomIn,
} from 'lucide-react';
import type { Customer, ChatMessage } from '../types';

interface ChatPanelProps {
  customer: Customer;
  onSendMessage?: (text: string) => void;
  onToggleProfileDrawer?: () => void;
  onBackToInbox?: () => void;
  showBackToInbox?: boolean;
  onOpenSandbox?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  customer,
  onSendMessage,
  onToggleProfileDrawer,
  onBackToInbox,
  showBackToInbox,
  onOpenSandbox,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(customer.chatMessages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCustomerId = useRef<string>(customer.id);

  // When customer switches, update messages and reset scroll to top
  useEffect(() => {
    setMessages(customer.chatMessages);
    if (prevCustomerId.current !== customer.id) {
      prevCustomerId.current = customer.id;
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0;
      }
    }
  }, [customer]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'sales',
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    if (onSendMessage) {
      onSendMessage(newMsg.text || '');
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // AI automated simulation reply
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        text: 'AI ระบบอัตโนมัติ: บันทึกข้อมูลและแจ้งเตือนเข้าสู่ระบบเรียบร้อยค่ะ',
      };
      setMessages((prev) => [...prev, aiReply]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, 900);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/60 overflow-hidden min-w-0">
      {/* Sticky Chat Header */}
      <div className="sticky top-0 z-10 px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {showBackToInbox && onBackToInbox && (
            <button
              onClick={onBackToInbox}
              className="md:hidden p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 mr-1"
              title="กลับไปหน้ารายชื่อ"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0"
            style={{ backgroundColor: customer.avatarColor }}
          >
            {customer.name.substring(0, 2)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                {customer.name}
              </h2>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                  customer.isRegularRoute
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-rose-700 bg-rose-50 border border-rose-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    customer.isRegularRoute ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {customer.isRegularRoute ? `ในพื้นที่ (${customer.routeCode})` : 'นอก Route ปกติ'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 truncate">
              <span className="truncate">{customer.category}</span>
              <span>•</span>
              <span className="font-mono text-slate-600">{customer.phone}</span>
            </div>
          </div>
        </div>

        {/* Action icons & Sandbox Trigger */}
        <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
          {onOpenSandbox && (
            <button
              onClick={onOpenSandbox}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer mr-1"
              title="เปิดห้องแชทจำลองสำหรับทดสอบ (Sandbox) - แชทว่างเปล่า & ล้างแชทได้"
            >
              <span>🧪</span>
              <span className="hidden sm:inline">ห้องแชททดสอบ AI</span>
            </button>
          )}

          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="ค้นหาข้อความ"
          >
            <Search size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="โทรติดต่อ"
          >
            <Phone size={16} />
          </button>

          {/* Info button (opens slide-over drawer on tablet / mobile) */}
          <button
            onClick={onToggleProfileDrawer}
            className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="ดูข้อมูลลูกค้า (CRM)"
          >
            <Info size={16} />
          </button>

          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="เพิ่มเติม"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Message Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth"
      >
        <div className="flex items-center justify-center my-2">
          <span className="text-[10px] font-medium text-slate-400 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
            วันนี้ (บันทึกอัตโนมัติผ่าน LINE OA)
          </span>
        </div>

        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const isCustomer = msg.sender === 'customer';
          const isSales = msg.sender === 'sales';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar on Left (for AI or Sales) */}
              {!isCustomer && (
                <div className="shrink-0 mt-0.5">
                  {isAi ? (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                      <Bot size={14} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      ส
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble Column */}
              <div className={`max-w-[85%] md:max-w-[78%] ${isCustomer ? 'items-end' : 'items-start'}`}>
                {/* Sender tag & time */}
                <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 font-medium">
                  {isAi ? (
                    <span className="text-blue-700 font-semibold flex items-center gap-1">
                      <Sparkles size={10} /> AI Sales Assistant
                    </span>
                  ) : isSales ? (
                    <span className="text-emerald-700 font-semibold">คุณแอน (ฝ่ายขาย)</span>
                  ) : (
                    <span className="text-slate-600 font-semibold">{customer.name}</span>
                  )}
                  <span>• {msg.time}</span>
                </div>

                {/* Message Bubble Box */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isCustomer
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : isSales
                      ? 'bg-blue-600 text-white rounded-tl-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                  }`}
                >
                  {/* Delivery Route Map Card with Clean Padding & Subtle Shadow */}
                  {msg.cardType === 'map' && msg.cardData && (
                    <div className="mb-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-slate-800">
                      <div className="relative h-36 w-full bg-slate-100 overflow-hidden group">
                        <img
                          src="/assets/route_map.jpg"
                          alt="Delivery Route Map"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Truck size={10} />
                          {msg.cardData.mapZone}
                        </div>
                        <div className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-xs text-white text-[10px] p-1 rounded-md">
                          <ZoomIn size={12} />
                        </div>
                      </div>
                      <div className="p-3 bg-white">
                        <div className="font-bold text-xs text-slate-900">
                          {msg.cardData.mapTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {msg.cardData.mapDesc}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Pricing Table Card */}
                  {msg.cardType === 'product_pricing' && msg.cardData && (
                    <div className="mb-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-slate-800">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border-b border-slate-200">
                        <img
                          src={msg.cardData.productImage || '/assets/pork_belly.jpg'}
                          alt="Product"
                          className="w-13 h-13 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {msg.cardData.productTitle}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                            เกรดสด มาตรฐานฟาร์มและโรงเชือด A&C
                          </div>
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                          <span>ตารางราคาขายส่งตามปริมาณ</span>
                          <span className="text-[10px] text-blue-600 font-semibold">บาท / กก.</span>
                        </div>

                        <table className="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                              <th className="py-1 px-2.5 text-left font-semibold">จำนวนสั่งซื้อ</th>
                              <th className="py-1 px-2.5 text-right font-semibold">ราคา (บาท/กก.)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {msg.cardData.priceTiers?.map((t, idx) => {
                              const isTarget = t.range.includes('500');
                              return (
                                <tr
                                  key={idx}
                                  className={isTarget ? 'bg-blue-50 font-bold text-blue-900' : ''}
                                >
                                  <td className="py-1 px-2.5">{t.range}</td>
                                  <td className="py-1 px-2.5 text-right font-semibold">
                                    {t.pricePerKg.toFixed(0)} บาท
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        <div className="mt-2.5 p-2 bg-blue-50/80 rounded-lg border border-blue-200 text-blue-900 text-center">
                          <div className="font-bold text-xs">{msg.cardData.recommendedTier}</div>
                          <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                            {msg.cardData.totalAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Upload Preview */}
                  {msg.cardType === 'doc_upload' && msg.cardData && (
                    <div className="mb-2 p-2.5 bg-emerald-500/20 border border-white/40 rounded-xl flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <FileCheck size={18} />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-xs text-white truncate">
                          {msg.cardData.docName}
                        </div>
                        <div className="text-[10px] text-emerald-100">{msg.cardData.docType}</div>
                      </div>
                    </div>
                  )}

                  {/* Plain Text Message */}
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                </div>

                {/* Read checkmark */}
                <div
                  className={`flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 px-1 ${
                    isCustomer ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <CheckCheck size={12} className="text-emerald-500" />
                  <span>อ่านแล้ว</span>
                </div>
              </div>

              {/* Avatar on Right (for Customer) */}
              {isCustomer && (
                <div className="shrink-0 mt-0.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                    style={{ backgroundColor: customer.avatarColor }}
                  >
                    {customer.name.substring(0, 2)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 z-10 p-3 bg-white border-t border-slate-200 flex items-center gap-2 shadow-sm shrink-0"
      >
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="แนบรูปภาพ"
          >
            <ImageIcon size={18} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="แนบเอกสาร"
          >
            <Paperclip size={18} />
          </button>
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ข้อความตอบกลับ หรือให้ AI แนะนำคำตอบ..."
          className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-xs shrink-0"
          title="ส่งข้อความ"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
