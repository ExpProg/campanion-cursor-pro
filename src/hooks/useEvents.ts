'use client';

import { useState, useEffect } from 'react';
import { Event, CreateEventData, UpdateEventData } from '@/types/event';
import { sampleEvents } from '@/data/sampleEvents';
import { useAuth } from '@/contexts/AuthContext';

// Заглушка для локального хранения
const STORAGE_KEY = 'events';

export function useEvents() {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Фильтрация событий для текущего пользователя
  const events = allEvents.filter(event => event.userId === user?.uid);

  // Загрузка мероприятий из localStorage
  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents).map((event: Event) => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
        setAllEvents(parsedEvents);
      } else {
        // Если нет сохраненных мероприятий и есть пользователь, загружаем примеры с его ID
        if (user?.uid) {
          const eventsWithUserId = sampleEvents.map(event => ({
            ...event,
            userId: user.uid,
          }));
          setAllEvents(eventsWithUserId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsWithUserId));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
      // В случае ошибки загружаем примеры с ID пользователя
      if (user?.uid) {
        const eventsWithUserId = sampleEvents.map(event => ({
          ...event,
          userId: user.uid,
        }));
        setAllEvents(eventsWithUserId);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Сохранение в localStorage
  const saveToStorage = (updatedEvents: Event[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Ошибка сохранения мероприятий:', error);
    }
  };

  // Создание нового мероприятия
  const createEvent = (eventData: CreateEventData): Event | null => {
    if (!user?.uid) return null;

    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEvents = [...allEvents, newEvent];
    setAllEvents(updatedEvents);
    saveToStorage(updatedEvents);
    return newEvent;
  };

  // Обновление мероприятия
  const updateEvent = (id: string, eventData: UpdateEventData): Event | null => {
    if (!user?.uid) return null;

    const eventIndex = allEvents.findIndex(event => event.id === id && event.userId === user.uid);
    if (eventIndex === -1) return null;

    const updatedEvent: Event = {
      ...allEvents[eventIndex],
      ...eventData,
      updatedAt: new Date(),
    };

    const updatedEvents = [...allEvents];
    updatedEvents[eventIndex] = updatedEvent;
    setAllEvents(updatedEvents);
    saveToStorage(updatedEvents);
    return updatedEvent;
  };

  // Удаление мероприятия
  const deleteEvent = (id: string): boolean => {
    if (!user?.uid) return false;

    const updatedEvents = allEvents.filter(event => !(event.id === id && event.userId === user.uid));
    if (updatedEvents.length === allEvents.length) return false;

    setAllEvents(updatedEvents);
    saveToStorage(updatedEvents);
    return true;
  };

  // Получение мероприятия по ID
  const getEvent = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
  };
} 