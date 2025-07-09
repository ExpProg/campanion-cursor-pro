'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminOnly } from '@/components/RoleProtected';
import { getAllCamps, deleteCamp } from '@/lib/campService';
import { Camp, CampType } from '@/types/camp';
import { Calendar, MapPin, Users, Edit, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<CampType | 'all'>('all');

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

  const loadCamps = async () => {
    try {
      setLoading(true);
      console.log('🔍 Загружаем кэмпы для управления');
      const campsData = await getAllCamps();
      setCamps(campsData);
      console.log(`✅ Загружено ${campsData.length} кэмпов`);
    } catch (error) {
      console.error('❌ Ошибка загрузки кэмпов:', error);
      toast.error('Не удалось загрузить кэмпы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const handleDelete = async (campId: string, campTitle: string) => {
    if (!confirm(`Вы уверены, что хотите удалить кэмп "${campTitle}"?`)) {
      return;
    }

    try {
      setDeleting(campId);
      await deleteCamp(campId);
      toast.success('Кэмп успешно удален');
      loadCamps(); // Перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка удаления кэмпа:', error);
      toast.error('Не удалось удалить кэмп');
    } finally {
      setDeleting(null);
    }
  };

  // Фильтрация кэмпов
  const filteredCamps = camps.filter(camp => {
    const matchesSearch = camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camp.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || camp.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const campTypes: (CampType | 'all')[] = [
    'all',
    'летний',
    'зимний',
    'языковой',
    'спортивный',
    'творческий',
    'технический',
    'приключенческий',
    'образовательный',
  ];

  const getTypeLabel = (type: CampType | 'all') => {
    return type === 'all' ? 'Все типы' : type;
  };

  return (
    <AdminOnly fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
        <p className="text-muted-foreground mt-2">
          Только администраторы могут управлять кэмпами.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Управление кэмпами</h1>
            <p className="text-muted-foreground mt-2">
              {loading ? 'Загрузка...' : `Найдено ${filteredCamps.length} из ${camps.length} кэмпов`}
            </p>
          </div>
          <Link href="/admin/camps/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Создать кэмп
            </Button>
          </Link>
        </div>

        {/* Фильтры */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Фильтры</CardTitle>
            <CardDescription>
              Поиск и фильтрация кэмпов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию, описанию или местоположению..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CampType | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Тип кэмпа" />
                  </SelectTrigger>
                  <SelectContent>
                    {campTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Список кэмпов */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Загрузка кэмпов...</span>
            </CardContent>
          </Card>
        ) : filteredCamps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Кэмпы не найдены</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Создайте первый кэмп, чтобы начать работу'
                }
              </p>
              {(!searchTerm && typeFilter === 'all') && (
                <Link href="/admin/camps/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первый кэмп
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredCamps.map((camp) => (
              <Card key={camp.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Изображение */}
                  {camp.image && (
                    <div className="lg:w-48 h-48 lg:h-auto">
                      <img
                        src={camp.image}
                        alt={camp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Контент */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{camp.title}</h3>
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {camp.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {camp.startDate.toLocaleDateString('ru-RU')} - {camp.endDate.toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{camp.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{camp.ageGroup}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">{camp.type}</Badge>
                          <Badge variant="outline">{camp.difficulty}</Badge>
                          <Badge variant="outline">{camp.organizer}</Badge>
                        </div>
                      </div>
                      
                      {/* Цена и действия */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {getPriceDisplay(camp)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            за участника
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/camps/${camp.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Просмотр
                            </Button>
                          </Link>
                          <Link href={`/admin/camps/${camp.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Редактировать
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(camp.id, camp.title)}
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminOnly>
  );
} 