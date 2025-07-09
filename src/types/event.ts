export type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: EventCategory;
  attendees: number;
  maxAttendees?: number;
  status: EventStatus;
  organizer: string;
  image?: string; // URL картинки или base64
  userId: string; // ID пользователя, который создал событие
  createdAt: Date;
  updatedAt: Date;
};

export type EventCategory = 
  | 'конференция' 
  | 'семинар' 
  | 'воркшоп' 
  | 'встреча' 
  | 'презентация' 
  | 'вебинар'
  | 'другое';

export type EventStatus = 'предстоящее' | 'проходит' | 'завершено' | 'отменено';

export type CreateEventData = Omit<Event, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateEventData = Partial<CreateEventData>; 