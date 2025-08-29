'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Loader2 } from 'lucide-react';
import { createBookingRequest } from '@/lib/bookingService';
import { toast } from 'sonner';
import { Camp } from '@/types/camp';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: Camp;
  isDirectBooking: boolean;
  userEmail?: string;
  userName?: string;
  onBookingSuccess?: () => void;
}

export function BookingModal({ isOpen, onClose, camp, isDirectBooking, userEmail, userName, onBookingSuccess }: BookingModalProps) {
  const [name, setName] = useState(userName || '');
  const [contact, setContact] = useState(userEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBookingRequest({
        campId: camp.id,
        campTitle: camp.title,
        name: name.trim(),
        contact: contact.trim(),
        message: `Заявка на бронирование кэмпа "${camp.title}"`,
      });
      
      toast.success('Вы успешно откликнулись на кэмп!');
      onBookingSuccess?.();
      onClose();
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      toast.error('Не удалось отправить заявку. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalLink = () => {
    if (camp.campUrl) {
      window.open(camp.campUrl, '_blank');
    }
    onClose();
  };

  if (isDirectBooking) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Забронировать кэмп "{camp.title}"</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Контактные данные *</Label>
              <Input
                id="contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email или телефон"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Откликнуться'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Бронирование кэмпа</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-left space-y-3">
            <div className="text-muted-foreground">
              <p>Сейчас прямое бронирование для этого кэмпа недоступно. Для бронирования перейдите на сайт организатора.</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Закрыть
            </Button>
            <Button
              type="button"
              onClick={handleExternalLink}
              className="flex-1"
              disabled={!camp.campUrl}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Перейти на сайт
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
