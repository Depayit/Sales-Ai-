import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Trash2,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  FileCheck,
  Check,
  Info,
} from 'lucide-react';
import type { PriceTier } from '../types';

export interface SandboxMessage {
  id: string;
  sender: 'ai' | 'customer' | 'sales';
  time: string;
  text?: string;
  cardType?: 'text' | 'map' | 'product_pricing' | 'doc_request' | 'doc_upload' | 'order_summary' | 'sales_handoff';
  cardData?: {
    mapTitle?: string;
    mapZone?: string;
    mapDesc?: string;
    productTitle?: string;
    productImage?: string;
    priceTiers?: PriceTier[];
    recommendedTier?: string;
    totalAmount?: string;
    docType?: string;
    docImage?: string;
    docName?: string;
    summaryLines?: { label: string; value: string }[];
  };
  aiReasoning?: {
    ruleTriggered: string;
    stage: string;
    detectedIntent: string;
    decisionRightRule: string;
    routeStatus?: 'in_route' | 'out_of_route';
  };
}

interface ChatSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConversationStage =
  | 'INITIAL'             // ยังไม่มีการคุย
  | 'LOCATION_ASKED'      // AI ถามพื้นที่แล้ว
  | 'LOCATION_VERIFIED'   // ทราบพื้นที่แล้ว AI ถามสินค้า/จำนวน
  | 'PRODUCT_PRESENTED'   // ส่งรูปและราคาแล้ว รอคอนเฟิร์ม
  | 'CV_REQUESTED'        // ขอเอกสารเปิด CV
  | 'ORDER_FINALIZED';    // สรุปและส่งต่อฝ่ายขายแล้ว

export const ChatSandboxModal: React.FC<ChatSandboxModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Messages array - INITIALLY EMPTY as requested
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentStage, setCurrentStage] = useState<ConversationStage>('INITIAL');
  const [customerContext, setCustomerContext] = useState<{
    province?: string;
    district?: string;
    routeCode?: string;
    isRegularRoute?: boolean;
    product?: string;
    quantity?: string;
    requestedDate?: string;
    hasDocuments?: boolean;
  }>({});

  const [lastReasoning, setLastReasoning] = useState<{
    ruleTriggered: string;
    stage: string;
    detectedIntent: string;
    decisionRightRule: string;
    routeStatus?: 'in_route' | 'out_of_route';
  } | null>(null);

  const [clearToast, setClearToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  if (!isOpen) return null;

  // Clear Chat function - resets to completely empty
  const handleClearChat = () => {
    setMessages([]);
    setInputText('');
    setIsAiTyping(false);
    setCurrentStage('INITIAL');
    setCustomerContext({});
    setLastReasoning(null);
    setClearToast(true);
    setTimeout(() => setClearToast(false), 2000);
  };

  // Autonomous AI Bot Logic according to Slide 3, 6, 8, 13, 17, 21, 29
  const processCustomerMessageWithAI = (userText: string) => {
    const text = userText.trim().toLowerCase();
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    setIsAiTyping(true);

    setTimeout(() => {
      let aiText = '';
      let cardType: SandboxMessage['cardType'] = undefined;
      let cardData: SandboxMessage['cardData'] = undefined;
      let newStage = currentStage;
      let reasoning = {
        ruleTriggered: '01 JD หลัก: AI รับลูกค้าผ่าน LINE OA สอบถามพื้นที่ก่อน รวบรวมข้อมูลโดยไม่ถามซ้ำ',
        stage: '01 ต้อนรับและสอบถามพื้นที่',
        detectedIntent: 'ทักทาย / สอบถามทั่วไป',
        decisionRightRule: 'AI: รับข้อมูล / คัดกรอง / แนะนำ / ร่าง ภายใต้กฎอนุมัติ (Slide 29)',
        routeStatus: undefined as 'in_route' | 'out_of_route' | undefined,
      };

      // 1. Detect Province & Location Check (Slide 3 & 6)
      const isKhonKaen = text.includes('ขอนแก่น') || text.includes('น้ำพอง') || text.includes('อุดร') || text.includes('โคราช');
      const isBKK = text.includes('กทม') || text.includes('กรุงเทพ') || text.includes('สะพานสูง') || text.includes('รามคำแหง');
      const isChiangMai = text.includes('เชียงใหม่') || text.includes('ลำพูน');
      const isOutOfRoute = text.includes('ดอนเมือง') || text.includes('สรงประภา') || text.includes('อยุธยา') || text.includes('ต่างจังหวัดนอกเขต') || text.includes('นอกเขต');

      // 2. Detect Product & Quantity keywords
      const hasPorkBelly = text.includes('สามชั้น') || text.includes('เศษสามชั้น') || text.includes('หมูกรอบ');
      const hasRibs = text.includes('ซี่โครง') || text.includes('กระดูกหมู');
      const hasQty = text.includes('กก') || text.includes('กิโล') || text.includes('โล') || /\d+/.test(text);

      // 3. Detect Documents / CV / Confirmation
      const hasDocs = text.includes('บัตร') || text.includes('บัตรประชาชน') || text.includes('หนังสือรับรอง') || text.includes('โลเคชัน') || text.includes('พิกัด') || text.includes('maps');
      const isConfirming = text.includes('ยืนยัน') || text.includes('สั่งเลย') || text.includes('เปิด cv') || text.includes('เปิดรหัส') || text.includes('ตกลง') || text.includes('เอาเลย');

      // STATE MACHINE DECISION LOGIC:
      if (hasDocs || currentStage === 'CV_REQUESTED') {
        // STEP 5 & 6: Customer provided documents or confirmation
        newStage = 'ORDER_FINALIZED';
        setCustomerContext((prev) => ({ ...prev, hasDocuments: true }));

        reasoning = {
          ruleTriggered: '04 & 05 JD หลัก: AI ตรวจความครบถ้วน ร่างคำขอเปิด CV และส่งสรุปออเดอร์เข้า LINE ทีมขาย',
          stage: '05 & 06 ยืนยันคำสั่งซื้อ + ส่งต่อทีมขาย',
          detectedIntent: 'ส่งเอกสารเปิด CV / ยืนยันข้อมูล',
          decisionRightRule: 'ฝ่ายขาย: ตรวจสต็อกนอกระบบ / ยืนยันยอดมัดจำจริง | AI ไม่รับปากวันจัดส่งแทนฝ่ายขาย',
          routeStatus: customerContext.isRegularRoute === false ? 'out_of_route' : 'in_route',
        };

        aiText = `ขอบคุณมากค่ะ! AI ได้รับเอกสารและข้อมูลจัดส่งครบถ้วนเรียบร้อยแล้วค่ะ ✅\n\n📋 สรุปการดำเนินงาน:\n• รหัสคำขอเปิด CV ชั่วคราว: CUST-${new Date().getFullYear()}03-088\n• สถานะ: รวบรวมเอกสารครบ ส่งสรุปเข้า LINE กลุ่มฝ่ายขาย A&C\n• เงื่อนไขการชำระ: เก็บเงินปลายทาง (COD) / โอนเมื่อตรวจรับสินค้า\n\nเจ้าหน้าที่ฝ่ายขายประจำสายจะตรวจสอบสต็อกสินค้าและติดต่อกลับเพื่อยืนยันคำสั่งซื้อและวันรับสินค้าอย่างเป็นทางการค่ะ`;

        cardType = 'order_summary';
        cardData = {
          summaryLines: [
            { label: 'รหัสคำขอเปิด CV', value: 'CUST-202603-088 (รอฝ่ายขายออกรหัสในระบบ)' },
            { label: 'สินค้าที่สั่งซื้อ', value: customerContext.product || 'เศษสามชั้น (สำหรับทำหมูกรอบ)' },
            { label: 'ปริมาณ / ยอดรวม', value: `${customerContext.quantity || '500 กก.'} (34,000 บาท)` },
            { label: 'พื้นที่จัดส่ง', value: customerContext.province || 'ขอนแก่น (ในพื้นที่ส่งประจำ R1)' },
            { label: 'สถานะงานส่งต่อ', value: 'ส่งเข้ากลุ่ม LINE ทีมขายแล้ว (รอฝ่ายขายคอนเฟิร์มสต็อก)' },
          ],
        };
      } else if (isConfirming || currentStage === 'PRODUCT_PRESENTED') {
        // STEP 4 -> 5: Customer confirms product / requests CV registration (Slide 17)
        newStage = 'CV_REQUESTED';

        reasoning = {
          ruleTriggered: '04 JD หลัก: AI แจ้งเงื่อนไขการค้าที่อนุมัติ ตรวจ CV เดิม รวบรวมเอกสารและข้อมูลเปิด CV',
          stage: '04 แจ้งเงื่อนไขการค้าและเปิดรหัสลูกค้า (CV)',
          detectedIntent: 'ยืนยันสั่งซื้อ / ขอเปิดรหัสลูกค้า CV',
          decisionRightRule: 'AI: ตรวจความครบถ้วนและร่างข้อความ LINE | เจ้าหน้าที่ CV: เปิดในโปรแกรมขายเดิมหลังตรวจเอกสาร',
          routeStatus: customerContext.isRegularRoute === false ? 'out_of_route' : 'in_route',
        };

        aiText = `ยินดีอย่างยิ่งค่ะ! ทางเราจำหน่ายแบบขายส่งโดยตรงจากโรงเชือด A&C พร้อมส่งฟรีตามรอบรถห้องเย็นค่ะ\n\nก่อนเริ่มเปิดออเดอร์ รบกวนขอเอกสารและข้อมูลเปิดรหัสลูกค้า (CV) ดังนี้นะคะ:\n1. 🪪 รูปถ่ายบัตรประชาชน (เจ้าของ/ผู้มีอำนาจ)\n2. 🏢 หนังสือรับรองบริษัท (กรณีนิติบุคคล)\n3. 📍 ที่อยู่จัดส่ง หรือ ลิงก์พิกัด Google Maps\n4. 📞 ชื่อและเบอร์โทรศัพท์ผู้รับสินค้าหน้างานค่ะ`;

        cardType = 'doc_request';
        cardData = {
          docName: 'เอกสารเปิดรหัสลูกค้าใหม่ (CV Registration)',
          docType: 'บัตรประชาชน / หนังสือรับรอง / พิกัด Google Maps',
        };
      } else if ((hasPorkBelly || hasRibs || hasQty) && (customerContext.province || isKhonKaen || isBKK || isChiangMai || isOutOfRoute)) {
        // STEP 3 -> 4: Customer specified product and quantity (Slide 13 & 15)
        newStage = 'PRODUCT_PRESENTED';
        const productName = hasRibs ? 'ซี่โครงหมูแผ่นสแปร์ริบส์' : 'เศษสามชั้น (สำหรับทำหมูกรอบ)';
        const qtyStr = text.match(/\d+/)?.[0] ? `${text.match(/\d+/)?.[0]} กก.` : '500 กก.';
        const unitPrice = hasRibs ? 160 : 68;

        setCustomerContext((prev) => ({
          ...prev,
          product: productName,
          quantity: qtyStr,
          province: prev.province || (isKhonKaen ? 'ขอนแก่น' : isOutOfRoute ? 'ดอนเมือง (กรุงเทพฯ)' : 'กรุงเทพมหานคร'),
        }));

        reasoning = {
          ruleTriggered: '03 JD หลัก: AI นำเสนอเฉพาะสินค้าและสื่อที่ตรงความต้องการ อ้างอิงราคาอนุมัติจาก Quotation Program (ห้ามเดาราคาเอง)',
          stage: '03 นำเสนอสินค้าและสื่อการขาย',
          detectedIntent: 'ระบุสินค้าและปริมาณที่ต้องการสั่งซื้อ',
          decisionRightRule: 'โหมด A: AI ส่งรูปและราคาที่อนุมัติให้ใช้ได้ทันที | ฝ่ายขาย: อนุมัติราคาพิเศษรายกรณี',
          routeStatus: customerContext.isRegularRoute === false ? 'out_of_route' : 'in_route',
        };

        aiText = `ได้รับข้อมูลแล้วค่ะ นี่คือภาพสินค้าจริงและตารางราคาส่งตามปริมาณที่ได้รับอนุมัติจาก Quotation Program ค่ะ:\n\n• สินค้า: ${productName}\n• ปริมาณที่สนใจ: ${qtyStr}\n• เรทราคาที่ได้รับ: ${unitPrice} บาท/กก.\n• มูลค่ารวมโดยประมาณ: ${(unitPrice * 500).toLocaleString()} บาท\n\nสินค้ารายการนี้พร้อมส่งฟรีด้วยรถห้องเย็น A&C Fleet ลูกค้าสนใจยืนยันยอดนี้เพื่อเปิดรหัสลูกค้า (CV) เลยไหมคะ?`;

        cardType = 'product_pricing';
        cardData = {
          productTitle: `${productName} (เกรดสด มาตรฐาน A&C)`,
          productImage: '/assets/pork_belly.jpg',
          priceTiers: [
            { range: '1 - 199 กก.', pricePerKg: unitPrice + 24 },
            { range: '200 - 499 กก.', pricePerKg: unitPrice + 20 },
            { range: '500 กก. ขึ้นไป', pricePerKg: unitPrice },
          ],
          recommendedTier: `สำหรับคำสั่งซื้อ ${qtyStr} ราคา ${unitPrice} บาท/กก.`,
          totalAmount: `มูลค่ารวม: ${(unitPrice * 500).toLocaleString()} บาท (จัดส่งฟรี)`,
        };
      } else if (isOutOfRoute) {
        // RULE SLIDE 3 & 6 & 8: OUT OF ROUTE - Do NOT reject automatically! Send to sales!
        newStage = 'LOCATION_VERIFIED';
        setCustomerContext((prev) => ({
          ...prev,
          province: 'ดอนเมือง (กรุงเทพฯ)',
          isRegularRoute: false,
          routeCode: 'OUT_ROUTE',
        }));

        reasoning = {
          ruleTriggered: 'กฎสำคัญ Slide 3 & 6: อยู่นอกเส้นทางต้องเสนอให้ฝ่ายขายพิจารณา ไม่ตัดลูกค้าออก; ไม่ปฏิเสธอัตโนมัติ',
          stage: '01 & 02 ตรวจสอบพื้นที่ & Route Master',
          detectedIntent: 'ระบุพื้นที่ (อยู่นอกสายส่งประจำ)',
          decisionRightRule: 'ฝ่ายขาย: พิจารณาลูกค้านอก Route, ข้อมูลขัดแย้ง และข้อยกเว้น | AI: ห้ามปฏิเสธลูกค้าเอง',
          routeStatus: 'out_of_route',
        };

        aiText = `สวัสดีค่ะคุณลูกค้า ตรวจสอบพิกัดพื้นที่แล้ว ⚠️ บริเวณดอนเมืองอยู่นอกสายส่งรถห้องเย็นประจำค่ะ\n\nแต่ทางเราไม่ได้ปฏิเสธอัตโนมัตินะคะ! โดยระบบ AI ได้บันทึกโปรไฟล์และส่งข้อมูลให้ฝ่ายขายพิจารณาจัดรอบพ่วงพิเศษหรือประสานจุดส่งใกล้เคียงให้แล้วค่ะ\n\nตอนนี้สนใจเป็นสินค้าประเภทไหน ปริมาณกี่กิโลกรัมคะ เพื่อให้ฝ่ายขายคำนวณและประเมินรอบจัดส่งให้ค่ะ`;

        cardType = 'map';
        cardData = {
          mapTitle: 'ผลการตรวจสอบ Route: อยู่นอกสายส่งประจำ',
          mapZone: 'โซนพิเศษ: รอฝ่ายขายพิจารณารอบพ่วง',
          mapDesc: 'ระบบบันทึกข้อมูลเข้าสู่ Lead Profile และส่งต่อทีมขายตามกฎ JD 01 ไม่ตัดสิทธิ์ลูกค้า',
        };
      } else if (isKhonKaen || isBKK || isChiangMai) {
        // STEP 1 -> 2: In Route Verified (Slide 3 & 4)
        newStage = 'LOCATION_VERIFIED';
        const zoneName = isKhonKaen ? 'ขอนแก่น (สาย R1)' : isChiangMai ? 'เชียงใหม่ (สาย R5)' : 'กรุงเทพฯ-ปริมณฑล (สาย R4)';
        const routeDays = isKhonKaen ? 'จันทร์ / พุธ / ศุกร์' : isChiangMai ? 'รอบกลางคืน จ./พ./ศ.' : 'อังคาร / พฤหัสบดี / เสาร์';

        setCustomerContext((prev) => ({
          ...prev,
          province: isKhonKaen ? 'ขอนแก่น' : isChiangMai ? 'เชียงใหม่' : 'กรุงเทพฯ',
          isRegularRoute: true,
          routeCode: isKhonKaen ? 'R1' : isChiangMai ? 'R5' : 'R4',
        }));

        reasoning = {
          ruleTriggered: '01 JD หลัก: เทียบ Route Master และสอบถามสินค้า จำนวน และวันต้องการรับ (Slide 3 & 6)',
          stage: '01 ตรวจสอบพื้นที่ & Route Master',
          detectedIntent: 'ระบุพื้นที่ (อยู่ในพื้นที่ส่งประจำ)',
          decisionRightRule: 'AI: รับข้อมูล ตรวจสอบ Route และแนะนำข้อมูล | ไม่ยืนยันวันส่งเอง',
          routeStatus: 'in_route',
        };

        aiText = `ขอบคุณค่ะ ตรวจสอบพื้นที่แล้ว 🟢 อยู่ในพื้นที่จัดส่งประจำ (${zoneName}) สามารถจัดส่งได้แน่นอนค่ะ!\n\n• รอบส่งประจำ: ทุกวัน${routeDays}\n• ควบคุมอุณหภูมิห้องเย็น: -18°C ถึง 4°C ส่งตรงถึงหน้าร้าน\n\nตอนนี้ลูกค้าสนใจสินค้าประเภทอะไรคะ เช่น เศษสามชั้น, ซี่โครงหมู, สันนอก และต้องการปริมาณประมาณกี่กิโลกรัมคะ?`;

        cardType = 'map';
        cardData = {
          mapTitle: `พื้นที่จัดส่งครอบคลุม: ${zoneName}`,
          mapZone: `สายจัดส่งประจำ ${isKhonKaen ? 'R1' : isChiangMai ? 'R5' : 'R4'}`,
          mapDesc: `มีรอบรถห้องเย็นประจำทุกวัน${routeDays} ถึงหน้าร้านช่วงเช้า`,
        };
      } else {
        // INITIAL GREETING - Ask for location first (Slide 3 & 6)
        newStage = 'LOCATION_ASKED';

        reasoning = {
          ruleTriggered: '01 ขอบเขตหน้าที่ 1: ต้อนรับผ่าน LINE OA และสอบถามจังหวัด/พื้นที่ก่อน (Slide 3)',
          stage: '01 ต้อนรับและขอจังหวัด/พื้นที่',
          detectedIntent: 'ทักทายครั้งแรก',
          decisionRightRule: 'AI: รับข้อมูลลูกค้าผ่าน LINE OA ตรวจสอบจังหวัดและสอบถามความต้องการ',
          routeStatus: undefined,
        };

        aiText = `สวัสดีค่ะ ยินดีต้อนรับสู่ A&C Foods Supply ค่ะ 😊\nเราเป็นผู้จัดจำหน่ายเนื้อหมูสดคุณภาพ ชิ้นส่วนตัดแต่ง และเนื้อหมูแปรรูปขายส่ง สำหรับร้านอาหาร โรงแรม และโรงงานแปรรูปค่ะ\n\nเพื่อให้ข้อมูลรอบรถจัดส่งที่ถูกต้อง ไม่ทราบว่าร้านหรือจุดส่งของลูกค้าอยู่ จังหวัด และ อำเภอ อะไรคะ?`;
      }

      setCurrentStage(newStage);
      setLastReasoning(reasoning);

      const aiReplyMsg: SandboxMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        time: nowTime,
        text: aiText,
        cardType,
        cardData,
        aiReasoning: reasoning,
      };

      setMessages((prev) => [...prev, aiReplyMsg]);
      setIsAiTyping(false);
    }, 750);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const userMsg: SandboxMessage = {
      id: `user-${Date.now()}`,
      sender: 'customer',
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    processCustomerMessageWithAI(userText);
  };

  // Quick preset trigger for rapid testing
  const handleTriggerPreset = (promptText: string) => {
    const userMsg: SandboxMessage = {
      id: `user-${Date.now()}`,
      sender: 'customer',
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    processCustomerMessageWithAI(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-3 md:p-6 animate-fade-in select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              🧪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  ห้องแชทจำลองสำหรับทดสอบ (LINE OA Simulation Sandbox)
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  AI Autonomous Chatbot • Live Testing
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ทดสอบการโต้ตอบของ AI Sales Bot อัตโนมัติตามกฎ 6 JD: ถามพื้นที่ก่อน, เทียบ Route Master, เสนอราคาอนุมัติ และขอเอกสารเปิด CV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Chat Button */}
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs border border-rose-500/50"
              title="ล้างข้อความทั้งหมดในห้องแชท เพื่อเริ่มทดสอบใหม่"
            >
              <Trash2 size={13} />
              <span>ล้างแชท (Clear)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="ปิดหน้าต่าง"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Clear Toast Notification */}
        {clearToast && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-rose-800 animate-fade-in shrink-0">
            <Trash2 size={14} className="text-rose-600" />
            <span>ล้างข้อความแชทเรียบร้อยแล้ว แชทกลับสู่สถานะว่างเปล่า พร้อมเริ่มการทดสอบใหม่</span>
          </div>
        )}

        {/* Main 2-Column Sandbox Layout */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-100">
          {/* Left Column: Interactive Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50/70 border-r border-slate-200 min-w-0">
            {/* Chat Status Bar */}
            <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800">Sales AI Autonomous Engine:</span>
                <span className="text-[11px] text-slate-500">
                  {currentStage === 'INITIAL' && 'รอข้อความแรกของลูกค้า'}
                  {currentStage === 'LOCATION_ASKED' && 'กำลังสอบถามพื้นที่/จังหวัด'}
                  {currentStage === 'LOCATION_VERIFIED' && 'ตรวจสอบ Route เรียบร้อย ถามสินค้า/จำนวน'}
                  {currentStage === 'PRODUCT_PRESENTED' && 'ส่งรูปสินค้า & ตารางราคา Tier แล้ว'}
                  {currentStage === 'CV_REQUESTED' && 'ขอเอกสารเปิด CV (บัตร/พิกัด)'}
                  {currentStage === 'ORDER_FINALIZED' && 'สรุปออเดอร์ส่งต่อ LINE ฝ่ายขายแล้ว'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>ข้อความ: {messages.length}</span>
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
              {/* EMPTY STATE DISPLAY (When messages.length === 0) */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-500">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-blue-600">
                    <Bot size={28} />
                  </div>

                  <div className="max-w-md space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      ห้องแชทว่างเปล่า พร้อมสำหรับการทดสอบ AI
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      แชทนี้จำลองลูกค้าทักเข้ามาทาง LINE OA เพื่อทดสอบว่า AI จะตอบกลับอย่างชาญฉลาดตามกฎระเบียบของระบบหรือไม่ พิมพ์ข้อความหรือเลือกสถานการณ์จำลองด้านล่างได้ทันทีค่ะ
                    </p>
                  </div>

                  {/* Scenario Quick Buttons */}
                  <div className="w-full max-w-lg space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      เลือกบททดสอบสำเร็จรูป (Quick Scenarios):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      <button
                        onClick={() => handleTriggerPreset('สวัสดีครับ สนใจสั่งหมูสามชั้น')}
                        className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-xs text-slate-700 shadow-2xs group flex items-start gap-2"
                      >
                        <span className="text-base">🟢</span>
                        <div>
                          <strong className="block text-slate-900 group-hover:text-blue-600">1. ทักทายเริ่มต้น</strong>
                          <span className="text-[10px] text-slate-400">ทดสอบ AI ขอจังหวัด/พื้นที่ก่อน</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTriggerPreset('อยู่ขอนแก่นครับ อยากได้เศษสามชั้น 500 กิโล ส่งวันที่ 20 นี้')}
                        className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all text-xs text-slate-700 shadow-2xs group flex items-start gap-2"
                      >
                        <span className="text-base">📍</span>
                        <div>
                          <strong className="block text-slate-900 group-hover:text-emerald-600">2. ใน Route R1 ขอนแก่น</strong>
                          <span className="text-[10px] text-slate-400">ตรวจ Route ผ่าน + แจ้งราคา Tier</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTriggerPreset('ร้านอยู่ซอยสรงประภา ดอนเมือง สั่งคอหมู 150 โล ส่งได้ไหมครับ')}
                        className="p-2.5 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl transition-all text-xs text-slate-700 shadow-2xs group flex items-start gap-2"
                      >
                        <span className="text-base">⚠️</span>
                        <div>
                          <strong className="block text-slate-900 group-hover:text-amber-600">3. อยู่นอก Route ปกติ</strong>
                          <span className="text-[10px] text-slate-400">ทดสอบกฎห้ามปฏิเสธ ส่งต่อฝ่ายขาย</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTriggerPreset('ตกลงสั่งยอดนี้เลยครับ แนบรูปบัตรประชาชนและโลเคชันหน้าร้านแล้ว')}
                        className="p-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all text-xs text-slate-700 shadow-2xs group flex items-start gap-2"
                      >
                        <span className="text-base">📋</span>
                        <div>
                          <strong className="block text-slate-900 group-hover:text-purple-600">4. เปิด CV & ส่งต่อทีมขาย</strong>
                          <span className="text-[10px] text-slate-400">ตรวจเอกสาร + ส่งสรุปเข้ากลุ่ม LINE</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MESSAGE THREAD */}
              {messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCustomer && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <Bot size={15} />
                      </div>
                    )}

                    <div className={`max-w-[85%] md:max-w-[75%] space-y-1.5`}>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">
                          {isCustomer ? '👤 คุณ (จำลองลูกค้า LINE OA)' : '🤖 Sales AI Bot (Autonomous)'}
                        </span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>

                      {/* Text Bubble */}
                      {msg.text && (
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-2xs ${
                            isCustomer
                              ? 'bg-blue-600 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* Rich Cards Render */}
                      {msg.cardType === 'map' && msg.cardData && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                          <div className="flex items-center justify-between text-blue-900 font-bold border-b border-slate-100 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-rose-500" />
                              <span>{msg.cardData.mapTitle}</span>
                            </span>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                              Route Master
                            </span>
                          </div>
                          <div className="font-semibold text-slate-800">{msg.cardData.mapZone}</div>
                          <p className="text-[11px] text-slate-500">{msg.cardData.mapDesc}</p>
                        </div>
                      )}

                      {msg.cardType === 'product_pricing' && msg.cardData && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                            <span>{msg.cardData.productTitle}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Quotation Program
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <img
                              src={msg.cardData.productImage || '/assets/pork_belly.jpg'}
                              alt="product preview"
                              className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="text-[11px] font-bold text-blue-700">
                                {msg.cardData.recommendedTier}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {msg.cardData.totalAmount}
                              </div>
                            </div>
                          </div>

                          {/* Price Tiers */}
                          {msg.cardData.priceTiers && (
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px] space-y-1">
                              <span className="font-semibold text-slate-600 block">ตารางราคาส่งตามปริมาณ:</span>
                              <div className="grid grid-cols-3 gap-1 text-center">
                                {msg.cardData.priceTiers.map((t, idx) => (
                                  <div key={idx} className="p-1 bg-white rounded border border-slate-200">
                                    <div className="text-slate-400">{t.range}</div>
                                    <div className="font-bold text-slate-800">{t.pricePerKg} ฿/กก.</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {msg.cardType === 'doc_request' && msg.cardData && (
                        <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-xs space-y-2">
                          <div className="font-bold text-purple-900 flex items-center gap-1.5">
                            <FileCheck size={14} className="text-purple-600" />
                            <span>{msg.cardData.docName}</span>
                          </div>
                          <p className="text-[11px] text-purple-800">
                            เอกสารที่ต้องส่ง: บัตรประชาชน (หรือหนังสือรับรอง) + ปักหมุดพิกัด Google Maps หน้าร้าน
                          </p>
                        </div>
                      )}

                      {msg.cardType === 'order_summary' && msg.cardData?.summaryLines && (
                        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-2">
                          <div className="font-bold text-emerald-900 flex items-center justify-between border-b border-emerald-200/60 pb-1">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              <span>สรุปออเดอร์และการส่งต่องาน (Order Handoff)</span>
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              Phase 1 Complete
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            {msg.cardData.summaryLines.map((line, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-slate-500">{line.label}:</span>
                                <span className="font-bold text-slate-800 text-right">{line.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isCustomer && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <User size={15} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isAiTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 animate-fade-in pl-1">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Bot size={13} />
                  </div>
                  <div className="px-3 py-2 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-600">AI กำลังประมวลผลคำตอบ...</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="พิมพ์ข้อความทดสอบคุยกับ AI (เช่น 'สวัสดีครับ อยู่ขอนแก่น ต้องการเศษสามชั้น 500 กิโล')..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  inputText.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>ส่งข้อความ</span>
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Right Column: AI Autonomous Reasoning & Logic Inspector */}
          <div className="w-80 h-full shrink-0 flex flex-col bg-white border-l border-slate-200 overflow-y-auto p-4 space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900">
                  AI Autonomous Reasoning (ตัวตรวจสอบตรรกะ)
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                ติดตามการทำงานและเงื่อนไขทางธุรกิจที่ AI นำมาตัดสินใจ
              </p>
            </div>

            {/* Current Reasoning State */}
            {lastReasoning ? (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    ขั้นตอนการทำงาน (Stage)
                  </span>
                  <div className="font-bold text-slate-900">{lastReasoning.stage}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    กฎที่ถูกทริกเกอร์ (Rule Triggered)
                  </span>
                  <div className="text-[11px] font-semibold text-slate-800 leading-snug">
                    {lastReasoning.ruleTriggered}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    Decision Rights (Slide 29)
                  </span>
                  <div className="text-[11px] text-purple-900 leading-snug">
                    {lastReasoning.decisionRightRule}
                  </div>
                </div>

                {lastReasoning.routeStatus && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                      lastReasoning.routeStatus === 'in_route'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    {lastReasoning.routeStatus === 'in_route' ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>อยู่ในพื้นที่ส่งประจำ (ให้บริการทันที)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span>อยู่นอก Route (ส่งฝ่ายขายพิจารณา ไม่ตัดลูกค้า)</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-1">
                <Info size={16} className="mx-auto text-slate-300" />
                <p>ยังไม่มีการประมวลผลคำตอบ เริ่มต้นพิมพ์เพื่อดูตรรกะ AI</p>
              </div>
            )}

            {/* Checklist of 6 Core Business Rules */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block">
                กฎเหล็ก 6 ข้อของระบบขาย AI (Slide 3-29):
              </span>
              <div className="space-y-1.5 text-[10px] text-slate-600">
                <div className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50">
                  <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ข้อ 1:</strong> ถามจังหวัด/พื้นที่ก่อนเทียบ Route Master</span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50">
                  <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ข้อ 2:</strong> นอก Route ส่งต่อฝ่ายขาย ห้ามปฏิเสธอัตโนมัติ</span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50">
                  <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ข้อ 3:</strong> อ้างอิงราคาอนุมัติ Quotation ห้ามเดาราคาเอง</span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50">
                  <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ข้อ 4:</strong> ขอเอกสารเปิด CV ยืนยันตัวตน แยกบริษัท A&C/TD</span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50">
                  <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ข้อ 5:</strong> AI ห้ามรับปากวันจัดส่งแทนฝ่ายขาย</span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50">
                  <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ข้อ 6:</strong> ร่าง Warehouse Plan ส่ง LINE สิ้นสุดที่ ผจก. อนุมัติ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
