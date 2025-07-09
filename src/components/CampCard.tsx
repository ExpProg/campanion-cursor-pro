'use client';

import { Camp } from '@/types/camp';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { getCampTypeColorClass, getDifficultyColorClass } from '@/lib/utils';

interface CampCardProps {
  camp: Camp;
}

export function CampCard({ camp }: CampCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getPriceDisplay = () => {
    // Если есть варианты, показываем диапазон цен
    if (camp.variants && camp.variants.length > 0) {
      const prices = camp.variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return `${formatPrice(minPrice)} ₽`;
      } else {
        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)} ₽`;
      }
    }
    
    // Если есть базовая цена, показываем её
    if (camp.price) {
      return `${formatPrice(camp.price)} ₽`;
    }
    
    return 'Цена не указана';
  };

  const calculateDuration = () => {
    const diffTime = Math.abs(camp.endDate.getTime() - camp.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col p-0 overflow-hidden interactive">
      {/* Изображение */}
      <div className="relative h-40 overflow-hidden">
        {camp.image ? (
          <Image
            src={camp.image}
            alt={camp.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Star className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        
        {/* Бейджи поверх изображения */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <Badge className={`${getCampTypeColorClass(camp.type)} text-xs px-2 py-0.5`}>
            {camp.type}
          </Badge>
          <Badge className={`${getDifficultyColorClass(camp.difficulty)} text-xs px-2 py-0.5`}>
            {camp.difficulty}
          </Badge>
        </div>

        {/* Цена в правом верхнем углу */}
        <div className="absolute top-2 right-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1">
            <span className="font-semibold text-xs">{getPriceDisplay()}</span>
          </div>
        </div>
      </div>

      <CardHeader className="pb-2 px-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {camp.title}
          </h3>
        </div>
        
        <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
          {camp.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4">
        {/* Основная информация */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{format(camp.startDate, 'd MMM', { locale: ru })} - {format(camp.endDate, 'd MMM yyyy', { locale: ru })}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span>{calculateDuration()} дней</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{camp.location}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{camp.ageGroup}</span>
          </div>
        </div>

        {/* Особенности */}
        <div>
          <div className="flex flex-wrap gap-1">
            {camp.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                {feature}
              </Badge>
            ))}
            {camp.features.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                +{camp.features.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Организатор */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Организатор:</span> {camp.organizer}
        </div>

        {/* Кнопка подробнее */}
        <div className="mt-auto">
          <Link href={`/camps/${camp.id}`}>
            <Button className="w-full h-8 text-xs">
              Подробнее
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 