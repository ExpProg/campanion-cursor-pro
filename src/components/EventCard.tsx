'use client';

import { Event } from '@/types/event';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, Users, MoreHorizontal, Edit, Trash2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getCategoryColorClass, getStatusColorClass } from '@/lib/utils';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 relative overflow-hidden p-0 interactive">
      {/* Изображение или заглушка */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              // Скрываем картинку если она не загрузилась
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          // Заглушка для карточек без изображения
          <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Меню действий */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0 shadow-sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Открыть меню</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(event.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
              <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getCategoryColorClass(event.category)}>
                {event.category}
              </Badge>
              <Badge variant="outline" className={getStatusColorClass(event.status)}>
                {event.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      
      <CardContent className="space-y-3 px-6 pb-6">
        <CardDescription className="text-sm line-clamp-2">
          {event.description}
        </CardDescription>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{format(event.date, 'dd MMMM yyyy, HH:mm', { locale: ru })}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>
              {event.attendees}
              {event.maxAttendees && ` / ${event.maxAttendees}`} участников
            </span>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Организатор: {event.organizer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 