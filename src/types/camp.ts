export type CampVariant = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type Camp = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: CampType;
  price?: number; // Опциональная базовая цена, если нет вариантов
  variants?: CampVariant[]; // Массив вариантов
  organizer: string;
  image?: string;
  features: string[];
  difficulty: CampDifficulty;
  ageGroup: string;
  included: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CampType = 
  | 'летний' 
  | 'зимний'
  | 'языковой'
  | 'спортивный'
  | 'творческий'
  | 'технический'
  | 'приключенческий'
  | 'образовательный';

export type CampDifficulty = 'начинающий' | 'средний' | 'продвинутый' | 'экспертный';

export type CreateCampData = Omit<Camp, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCampData = Partial<CreateCampData>; 