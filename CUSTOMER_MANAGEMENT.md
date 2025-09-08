# Customer Management System

A comprehensive customer management system for the Joantees admin dashboard with advanced features for customer profiles, segmentation, loyalty programs, and communication campaigns.

## Features Overview

### 🧑‍💼 Customer Profiles
- **Complete Customer Information**: Contact details, address, preferences, and personal information
- **Purchase History**: Detailed order history with item breakdowns and status tracking
- **Loyalty Tracking**: Points, tier status, and reward redemption history
- **Activity Timeline**: Complete activity log including purchases, logins, and interactions
- **Preferences Management**: Size, color, brand, and category preferences
- **Communication Settings**: Email, SMS, and push notification preferences

### 📊 Customer Segmentation
- **Dynamic Segments**: Automatically updated customer groups based on criteria
- **Flexible Criteria**: Filter by spending, order count, last purchase date, loyalty tier, and tags
- **Pre-built Segments**: Frequent buyers, high-value customers, inactive customers, VIP customers
- **Custom Segments**: Create your own segments with specific criteria
- **Real-time Updates**: Segments automatically update as customer behavior changes

### 🎁 Loyalty Programs
- **Tier-based System**: Bronze, Silver, Gold, and Platinum tiers with increasing benefits
- **Quarterly Programs**: Structured quarterly loyalty programs with clear start/end dates
- **Flexible Rewards**: Discounts, free shipping, gifts, and cashback options
- **Points Management**: Earn and redeem points with detailed tracking
- **Program Analytics**: Comprehensive reporting on program performance

### 📧 Communication Tools
- **Email Campaigns**: Create and manage email marketing campaigns
- **SMS Campaigns**: Send targeted SMS messages to customer segments
- **Campaign Scheduling**: Schedule campaigns for optimal delivery times
- **Performance Tracking**: Open rates, click rates, delivery rates, and engagement metrics
- **Template Management**: Reusable campaign templates for consistent messaging

## File Structure

```
app/customers/
├── page.tsx                    # Main customer management dashboard
├── [id]/
│   └── page.tsx               # Individual customer profile page
├── segments/
│   └── page.tsx               # Customer segmentation management
├── loyalty/
│   └── page.tsx               # Loyalty program management
└── communications/
    └── page.tsx               # Communication campaigns

lib/
├── types/
│   └── customer.ts            # TypeScript interfaces for customer data
└── api/
    └── customer.ts            # API client for customer operations

components/
└── app-sidebar.tsx            # Updated with customer management navigation
```

## Data Models

### Customer Interface
```typescript
interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  address: Address
  preferences: CustomerPreferences
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
```

### Customer Segment Interface
```typescript
interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria
  customerCount: number
  createdAt: string
}
```

### Loyalty Program Interface
```typescript
interface LoyaltyProgram {
  id: string
  name: string
  description: string
  type: 'quarterly' | 'annual' | 'custom'
  startDate: string
  endDate: string
  tiers: LoyaltyTier[]
  rewards: LoyaltyReward[]
  isActive: boolean
}
```

### Communication Campaign Interface
```typescript
interface CommunicationCampaign {
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
```

## API Endpoints

### Customer Management
- `GET /customers` - List customers with filtering and pagination
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer information
- `DELETE /customers/:id` - Delete customer
- `GET /customers/stats` - Get customer statistics

### Customer Segments
- `GET /customer-segments` - List all segments
- `POST /customer-segments` - Create new segment
- `PUT /customer-segments/:id` - Update segment
- `DELETE /customer-segments/:id` - Delete segment
- `GET /customer-segments/:id/customers` - Get customers in segment

### Loyalty Programs
- `GET /loyalty-programs` - List loyalty programs
- `POST /loyalty-programs` - Create new program
- `PUT /loyalty-programs/:id` - Update program
- `POST /customers/:id/loyalty/points` - Add loyalty points
- `POST /customers/:id/loyalty/redeem` - Redeem loyalty reward

### Communication Campaigns
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create new campaign
- `POST /campaigns/:id/send` - Send campaign
- `POST /campaigns/:id/schedule` - Schedule campaign
- `GET /campaigns/:id/metrics` - Get campaign metrics

## Usage Examples

### Creating a Customer Segment
```typescript
import { CustomerAPI } from '@/lib/api/customer'

const segment = await CustomerAPI.createSegment({
  name: "High Value Customers",
  description: "Customers who spent $500+",
  criteria: {
    totalSpent: { min: 500 }
  }
})
```

### Sending a Campaign
```typescript
const campaign = await CustomerAPI.createCampaign({
  name: "Welcome New Customers",
  type: "email",
  subject: "Welcome to Joantees!",
  content: "Thank you for joining us...",
  targetSegment: "new_customers"
})

await CustomerAPI.sendCampaign(campaign.id)
```

### Adding Loyalty Points
```typescript
await CustomerAPI.addLoyaltyPoints("customer-id", 100, "Purchase bonus")
```

## Navigation

The customer management system is accessible through the main sidebar navigation:

1. **Customers** - Main dashboard with customer overview and management
2. **Customer Segments** - Create and manage customer segments
3. **Loyalty Programs** - Manage loyalty programs and rewards
4. **Communications** - Create and send marketing campaigns

## Key Features

### Dashboard Overview
- Total customers, active customers, loyalty members
- Average order value and growth metrics
- Quick access to recent activities

### Customer Profile
- Complete customer information with editable fields
- Purchase history with detailed order breakdowns
- Loyalty status and available rewards
- Activity timeline and communication preferences
- Notes and tags for customer management

### Segmentation
- Pre-built segments for common use cases
- Custom segment creation with flexible criteria
- Real-time customer count updates
- Bulk operations on segment members

### Loyalty Management
- Tier-based loyalty system
- Quarterly program structure
- Flexible reward types (discounts, gifts, shipping)
- Comprehensive analytics and reporting

### Communication Tools
- Email and SMS campaign creation
- Campaign scheduling and automation
- Performance tracking and analytics
- Template management for consistency

## Future Enhancements

- **Advanced Analytics**: Customer lifetime value, churn prediction, RFM analysis
- **Automation**: Automated email sequences, birthday campaigns, re-engagement flows
- **Integration**: CRM integration, social media management, review management
- **Mobile App**: Customer-facing mobile app for loyalty program management
- **AI Features**: Personalized recommendations, predictive analytics, chatbot integration

## Getting Started

1. Navigate to the Customers section in the admin dashboard
2. Explore the main dashboard to understand customer metrics
3. Create your first customer segment based on your business needs
4. Set up a loyalty program to encourage repeat purchases
5. Create and send your first communication campaign

The system is designed to be intuitive and powerful, providing all the tools needed for comprehensive customer relationship management.
