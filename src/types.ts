export type ModuleId = '01' | '02' | '03' | '04' | '05' | '06';

export type CustomerStatus = 'ai' | 'sales' | 'out_of_route' | 'cv_done';

export type FilterTab = 'all' | 'ai' | 'pending';

export type MediaApprovalMode = 'MODE_A' | 'MODE_B' | 'MODE_C';
export type MediaApprovalStatus = 'approved' | 'pending' | 'rejected' | 'sales_only';

export interface CustomerTag {
  id: string;
  label: string;
  category: 'route' | 'date' | 'customer' | 'product' | 'business' | 'channel' | 'custom';
  color?: string;
}

export interface InterestedProduct {
  id: string;
  name: string;
  subName?: string;
  imageUrl: string;
  qty: string;
  unitPrice: string;
  total: string;
  date: string;
  note?: string;
}

export interface PriceTier {
  range: string;
  pricePerKg: number;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'customer' | 'sales';
  time: string;
  text?: string;
  cardType?: 'text' | 'map' | 'product_pricing' | 'doc_request' | 'doc_upload' | 'order_summary';
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
}

export interface ProductSKU {
  id: string;
  skuCode: string;
  name: string;
  subName: string;
  category: string;
  description: string;
  packInfo: string;
  unit: string;
  weight: string;
  imageUrl: string;
  mediaGallery?: string[];
  brochureUrl?: string;
  standardPrices: PriceTier[];
  customerSpecificPrice?: string;
  approvalMode: MediaApprovalMode;
  approvalStatus: MediaApprovalStatus;
  matchScore?: number;
  highlightNote?: string;
}

export interface Module02Qualification {
  interestedSku: string;
  expectedQty: string;
  purpose: string;
  orderFrequency: string;
  urgentLevel: string;
  aiScore: string;
  confidence: number;
  tags: string[];
  routeFeasibility: string;
  note: string;
}

export interface MediaHistoryItem {
  id: string;
  timestamp: string;
  title: string;
  mediaType: 'image' | 'pricing' | 'brochure' | 'quotation';
  sender: 'ai' | 'sales';
  status: 'sent' | 'pending' | 'failed';
}

export interface ApprovedMediaAsset {
  id: string;
  type: 'image' | 'brochure' | 'price_sheet' | 'link';
  title: string;
  desc: string;
  url: string;
  countLabel?: string;
}

export interface CampaignCustomer {
  id: string;
  name: string;
  category: string;
  aiScore: number;
  rank: number;
  reason: string;
  recommendedProduct: string;
  recommendedPrice: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type CompanyCode = 'AC' | 'TD';

export type CVStatus =
  | 'draft'          // ร่าง
  | 'pending_sales'  // ส่งฝ่ายขาย
  | 'processing'     // กำลังดำเนินการ
  | 'need_info'      // ขอข้อมูลเพิ่ม
  | 'completed'      // เปิด CV แล้ว
  | 'rejected';      // ไม่อนุมัติ

export interface CVDocument {
  id: string;
  type: 'id_card' | 'company_cert' | 'location_map' | 'other';
  title: string;
  fileName: string;
  fileUrl: string;
  status: 'received' | 'pending_review' | 'approved' | 'rejected' | 'missing';
  uploadedAt: string;
  note?: string;
}

export interface TradingTermsData {
  company: CompanyCode;
  deliveryZoneText: string;
  isFreeDelivery: boolean;
  moq: string;
  paymentMethod: string;
  deliverySchedule: string;
  deliveryLeadTime: string;
  isOutrightSale: boolean;
  termsNotes?: string;
}

export interface CVTimelineItem {
  id: string;
  time: string;
  action: string;
  status: 'success' | 'pending' | 'warning' | 'rejected';
  operator: string;
}

export interface CVRegistrationRecord {
  company: CompanyCode;
  tempId: string;
  status: CVStatus;
  statusLabel: string;
  cvCode?: string;
  existingCvAC?: string | null;
  existingCvTD?: string | null;
  businessName: string;
  contactPerson: string;
  phone: string;
  customerType: string;
  address: string;
  googleMapsUrl: string;
  documents: CVDocument[];
  tradingTerms: TradingTermsData;
  timeline: CVTimelineItem[];
  missingFields: string[];
  staffNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  deliveryZone: string;
  routeCode: string;
  routeDays: string;
  isRegularRoute: boolean;
  requestedDate: string;
  frequency: string;
  sourceChannel: string;
  registeredAt: string;
  status: CustomerStatus;
  statusLabel: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  avatarColor: string;
  tags: CustomerTag[];
  interestedProducts: InterestedProduct[];
  chatMessages: ChatMessage[];
  routeMapUrl?: string;
  // Module 02 & 03 integrations:
  qualification?: Module02Qualification;
  mediaHistory?: MediaHistoryItem[];
  pricingRights?: {
    approvedMode: MediaApprovalMode;
    allowDiscretion: boolean;
    ruleText: string;
  };
  // Module 04 integration:
  cvRegistration?: CVRegistrationRecord;
}

export interface WorkflowStep {
  step: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
}

export type StockCheckStatus = 'pending' | 'in_stock' | 'out_of_stock' | 'partial';

export type OrderStatus =
  | 'draft'
  | 'pending_customer'
  | 'pending_stock'
  | 'confirmed'
  | 'po_generated'
  | 'in_sales_plan'
  | 'cancelled';

export interface OrderItem {
  id: string;
  skuCode: string;
  name: string;
  subName?: string;
  quantity: number;
  unit: string;
  weightKg: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

export interface InternalPO {
  poNumber: string;
  orderId: string;
  company: CompanyCode;
  createdAt: string;
  createdBy: string;
  approvedBy: string;
  totalAmount: number;
  totalWeightKg: number;
  status: 'draft' | 'approved' | 'sent_to_plan';
  pdfFileName: string;
}

export interface OrderRecord {
  id: string; // e.g. ORD-2026-001
  customerId: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  company: CompanyCode;
  cvCode: string;
  orderDate: string;
  requestedDeliveryDate: string;
  routeCode: string;
  routeDays: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  totalWeightKg: number;
  customerConfirmation: {
    isConfirmed: boolean;
    confirmedAt?: string;
    method?: 'mobile_summary' | 'line';
  };
  stockCheck: {
    status: StockCheckStatus;
    checkedBy?: string;
    checkedAt?: string;
    notes?: string;
  };
  salesConfirmation: {
    isConfirmed: boolean;
    confirmedBy?: string;
    confirmedAt?: string;
    orderRef?: string;
  };
  internalPO?: InternalPO;
  status: OrderStatus;
  customerNotes?: string;
}

export interface SalesPlanSummary {
  company: CompanyCode;
  date: string;
  routeCode: string;
  orderCount: number;
  totalWeightKg: number;
  totalAmount: number;
  status: 'draft' | 'sales_approved' | 'submitted_to_manager';
  approvedBy?: string;
  submittedAt?: string;
  orders: OrderRecord[];
}
