import { apiClient } from "@/lib/api"
import { 
  Customer, 
  CustomerSegment, 
  LoyaltyProgram, 
  CommunicationCampaign
} from "@/lib/types/customer"

export interface CustomerFilters {
  search?: string
  segment?: string
  loyaltyTier?: string
  status?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newCustomers: number
  totalRevenue: number
  averageOrderValue: number
  loyaltyMembers: number
  segmentDistribution: Record<string, number>
}

export interface SegmentCriteria {
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

export interface CampaignMetrics {
  openRate?: number
  clickRate?: number
  deliveryRate?: number
  bounceRate?: number
  unsubscribeRate?: number
}

export class CustomerAPI {
  // Customer Management
  static async getCustomers(filters?: CustomerFilters, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.segment && { segment: filters.segment }),
      ...(filters?.loyaltyTier && { loyaltyTier: filters.loyaltyTier }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.tags && { tags: filters.tags.join(',') }),
      ...(filters?.dateRange && { 
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end 
      })
    })

    return apiClient.get(`/customers?${params}`)
  }

  static async getCustomer(id: string) {
    return apiClient.get(`/customers/${id}`)
  }

  static async createCustomer(customer: Omit<Customer, 'id' | 'registrationDate'>) {
    return apiClient.post('/customers', customer)
  }

  static async updateCustomer(id: string, updates: Partial<Customer>) {
    return apiClient.put(`/customers/${id}`, updates)
  }

  static async deleteCustomer(id: string) {
    return apiClient.delete(`/customers/${id}`)
  }

  static async getCustomerStats(): Promise<CustomerStats> {
    const response = await apiClient.get<CustomerStats>('/customers/stats')
    return response.data
  }

  static async getCustomerPurchaseHistory(customerId: string, page = 1, limit = 20) {
    return apiClient.get(`/customers/${customerId}/purchases?page=${page}&limit=${limit}`)
  }

  static async getCustomerActivity(customerId: string, page = 1, limit = 20) {
    return apiClient.get(`/customers/${customerId}/activity?page=${page}&limit=${limit}`)
  }

  // Customer Segments
  static async getSegments() {
    return apiClient.get('/customer-segments')
  }

  static async getSegment(id: string) {
    return apiClient.get(`/customer-segments/${id}`)
  }

  static async createSegment(segment: Omit<CustomerSegment, 'id' | 'createdAt' | 'customerCount'>) {
    return apiClient.post('/customer-segments', segment)
  }

  static async updateSegment(id: string, updates: Partial<CustomerSegment>) {
    return apiClient.put(`/customer-segments/${id}`, updates)
  }

  static async deleteSegment(id: string) {
    return apiClient.delete(`/customer-segments/${id}`)
  }

  static async getSegmentCustomers(segmentId: string, page = 1, limit = 20) {
    return apiClient.get(`/customer-segments/${segmentId}/customers?page=${page}&limit=${limit}`)
  }

  static async refreshSegment(segmentId: string) {
    return apiClient.post(`/customer-segments/${segmentId}/refresh`)
  }

  // Loyalty Programs
  static async getLoyaltyPrograms() {
    return apiClient.get('/loyalty-programs')
  }

  static async getLoyaltyProgram(id: string) {
    return apiClient.get(`/loyalty-programs/${id}`)
  }

  static async createLoyaltyProgram(program: Omit<LoyaltyProgram, 'id'>) {
    return apiClient.post('/loyalty-programs', program)
  }

  static async updateLoyaltyProgram(id: string, updates: Partial<LoyaltyProgram>) {
    return apiClient.put(`/loyalty-programs/${id}`, updates)
  }

  static async deleteLoyaltyProgram(id: string) {
    return apiClient.delete(`/loyalty-programs/${id}`)
  }

  static async getLoyaltyStats(programId?: string) {
    const url = programId ? `/loyalty-programs/${programId}/stats` : '/loyalty-programs/stats'
    return apiClient.get(url)
  }

  static async addLoyaltyPoints(customerId: string, points: number, reason: string) {
    return apiClient.post(`/customers/${customerId}/loyalty/points`, {
      points,
      reason
    })
  }

  static async redeemLoyaltyReward(customerId: string, rewardId: string) {
    return apiClient.post(`/customers/${customerId}/loyalty/redeem`, {
      rewardId
    })
  }

  // Communication Campaigns
  static async getCampaigns(filters?: { type?: string; status?: string }, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.status && { status: filters.status })
    })

    return apiClient.get(`/campaigns?${params}`)
  }

  static async getCampaign(id: string) {
    return apiClient.get(`/campaigns/${id}`)
  }

  static async createCampaign(campaign: Omit<CommunicationCampaign, 'id' | 'createdAt' | 'sentDate'>) {
    return apiClient.post('/campaigns', campaign)
  }

  static async updateCampaign(id: string, updates: Partial<CommunicationCampaign>) {
    return apiClient.put(`/campaigns/${id}`, updates)
  }

  static async deleteCampaign(id: string) {
    return apiClient.delete(`/campaigns/${id}`)
  }

  static async sendCampaign(id: string) {
    return apiClient.post(`/campaigns/${id}/send`)
  }

  static async scheduleCampaign(id: string, scheduledDate: string) {
    return apiClient.post(`/campaigns/${id}/schedule`, {
      scheduledDate
    })
  }

  static async getCampaignMetrics(id: string): Promise<CampaignMetrics> {
    const response = await apiClient.get<CampaignMetrics>(`/campaigns/${id}/metrics`)
    return response.data
  }

  static async getCampaignStats() {
    return apiClient.get('/campaigns/stats')
  }

  // Bulk Operations
  static async bulkUpdateCustomers(customerIds: string[], updates: Partial<Customer>) {
    return apiClient.post('/customers/bulk-update', {
      customerIds,
      updates
    })
  }

  static async bulkDeleteCustomers(customerIds: string[]) {
    return apiClient.post('/customers/bulk-delete', {
      customerIds
    })
  }

  static async exportCustomers(filters?: CustomerFilters, format: 'csv' | 'xlsx' = 'csv') {
    const params = new URLSearchParams({
      format,
      ...(filters?.search && { search: filters.search }),
      ...(filters?.segment && { segment: filters.segment }),
      ...(filters?.loyaltyTier && { loyaltyTier: filters.loyaltyTier }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.tags && { tags: filters.tags.join(',') }),
      ...(filters?.dateRange && { 
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end 
      })
    })

    return apiClient.get(`/customers/export?${params}`, {
      responseType: 'blob'
    })
  }

  static async importCustomers(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post('/customers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // Analytics and Reporting
  static async getCustomerAnalytics(dateRange?: { start: string; end: string }) {
    const params = dateRange ? new URLSearchParams({
      startDate: dateRange.start,
      endDate: dateRange.end
    }) : new URLSearchParams()

    return apiClient.get(`/analytics/customers?${params}`)
  }

  static async getSegmentAnalytics(segmentId: string, dateRange?: { start: string; end: string }) {
    const params = new URLSearchParams()
    if (dateRange) {
      params.append('startDate', dateRange.start)
      params.append('endDate', dateRange.end)
    }

    return apiClient.get(`/analytics/segments/${segmentId}?${params}`)
  }

  static async getLoyaltyAnalytics(programId?: string, dateRange?: { start: string; end: string }) {
    const params = new URLSearchParams()
    if (programId) params.append('programId', programId)
    if (dateRange) {
      params.append('startDate', dateRange.start)
      params.append('endDate', dateRange.end)
    }

    return apiClient.get(`/analytics/loyalty?${params}`)
  }

  static async getCampaignAnalytics(campaignId?: string, dateRange?: { start: string; end: string }) {
    const params = new URLSearchParams()
    if (campaignId) params.append('campaignId', campaignId)
    if (dateRange) {
      params.append('startDate', dateRange.start)
      params.append('endDate', dateRange.end)
    }

    return apiClient.get(`/analytics/campaigns?${params}`)
  }

  // Customer Preferences and Settings
  static async updateCustomerPreferences(customerId: string, preferences: Customer['preferences']) {
    return apiClient.put(`/customers/${customerId}/preferences`, preferences)
  }

  static async updateCommunicationPreferences(customerId: string, communication: Customer['preferences']['communication']) {
    return apiClient.put(`/customers/${customerId}/communication-preferences`, communication)
  }

  static async addCustomerTag(customerId: string, tag: string) {
    return apiClient.post(`/customers/${customerId}/tags`, { tag })
  }

  static async removeCustomerTag(customerId: string, tag: string) {
    return apiClient.delete(`/customers/${customerId}/tags/${tag}`)
  }

  static async addCustomerNote(customerId: string, note: string) {
    return apiClient.post(`/customers/${customerId}/notes`, { note })
  }

  static async updateCustomerNote(customerId: string, noteId: string, note: string) {
    return apiClient.put(`/customers/${customerId}/notes/${noteId}`, { note })
  }

  static async deleteCustomerNote(customerId: string, noteId: string) {
    return apiClient.delete(`/customers/${customerId}/notes/${noteId}`)
  }
}

export default CustomerAPI
