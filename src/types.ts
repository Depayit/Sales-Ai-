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
}

export interface WorkflowStep {
  step: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
}
