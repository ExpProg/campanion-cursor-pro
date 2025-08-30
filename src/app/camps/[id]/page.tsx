'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCamps } from '@/hooks/useCamps';
import { useOrganizer } from '@/hooks/useOrganizer';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Clock, Star, ArrowLeft, Mail, Phone, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import { getCampTypeColorClass, getDifficultyColorClass, getLogoPlaceholderColor, getInitials } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createBookingRequest, checkUserBookingExists } from '@/lib/bookingService';
import { toast } from 'sonner';
import { BookingModal } from '@/components/BookingModal';
import { AuthForm } from '@/components/AuthForm';

export default function CampDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campId = params.id as string;
  const { camps, allCamps, loading, error } = useCamps();
  const { user, userProfile } = useAuth();
  const { isAuthenticated, isAdmin } = useAuthRole();
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Ищем кэмп сначала в активных, затем во всех кэмпах (для архивных)
  const camp = camps.find(c => c.id === campId) || allCamps.find(c => c.id === campId);
  const { organizer, loading: loadingOrganizer } = useOrganizer(camp?.organizerId || null);

  // Проверка, должен ли кэмп считаться архивным (по дате)
  const isCampArchived = () => {
    if (!camp) return false;
    const now = new Date();
    return camp.startDate <= now;
  };

  // Отладочная информация
  console.log('Camp detail page state:', {
    campId,
    campStatus: camp?.status,
    isArchivedByDate: isCampArchived(),
    startDate: camp?.startDate,
    currentDate: new Date(),
    isAdmin,
    user: user?.email,
    hasExistingBooking
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getPriceDisplay = () => {
    // Если есть варианты, показываем диапазон цен
    if (camp?.variants && camp.variants.length > 0) {
      const prices = camp.variants.map(v => v.price).filter((price): price is number => price !== undefined);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (minPrice === maxPrice) {
          return `${formatPrice(minPrice)} ₽`;
        } else {
          return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)} ₽`;
        }
      }
    }
    
    // Если есть базовая цена, показываем её
    if (camp?.price !== undefined && camp.price !== null) {
      return `${formatPrice(camp.price as number)} ₽`;
    }
    
    return 'Цена не указана';
  };

  const calculateDuration = () => {
    if (!camp) return 0;
    const diffTime = Math.abs(camp.endDate.getTime() - camp.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Проверка существующих заявок пользователя
  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!camp || !user?.email) return;
      
      try {
        const hasBooking = await checkUserBookingExists(camp.id, user.email);
        setHasExistingBooking(hasBooking);
      } catch (error) {
        console.error('Ошибка при проверке заявок:', error);
      }
    };

    checkExistingBooking();
  }, [camp, user]);

  // Обработка клика по кнопке
  const handleButtonClick = () => {
    if (!camp) return;
    
    // Если пользователь не авторизован, показываем форму входа
    if (!isAuthenticated) {
      setShowAuthForm(true);
      return;
    }
    
    // Если кэмп в архиве (по дате) и пользователь не администратор, блокируем
    if (isCampArchived() && !isAdmin) {
      return;
    }

    // Если у пользователя уже есть заявка, показываем сообщение
    if (hasExistingBooking) {
      toast.info('Вы уже откликнулись на этот кэмп');
      return;
    }

    // Открываем модальное окно бронирования
    setShowBookingModal(true);
  };

  // Получение текста кнопки
  const getButtonText = () => {
    const archived = isCampArchived();
    
    console.log('getButtonText check:', {
      campStatus: camp?.status,
      isArchivedByDate: archived,
      hasExistingBooking,
      isAuthenticated
    });
    
    // Если пользователь не авторизован, показываем кнопку входа
    if (!isAuthenticated) {
      console.log('Button text: Войти');
      return 'Войти';
    }
    
    if (archived) {
      console.log('Button text: Бронирование недоступно');
      return 'Бронирование недоступно';
    }
    
    if (hasExistingBooking) {
      console.log('Button text: Вы уже откликнулись');
      return 'Вы уже откликнулись';
    }
    
    console.log('Button text: Забронировать кэмп');
    return 'Забронировать кэмп';
  };

  // Проверка, должна ли кнопка быть заблокирована
  const isButtonDisabled = () => {
    const archived = isCampArchived();
    
    console.log('isButtonDisabled check:', {
      campStatus: camp?.status,
      isArchivedByDate: archived,
      isAdmin,
      hasExistingBooking,
      isAuthenticated,
      campId: camp?.id,
      startDate: camp?.startDate,
      currentDate: new Date()
    });
    
    // Если пользователь не авторизован, кнопка активна (ведет на форму входа)
    if (!isAuthenticated) {
      console.log('Button enabled: not authenticated (shows auth form)');
      return false;
    }
    
    if (archived && !isAdmin) {
      console.log('Button disabled: archived camp (by date) and not admin');
      return true; // Заблокирована для обычных пользователей
    }
    
    if (hasExistingBooking) {
      console.log('Button disabled: existing booking');
      return true; // Заблокирована если уже есть заявка
    }
    
    console.log('Button enabled');
    return false; // Активна для администраторов
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
      {/* Кнопка назад и информация о статусе */}
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к списку кэмпов
        </Button>
        
        {/* Информация о статусе для администраторов */}
        {isAdmin && isCampArchived() && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Статус:</span>
            <Badge 
              variant="destructive"
              className="text-xs"
            >
              Архив
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Изображение и заголовок */}
          <Card className="p-0 overflow-hidden">
            <div className="relative h-64 md:h-80">
              {camp.image ? (
                <img
                  src={camp.image}
                  alt={camp.title}
                  className="w-full h-full object-cover"
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
                {camp.difficulty && (
                  <Badge className={`${getDifficultyColorClass(camp.difficulty)} text-sm px-3 py-1`}>
                    {camp.difficulty}
                  </Badge>
                )}
                
                {/* Индикатор статуса кэмпа */}
                {camp.status === 'archived' && (
                  <Badge 
                    variant="destructive"
                    className="text-sm px-3 py-1"
                  >
                    Архив
                  </Badge>
                )}
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
              
              {/* Предупреждение о статусе кэмпа */}
              {camp.status === 'archived' && (
                <div className="mb-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Этот кэмп находится в архиве</span>
                    </div>
                    <p className="text-destructive/80 text-sm mt-1">
                      Бронирование архивных кэмпов недоступно. Информация предоставляется только для ознакомления.
                    </p>
                  </div>
                </div>
              )}
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
              </div>

              {/* Варианты программы */}
              {camp.variants && camp.variants.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Варианты программы</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {camp.variants.map((variant, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{variant.name}</h5>
                          <span className="font-bold text-primary">{variant.price ? `${formatPrice(variant.price)} ₽` : 'Цена не указана'}</span>
                        </div>
                        {variant.description && (
                          <p className="text-sm text-muted-foreground">{variant.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Информация об организаторе */}
          <Card>
            <CardHeader>
              <CardTitle>Об организаторе</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrganizer ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : organizer ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Логотип/аватар организатора */}
                    <div className="flex-shrink-0">
                      {organizer.logo ? (
                        <img
                          src={organizer.logo}
                          alt={organizer.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: organizer.color || getLogoPlaceholderColor(organizer.name) }}
                        >
                          {getInitials(organizer.name)}
                        </div>
                      )}
                    </div>
                    
                    {/* Название и ссылка */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {organizer.website ? (
                          <a
                            href={organizer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-semibold text-primary hover:underline"
                          >
                            {organizer.name}
                          </a>
                        ) : (
                          <p className="text-xl font-semibold">{organizer.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Описание организатора */}
                  {organizer.description && (
                    <div className="pl-16">
                      <p className="text-sm text-muted-foreground">{organizer.description}</p>
                    </div>
                  )}
                  
                  {/* Контактная информация */}
                  <div className="space-y-1 text-sm pl-16">
                    {organizer.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{organizer.contactEmail}</span>
                      </div>
                    )}
                    {organizer.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{organizer.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Организатор не указан</p>
              )}
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

              {/* Кнопка бронирования/входа */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleButtonClick}
                disabled={isButtonDisabled()}
                variant={isButtonDisabled() ? 'secondary' : 'default'}
              >
                {getButtonText()}
              </Button>

              {/* Информация о статусе */}
              <div className="text-center text-sm text-muted-foreground">
                {isCampArchived() ? (
                  'Бронирование недоступно (кэмп в архиве)'
                ) : hasExistingBooking ? (
                  'Вы уже откликнулись на этот кэмп'
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Модальное окно бронирования */}
      {camp && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          camp={camp}
          isDirectBooking={camp.directBooking}
          userEmail={user?.email || undefined}
          userName={userProfile?.displayName || user?.displayName || undefined}
          onBookingSuccess={() => setHasExistingBooking(true)}
        />
      )}

      {/* Модальное окно авторизации */}
      <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вход в систему</DialogTitle>
            <DialogDescription>
              Войдите в систему или зарегистрируйтесь, чтобы забронировать кэмп
            </DialogDescription>
          </DialogHeader>
          <AuthForm 
            onClose={() => setShowAuthForm(false)}
            onSuccess={() => {
              setShowAuthForm(false);
              // После успешной авторизации можно показать сообщение
              toast.success('Добро пожаловать! Теперь вы можете забронировать кэмп');
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 