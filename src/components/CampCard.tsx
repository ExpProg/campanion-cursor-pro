'use client';

import { Camp } from '@/types/camp';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Star, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { getCampTypeColorClass, getCampTypeColorFromDB, getCampTypeColorStyle, getCampTypeColorValue, getCampTypeLabelStyle, getLogoPlaceholderColor, getInitials } from '@/lib/utils';
import { CampType as CampTypeEntity } from '@/types/campType';
import { getActiveCampTypes } from '@/lib/campTypeService';
import { useState, useEffect } from 'react';
import { useOrganizer } from '@/hooks/useOrganizer';

interface CampCardProps {
  camp: Camp;
}

export function CampCard({ camp }: CampCardProps) {
  const [campTypes, setCampTypes] = useState<CampTypeEntity[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const { organizer, loading: loadingOrganizer } = useOrganizer(camp.organizerId);

  // Загружаем типы кэмпов из базы данных
  useEffect(() => {
    const loadCampTypes = async () => {
      try {
        setLoadingTypes(true);
        const types = await getActiveCampTypes();
        setCampTypes(types);
      } catch (error) {
        console.error('Ошибка загрузки типов кэмпов:', error);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadCampTypes();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getPriceDisplay = () => {
    // Если есть варианты, показываем диапазон цен
    if (camp.variants && camp.variants.length > 0) {
      const prices = camp.variants
        .map(v => v.price)
        .filter(price => price !== undefined) as number[];
      
      if (prices.length === 0) {
        return 'Цена по запросу';
      }
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return `${formatPrice(minPrice)} ₽`;
      } else {
        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)} ₽`;
      }
    }
    
    // Если есть базовая цена, показываем её
    if (camp.price !== undefined && camp.price > 0) {
      return `${formatPrice(camp.price)} ₽`;
    }
    
    return 'Цена по запросу';
  };

  const calculateDuration = () => {
    const diffTime = Math.abs(camp.endDate.getTime() - camp.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Получаем цвет для типа кэмпа
  const getTypeColor = () => {
    if (campTypes.length > 0) {
      return getCampTypeColorValue(campTypes, camp.type);
    }
    return getCampTypeColorClass(camp.type);
  };

  // Получаем inline стили для цвета типа кэмпа
  const getTypeStyle = () => {
    if (campTypes.length > 0) {
      return getCampTypeColorStyle(campTypes, camp.type);
    }
    return {};
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col p-0 overflow-hidden interactive">
      {/* Изображение */}
      <div className="relative h-40 overflow-hidden">
        {camp.image ? (
          <img
            src={camp.image}
            alt={camp.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Star className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        
        {/* Бейджи поверх изображения */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {campTypes.length > 0 ? (
            <Badge 
              style={getCampTypeLabelStyle(campTypes, camp.type)}
              className="text-xs px-2 py-0.5"
            >
              {camp.type}
            </Badge>
          ) : (
            <Badge className="text-xs px-2 py-0.5 bg-gray-400 text-white border-none">
              {camp.type}
            </Badge>
          )}
          
          {/* Индикатор статуса кэмпа */}
          {camp.status === 'archived' && (
            <Badge 
              variant="destructive"
              className="text-xs px-2 py-0.5"
            >
              Архив
            </Badge>
          )}
        </div>

        {/* Логотип организатора в правом нижнем углу изображения */}
        {/* Убираем логотип с изображения */}

        {/* Цена в правом верхнем углу */}
        <div className="absolute top-2 right-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1">
            <span className="font-semibold text-xs">{getPriceDisplay()}</span>
          </div>
        </div>
      </div>

      <CardHeader className="pb-2 px-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {camp.title}
          </h3>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
          {camp.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4">
        {/* Основная информация */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{format(camp.startDate, 'd MMM', { locale: ru })} - {format(camp.endDate, 'd MMM yyyy', { locale: ru })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{calculateDuration()} дней</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{camp.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div 
              className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0 organizer-avatar-square"
              style={{ backgroundColor: getLogoPlaceholderColor(organizer?.name || '') }}
            >
              {getInitials(organizer?.name || '')}
            </div>
            <span className="line-clamp-1">
              {loadingOrganizer ? 'Загрузка...' : (organizer?.name || 'Не указан')}
            </span>
          </div>


        </div>

        {/* Особенности */}
        <div>
          <div className="flex flex-wrap gap-1">
            {camp.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5 text-white">
                {feature}
              </Badge>
            ))}
            {camp.features.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 text-white">
                +{camp.features.length - 2}
              </Badge>
            )}
          </div>
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