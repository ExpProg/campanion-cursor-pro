'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Event, CreateEventData } from '@/types/event';
import { EventCard } from '@/components/EventCard';
import { EventForm } from '@/components/EventForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function EventsPage() {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useEvents();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Фильтрация мероприятий
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateEvent = (eventData: CreateEventData) => {
    createEvent(eventData);
  };

  const handleUpdateEvent = (eventData: CreateEventData) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      setEditingEvent(null);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      const success = deleteEvent(eventId);
      if (success) {
        toast.success('Мероприятие удалено');
      } else {
        toast.error('Ошибка при удалении мероприятия');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка мероприятий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Мероприятия</h1>
            <p className="text-muted-foreground mt-2">
              Управляйте своими мероприятиями в одном месте
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Создать мероприятие
          </Button>
        </div>

        {/* Фильтры и поиск */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск мероприятий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="предстоящее">Предстоящие</SelectItem>
                  <SelectItem value="проходит">Проходят</SelectItem>
                  <SelectItem value="завершено">Завершенные</SelectItem>
                  <SelectItem value="отменено">Отмененные</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="конференция">Конференция</SelectItem>
                  <SelectItem value="семинар">Семинар</SelectItem>
                  <SelectItem value="воркшоп">Воркшоп</SelectItem>
                  <SelectItem value="встреча">Встреча</SelectItem>
                  <SelectItem value="презентация">Презентация</SelectItem>
                  <SelectItem value="вебинар">Вебинар</SelectItem>
                  <SelectItem value="другое">Другое</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                  Очистить
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Счетчик результатов */}
        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Найдено мероприятий: {filteredEvents.length} из {events.length}
            </p>
          </div>
        )}

        {/* Список мероприятий */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {events.length === 0 ? 'Нет мероприятий' : 'Мероприятия не найдены'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {events.length === 0 
                  ? 'Создайте свое первое мероприятие, чтобы начать.'
                  : 'Попробуйте изменить критерии поиска или фильтры.'
                }
              </p>
              {events.length === 0 && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать первое мероприятие
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}

        {/* Форма создания/редактирования */}
        <EventForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          event={editingEvent}
        />
    </div>
  );
} 