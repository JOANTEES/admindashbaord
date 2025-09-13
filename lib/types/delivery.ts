export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  deliveryFee: number;
  estimatedDays: string;
  coverageAreas: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDeliveryZoneRequest {
  name: string;
  description: string;
  deliveryFee: number;
  estimatedDays: string;
  coverageAreas: string[];
}

export interface UpdateDeliveryZoneRequest {
  name?: string;
  description?: string;
  deliveryFee?: number;
  estimatedDays?: string;
  coverageAreas?: string[];
  isActive?: boolean;
}
