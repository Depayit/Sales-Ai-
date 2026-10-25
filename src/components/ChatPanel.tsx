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
} from 'lucide-react';
import type { Customer, ChatMessage } from '../types';

interface ChatPanelProps {
  customer: Customer;
  onSendMessage?: (text: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ customer, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(customer.chatMessages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCustomerRef = useRef<string>(customer.id);

  // Update messages when customer switches and reset scroll to top
  useEffect(() => {
    setMessages(customer.chatMessages);
    if (prevCustomerRef.current !== customer.id) {
      prevCustomerRef.current = customer.id;
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

    // Scroll to bottom on user send
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Simulate AI response after short delay if appropriate
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        text: 'AI ระบบอัตโนมัติ: บันทึกข้อความและอัปเดตสถานะให้เรียบร้อยแล้วค่ะ',
      };
      setMessages((prev) => [...prev, aiReply]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, 900);
  };

  return (
    <div className="chat-panel flex flex-col h-full bg-[#f4f6f9] border-r border-slate-200">
      {/* Chat Header */}
      <div className="chat-header flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
            style={{ backgroundColor: customer.avatarColor }}
          >
            {customer.name.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {customer.name}
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {customer.isRegularRoute ? `ในพื้นที่ (${customer.routeCode})` : 'นอก Route ปกติ'}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{customer.category}</span>
              <span>•</span>
              <span className="font-mono text-slate-600">{customer.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="ค้นหาในบทสนทนา"
          >
            <Search size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="โทรติดต่อลูกค้า"
          >
            <Phone size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info size={16} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="เมนูอื่นๆ"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div ref={messagesContainerRef} className="chat-stream flex-1 overflow-y-auto p-4 space-y-3.5">
        <div className="chat-date-divider flex items-center justify-center my-2">
          <span className="text-[11px] font-medium text-slate-400 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
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
              className={`message-row flex gap-2.5 ${
                isCustomer ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Left Avatar for AI or Sales */}
              {!isCustomer && (
                <div className="shrink-0 mt-0.5">
                  {isAi ? (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Bot size={14} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ส
                    </div>
                  )}
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] ${
                  isCustomer
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                {/* Sender Tag */}
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

                {/* Main Bubble Card */}
                <div
                  className={`message-bubble p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isCustomer
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : isSales
                      ? 'bg-blue-600 text-white rounded-tl-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {/* Delivery Map Card */}
                  {msg.cardType === 'map' && msg.cardData && (
                    <div className="mb-2.5 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-slate-800">
                      <div className="relative h-28 w-full bg-slate-200 overflow-hidden">
                        <img
                          src="/assets/route_map.jpg"
                          alt="Route Map"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Truck size={10} />
                          {msg.cardData.mapZone}
                        </div>
                      </div>
                      <div className="p-2.5">
                        <div className="font-bold text-xs text-slate-900 mb-0.5">
                          {msg.cardData.mapTitle}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {msg.cardData.mapDesc}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Pricing Table Card */}
                  {msg.cardType === 'product_pricing' && msg.cardData && (
                    <div className="mb-2.5 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-slate-800">
                      {/* Product Header with Image */}
                      <div className="flex items-center gap-3 p-2.5 bg-white border-b border-slate-200">
                        <img
                          src={msg.cardData.productImage || '/assets/pork_belly.jpg'}
                          alt="Product"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {msg.cardData.productTitle}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                            คัดเกรดสด มาตรฐานฟาร์ม A&C
                          </div>
                        </div>
                      </div>

                      {/* Tiered Price Table */}
                      <div className="p-2.5">
                        <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>ตารางราคาขายส่ง (อ้างอิง Quotation Program)</span>
                          <span className="text-[10px] text-blue-600 font-medium">บาท / กก.</span>
                        </div>
                        <table className="w-full text-[11px] border border-slate-200 rounded overflow-hidden">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                              <th className="py-1 px-2 text-left font-semibold">จำนวนสั่งซื้อ</th>
                              <th className="py-1 px-2 text-right font-semibold">ราคา (บาท/กก.)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {msg.cardData.priceTiers?.map((t, idx) => {
                              const isTarget = t.range.includes('500');
                              return (
                                <tr
                                  key={idx}
                                  className={isTarget ? 'bg-blue-50/90 font-bold text-blue-900' : ''}
                                >
                                  <td className="py-1 px-2">{t.range}</td>
                                  <td className="py-1 px-2 text-right">
                                    {t.pricePerKg.toFixed(0)} บาท
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Calculation summary */}
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-center">
                          <div className="font-bold text-xs">{msg.cardData.recommendedTier}</div>
                          <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                            {msg.cardData.totalAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Upload Card */}
                  {msg.cardType === 'doc_upload' && msg.cardData && (
                    <div className="mb-2 p-2 bg-emerald-500/20 border border-white/40 rounded-xl flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white text-emerald-700 flex items-center justify-center shrink-0">
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

                  {/* Message Text with newlines */}
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>

                {/* Read status check */}
                <div
                  className={`flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 px-1 ${
                    isCustomer ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <CheckCheck size={12} className="text-emerald-500" />
                  <span>อ่านแล้ว</span>
                </div>
              </div>

              {/* Right Avatar for Customer */}
              {isCustomer && (
                <div className="shrink-0 mt-0.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
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

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="chat-input-bar p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="แนบรูปภาพสินค้า"
          >
            <ImageIcon size={18} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-sm"
          title="ส่งข้อความ"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
