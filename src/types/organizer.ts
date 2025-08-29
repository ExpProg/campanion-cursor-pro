export interface Organizer {
  id: string;
  name: string;
  email?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  color?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateOrganizerData = Omit<Organizer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOrganizerData = Partial<CreateOrganizerData>; 