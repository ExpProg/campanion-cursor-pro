'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  RefreshCw, 
  Database,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  Plus,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteCamp } from '@/lib/campService';
import { useCamps } from '@/hooks/useCamps';
import { AdminOnly } from '@/components/RoleProtected';
import { Camp, CampVariant } from '@/types/camp';
import Link from 'next/link';

export const AdminPanel = () => {
  const { camps, loading, refetch } = useCamps();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeleteCamp = async (campId: string, campTitle: string) => {
    if (!confirm(`Вы уверены, что хотите удалить кэмп "${campTitle}"?`)) {
      return;
    }

    try {
      setDeleting(campId);
      await deleteCamp(campId);
      toast.success('Кэмп успешно удален');
      refetch();
    } catch (error) {
      console.error('Ошибка при удалении кэмпа:', error);
      toast.error('Ошибка при удалении кэмпа');
    } finally {
      setDeleting(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getPriceDisplay = (camp: Camp) => {
    // Если есть варианты, показываем диапазон цен
    if (camp.variants && camp.variants.length > 0) {
      const prices = camp.variants.map((v) => v.price);
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

  return (
    <AdminOnly 
      fallback={
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Доступ запрещен</CardTitle>
            <CardDescription>
              У вас нет прав доступа к админ-панели
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Админ-панель
          </CardTitle>
          <CardDescription>
            Управление кэмпами в базе данных
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего кэмпов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : camps.length}
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Статус</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              )}
              <span className="text-sm">
                {loading ? 'Загрузка...' : 'Подключено'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Создание</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/camps/create">
              <Button 
                size="sm" 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Новый кэмп
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Управление</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/camps">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Все кэмпы
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Список кэмпов */}
      <Card>
        <CardHeader>
          <CardTitle>Текущие кэмпы в базе данных</CardTitle>
          <CardDescription>
            {loading ? 'Загрузка...' : `Найдено ${camps.length} кэмпов`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Загрузка кэмпов...</span>
            </div>
          ) : camps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Кэмпы не найдены</p>
              <p className="text-sm">Создайте новый кэмп</p>
            </div>
          ) : (
            <div className="space-y-4">
              {camps.slice(0, 5).map((camp) => (
                <div key={camp.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{camp.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {camp.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {camp.startDate.toLocaleDateString('ru-RU')}
                          </div>
                          <Badge variant="secondary">{camp.type}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{getPriceDisplay(camp)}</div>
                        <div className="text-sm text-muted-foreground">{camp.ageGroup}</div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/camps/${camp.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCamp(camp.id, camp.title)}
                        disabled={deleting === camp.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === camp.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {camps.length > 5 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    И еще {camps.length - 5} кэмпов...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminOnly>
  );
}; 