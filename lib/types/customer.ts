export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  preferences: {
    size: string[]
    colors: string[]
    brands: string[]
    categories: string[]
    priceRange: {
      min: number
      max: number
    }
    communication: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  totalSpent: number
  totalOrders: number
  averageOrderValue: number
  lastPurchaseDate?: string
  registrationDate: string
  status: 'active' | 'inactive' | 'suspended'
  tags: string[]
  notes?: string
  avatar?: string
}

export interface PurchaseHistory {
  id: string
  customerId: string
  orderDate: string
  items: {
    id: string
    name: string
    size: string
    color: string
    price: number
    quantity: number
    image: string
  }[]
  totalAmount: number
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
  paymentMethod: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: {
    totalSpent?: {
      min?: number
      max?: number
    }
    totalOrders?: {
      min?: number
      max?: number
    }
    lastPurchaseDays?: number
    loyaltyTier?: string[]
    tags?: string[]
    registrationDays?: number
  }
  customerCount: number
  createdAt: string
}

export interface LoyaltyProgram {
  id: string
  name: string
  description: string
  type: 'quarterly' | 'annual' | 'custom'
  startDate: string
  endDate: string
  tiers: {
    name: string
    minPoints: number
    benefits: string[]
    discountPercentage: number
  }[]
  rewards: {
    id: string
    name: string
    description: string
    pointsRequired: number
    type: 'discount' | 'free_shipping' | 'gift' | 'cashback'
    value: number
    isActive: boolean
  }[]
  isActive: boolean
}

export interface CommunicationCampaign {
  id: string
  name: string
  type: 'email' | 'sms'
  subject?: string
  content: string
  targetSegment?: string
  targetCustomers?: string[]
  scheduledDate?: string
  sentDate?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  openRate?: number
  clickRate?: number
  deliveryRate?: number
  createdAt: string
}

export interface CustomerActivity {
  id: string
  customerId: string
  type: 'purchase' | 'login' | 'email_open' | 'email_click' | 'sms_sent' | 'loyalty_earned' | 'loyalty_redeemed'
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}
