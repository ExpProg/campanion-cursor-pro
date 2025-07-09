'use client';

import { useState, useEffect } from 'react';
import { Event, CreateEventData, EventCategory, EventStatus } from '@/types/event';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventData) => void;
  event?: Event | null;
}

const categories: EventCategory[] = [
  'конференция', 'семинар', 'воркшоп', 'встреча', 'презентация', 'вебинар', 'другое'
];

const statuses: EventStatus[] = [
  'предстоящее', 'проходит', 'завершено', 'отменено'
];

export function EventForm({ isOpen, onClose, onSubmit, event }: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    category: 'конференция',
    attendees: 0,
    maxAttendees: undefined,
    status: 'предстоящее',
    organizer: '',
    image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        category: event.category,
        attendees: event.attendees,
        maxAttendees: event.maxAttendees,
        status: event.status,
        organizer: event.organizer,
        image: event.image || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        location: '',
        category: 'конференция',
        attendees: 0,
        maxAttendees: undefined,
        status: 'предстоящее',
        organizer: '',
        image: '',
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название мероприятия обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание мероприятия обязательно';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Место проведения обязательно';
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Имя организатора обязательно';
    }

    if (formData.attendees < 0) {
      newErrors.attendees = 'Количество участников не может быть отрицательным';
    }

    if (formData.maxAttendees && formData.maxAttendees < formData.attendees) {
      newErrors.maxAttendees = 'Максимальное количество не может быть меньше текущего';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    onSubmit(formData);
    toast.success(event ? 'Мероприятие обновлено' : 'Мероприятие создано');
    onClose();
  };

  const handleDateTimeChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        toast.error('Можно загружать только изображения');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Редактировать мероприятие' : 'Создать новое мероприятие'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название мероприятия *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Введите название мероприятия"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Описание мероприятия"
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label>Дата и время *</Label>
            <DateTimePicker
              date={formData.date}
              onDateChange={handleDateTimeChange}
              placeholder="Выберите дату и время мероприятия"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место проведения *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Адрес или название места"
            />
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label>Изображение мероприятия</Label>
            
            {/* Превью изображения */}
            {formData.image && (
              <div className="relative inline-block">
                <div className="relative w-full max-w-xs h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={formData.image}
                    alt="Превью"
                    fill
                    className="object-cover"
                    onError={() => {
                      toast.error('Не удалось загрузить изображение');
                      removeImage();
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Поле для URL */}
            <div className="space-y-2">
              <Input
                placeholder="Вставьте ссылку на изображение..."
                value={formData.image?.startsWith('http') ? formData.image : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
            </div>

            {/* Разделитель */}
            {!formData.image && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-px bg-border flex-1"></div>
                <span>или</span>
                <div className="h-px bg-border flex-1"></div>
              </div>
            )}

            {/* Загрузка файла */}
            {!formData.image && (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Загрузить файл
                </Label>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG до 5MB
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select
                value={formData.category}
                onValueChange={(value: EventCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: EventStatus) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer">Организатор *</Label>
            <Input
              id="organizer"
              value={formData.organizer}
              onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
              placeholder="Имя организатора"
            />
            {errors.organizer && <p className="text-sm text-destructive">{errors.organizer}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attendees">Участников</Label>
              <Input
                id="attendees"
                type="number"
                min="0"
                value={formData.attendees}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  attendees: parseInt(e.target.value) || 0 
                }))}
              />
              {errors.attendees && <p className="text-sm text-destructive">{errors.attendees}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Макс. участников</Label>
              <Input
                id="maxAttendees"
                type="number"
                min="0"
                value={formData.maxAttendees || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxAttendees: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="Не ограничено"
              />
              {errors.maxAttendees && <p className="text-sm text-destructive">{errors.maxAttendees}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              {event ? 'Сохранить изменения' : 'Создать мероприятие'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 