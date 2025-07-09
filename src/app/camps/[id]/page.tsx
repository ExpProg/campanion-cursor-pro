'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCamps } from '@/hooks/useCamps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, Star, ArrowLeft, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import { getCampTypeColorClass, getDifficultyColorClass } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

export default function CampDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campId = params.id as string;
  const { camps, loading, error } = useCamps();

  const camp = camps.find(c => c.id === campId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getPriceDisplay = () => {
    // Если есть варианты, показываем диапазон цен
    if (camp?.variants && camp.variants.length > 0) {
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
    if (camp?.price) {
      return `${formatPrice(camp.price)} ₽`;
    }
    
    return 'Цена не указана';
  };

  const calculateDuration = () => {
    if (!camp) return 0;
    const diffTime = Math.abs(camp.endDate.getTime() - camp.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Загрузка информации о кэмпе...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground text-center mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Кэмп не найден</h2>
          <p className="text-muted-foreground text-center mb-4">
            Кэмп с указанным ID не существует или был удален
          </p>
          <Button onClick={() => router.push('/camps')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к списку кэмпов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Кнопка назад */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к списку кэмпов
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Изображение и заголовок */}
          <Card className="p-0 overflow-hidden">
            <div className="relative h-64 md:h-80">
              {camp.image ? (
                <Image
                  src={camp.image}
                  alt={camp.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Star className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              {/* Бейджи поверх изображения */}
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                <Badge className={`${getCampTypeColorClass(camp.type)} text-sm px-3 py-1`}>
                  {camp.type}
                </Badge>
                <Badge className={`${getDifficultyColorClass(camp.difficulty)} text-sm px-3 py-1`}>
                  {camp.difficulty}
                </Badge>
              </div>

              {/* Цена */}
              <div className="absolute top-4 right-4">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <span className="font-bold text-lg">{getPriceDisplay()}</span>
                </div>
              </div>
            </div>

            <CardHeader className="pt-4">
              <CardTitle className="text-2xl md:text-3xl">{camp.title}</CardTitle>
              <p className="text-muted-foreground text-lg mb-4">{camp.description}</p>
            </CardHeader>
          </Card>

          {/* Подробная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Детали программы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Даты проведения</p>
                    <p className="text-sm text-muted-foreground">
                      {format(camp.startDate, 'd MMMM', { locale: ru })} - {format(camp.endDate, 'd MMMM yyyy', { locale: ru })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Продолжительность</p>
                    <p className="text-sm text-muted-foreground">{calculateDuration()} дней</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Место проведения</p>
                    <p className="text-sm text-muted-foreground">{camp.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Возрастная группа</p>
                    <p className="text-sm text-muted-foreground">{camp.ageGroup}</p>
                  </div>
                </div>
              </div>

              {/* Особенности */}
              <div>
                <h3 className="font-medium mb-3">Что включено в программу</h3>
                <div className="flex flex-wrap gap-2">
                  {camp.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Что включено в стоимость */}
              <div>
                <h3 className="font-medium mb-3">Что включено в стоимость</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {camp.included.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Варианты (если есть) */}
              {camp.variants && camp.variants.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Варианты участия</h3>
                  <div className="space-y-3">
                    {camp.variants.map((variant) => (
                      <Card key={variant.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{variant.name}</h4>
                            <p className="text-muted-foreground text-sm mt-1">{variant.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              {formatPrice(variant.price)} ₽
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Организатор */}
              <div>
                <h3 className="font-medium mb-2">Организатор</h3>
                <p className="text-muted-foreground">{camp.organizer}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель бронирования */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl">Бронирование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Цена */}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {getPriceDisplay()}
                </div>
                <p className="text-sm text-muted-foreground">за {calculateDuration()} дней</p>
              </div>

              {/* Кнопка бронирования */}
              <Button 
                className="w-full" 
                size="lg"
              >
                Забронировать место
              </Button>

              {/* Контактная информация */}
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-medium">Нужна консультация?</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Написать email
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Заказать звонок
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 