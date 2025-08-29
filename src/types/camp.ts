export type CampVariant = {
  id: string;
  name: string;
  description: string;
  price?: number; // Сделаем цену опциональной
};

export type CampStatus = 'active' | 'archived';

export type Camp = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: CampType;
  status: CampStatus; // Статус кэмпа
  price?: number; // Опциональная базовая цена, если нет вариантов
  variants?: CampVariant[]; // Массив вариантов
  organizerId: string; // ID организатора
  image?: string;
  campUrl: string; // Ссылка на кэмп (обязательное поле)
  directBooking: boolean; // Прямое бронирование на сайте
  features: string[];
  difficulty?: CampDifficulty;
  ageGroup?: string;
  included: string[];
  createdAt: Date;
  updatedAt: Date;
};

// Импортируем тип из новой системы управления типами
import { CampType as CampTypeEntity } from './campType';

// Для обратной совместимости оставляем строковый тип
export type CampType = string;

export type CampDifficulty = 'начинающий' | 'средний' | 'продвинутый' | 'экспертный';

export type CreateCampData = Omit<Camp, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCampData = Partial<CreateCampData>; 