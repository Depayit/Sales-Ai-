export type ModuleId = '01' | '02' | '03' | '04' | '05' | '06';

export type CustomerStatus = 'ai' | 'sales' | 'out_of_route' | 'cv_done';

export type FilterTab = 'all' | 'ai' | 'pending';

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
}

export interface WorkflowStep {
  step: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
}
