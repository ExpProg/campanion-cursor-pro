export type CampType = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCampTypeData = {
  name: string;
  description: string;
  color: string;
  icon?: string;
};

export type UpdateCampTypeData = {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}; 