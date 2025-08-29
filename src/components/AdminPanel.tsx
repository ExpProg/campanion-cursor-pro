'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
  Hash,
  Users,
  Mail,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteCamp } from '@/lib/campService';
import { deleteOrganizer } from '@/lib/organizerService';
import { deleteCampType } from '@/lib/campTypeService';
import Image from 'next/image';
import { useCamps } from '@/hooks/useCamps';
import { AdminOnly } from '@/components/RoleProtected';
import { Camp, CampVariant } from '@/types/camp';
import Link from 'next/link';
import { getCampTypeLabelStyle, getLogoPlaceholderColor, getInitials } from '@/lib/utils';
import { getActiveCampTypes, getAllCampTypes } from '@/lib/campTypeService';
import { CampType as CampTypeEntity } from '@/types/campType';
import { getAllOrganizers } from '@/lib/organizerService';
import { Organizer } from '@/types/organizer';
import { AreaChartComponent } from '@/components/ui/area-chart';

export const AdminPanel = () => {
  const { camps, allCamps, loading, refetch, isCampActive } = useCamps();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [campTypes, setCampTypes] = useState<CampTypeEntity[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [filterType, setFilterType] = useState<'active' | 'archived' | 'all'>('active');
  const [activeTab, setActiveTab] = useState<'camps' | 'organizers' | 'campTypes'>('camps');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Функция для определения актуальности кэмпа (используем из хука)
  const isActive = isCampActive;

  // Фильтрация кэмпов
  const filteredCamps = useMemo(() => {
    switch (filterType) {
      case 'active':
        return allCamps.filter(isActive);
      case 'archived':
        return allCamps.filter(camp => !isActive(camp));
      case 'all':
        return allCamps;
      default:
        return allCamps.filter(isActive);
    }
  }, [allCamps, filterType]);

  // Сортировка: сначала актуальные, потом архивные
  const sortedCamps = useMemo(() => {
    return [...filteredCamps].sort((a, b) => {
      const aActive = isActive(a);
      const bActive = isActive(b);
      
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      
      // Если оба актуальные или оба архивные, сортируем по дате начала
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [filteredCamps]);

  // Пагинация для кэмпов
  const paginatedCamps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCamps.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCamps, currentPage]);

  // Пагинация для организаторов
  const paginatedOrganizers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return organizers.slice(startIndex, startIndex + itemsPerPage);
  }, [organizers, currentPage]);

  // Пагинация для типов кэмпов
  const paginatedCampTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return campTypes.slice(startIndex, startIndex + itemsPerPage);
  }, [campTypes, currentPage]);

  // Общее количество страниц для текущей вкладки
  const totalPages = useMemo(() => {
    let totalItems = 0;
    if (activeTab === 'camps') totalItems = sortedCamps.length;
    else if (activeTab === 'organizers') totalItems = organizers.length;
    else if (activeTab === 'campTypes') totalItems = campTypes.length;
    
    return Math.ceil(totalItems / itemsPerPage);
  }, [activeTab, sortedCamps.length, organizers.length, campTypes.length]);

  // Сброс страницы при смене вкладки или фильтра
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterType]);

  // Данные для графика по месяцам
  const chartData = useMemo(() => {
    const months = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    
    const monthCounts = new Array(12).fill(0);
    
    allCamps.forEach(camp => {
      const startDate = new Date(camp.startDate);
      if (startDate.getFullYear() === selectedYear) {
        monthCounts[startDate.getMonth()]++;
      }
    });
    
    return months.map((month, index) => ({
      month,
      count: monthCounts[index]
    }));
  }, [allCamps, selectedYear]);

  useEffect(() => {
    getActiveCampTypes().then(setCampTypes);
    getAllCampTypes().then(setCampTypes);
    getAllOrganizers().then(setOrganizers);
  }, []);

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

  const handleDeleteOrganizer = async (organizerId: string, organizerName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить организатора "${organizerName}"?`)) {
      return;
    }

    try {
      setDeleting(organizerId);
      await deleteOrganizer(organizerId);
      toast.success('Организатор успешно удален');
      // Обновляем список организаторов
      const updatedOrganizers = await getAllOrganizers();
      setOrganizers(updatedOrganizers);
    } catch (error) {
      console.error('Ошибка при удалении организатора:', error);
      toast.error('Ошибка при удалении организатора');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteCampType = async (campTypeId: string, campTypeName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить тип кэмпа "${campTypeName}"?`)) {
      return;
    }

    try {
      setDeleting(campTypeId);
      await deleteCampType(campTypeId);
      toast.success('Тип кэмпа успешно удален');
      // Обновляем список типов кэмпов
      const updatedCampTypes = await getAllCampTypes();
      setCampTypes(updatedCampTypes);
    } catch (error) {
      console.error('Ошибка при удалении типа кэмпа:', error);
      toast.error('Ошибка при удалении типа кэмпа');
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
      const prices = camp.variants.map((v) => v.price).filter((price): price is number => price !== undefined);
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
    if (camp.price) {
      return `${formatPrice(camp.price)} ₽`;
    }
    
    return 'Цена не указана';
  };

  const getTypeLabelStyle = (type: string) => {
    return getCampTypeLabelStyle(campTypes, type);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6" />
          Админ-панель
        </h1>
      </div>

      {/* График количества кэмпов по месяцам */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Количество кэмпов по месяцам</CardTitle>
              <CardDescription>
                График показывает количество кэмпов, начинающихся в каждом месяце {selectedYear} года
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedYear === 2025 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(2025)}
                className="h-8 px-3 text-xs"
              >
                2025
              </Button>
              <Button
                variant={selectedYear === 2026 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(2026)}
                className="h-8 px-3 text-xs"
              >
                2026
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Загрузка данных...</span>
            </div>
          ) : (
            <AreaChartComponent data={chartData} year={selectedYear} />
          )}
        </CardContent>
      </Card>



      {/* Основные вкладки управления */}
      <div className="mb-6">
        <div className="flex space-x-8 border-b">
          <button
            onClick={() => setActiveTab('camps')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'camps' 
                ? 'text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Кэмпы
          </button>
          <button
            onClick={() => setActiveTab('organizers')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'organizers' 
                ? 'text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Организаторы
          </button>
          <button
            onClick={() => setActiveTab('campTypes')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'campTypes' 
                ? 'text-foreground border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Типы кэмпов
          </button>
        </div>
      </div>

             {/* Контент вкладок */}
       <Card>
         <CardContent className="pt-4">
           {/* Подвкладки статусов кэмпов и информация */}
           <div className="mb-6">
             {/* Подвкладки статусов кэмпов */}
             {activeTab === 'camps' && (
               <div className="mb-4">
                                   <div className="flex space-x-8">
                    <button
                      onClick={() => setFilterType('active')}
                      className={`text-sm font-medium transition-colors ${
                        filterType === 'active' 
                          ? 'text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Актуальные
                    </button>
                    <button
                      onClick={() => setFilterType('archived')}
                      className={`text-sm font-medium transition-colors ${
                        filterType === 'archived' 
                          ? 'text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Архив
                    </button>
                    <button
                      onClick={() => setFilterType('all')}
                      className={`text-sm font-medium transition-colors ${
                        filterType === 'all' 
                          ? 'text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Все
                    </button>
                  </div>
               </div>
             )}
             
                           {/* Кнопки создания для разных вкладок */}
              <div className="flex justify-start">
                {activeTab === 'camps' && (
                  <Link href="/admin/camps/create">
                    <Button size="sm" className="h-8 px-3 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Новый кэмп
                    </Button>
                  </Link>
                )}
                
                {activeTab === 'organizers' && (
                  <Link href="/admin/organizers/create">
                    <Button size="sm" className="h-8 px-3 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Новый организатор
                    </Button>
                  </Link>
                )}
                
                {activeTab === 'campTypes' && (
                  <Link href="/admin/camp-types/create">
                    <Button size="sm" className="h-8 px-3 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Новый тип кэмпа
                    </Button>
                  </Link>
                )}
              </div>
           </div>

                       {/* Вкладка Кэмпы */}
            {activeTab === 'camps' && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Загрузка кэмпов...</span>
                  </div>
                ) : sortedCamps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Кэмпы не найдены</p>
                    <p className="text-sm">Создайте новый кэмп</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium text-sm">Название</th>
                          <th className="text-left p-3 font-medium text-sm">Местоположение</th>
                          <th className="text-left p-3 font-medium text-sm w-32">Дата начала</th>
                          <th className="text-left p-3 font-medium text-sm">Тип</th>
                          <th className="text-left p-3 font-medium text-sm">Цена</th>
                          <th className="text-left p-3 font-medium text-sm">Статус</th>
                          <th className="text-right p-3 font-medium text-sm">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCamps.map((camp) => (
                          <tr key={camp.id} className={`border-t ${!isActive(camp) ? 'bg-muted/30' : ''}`}>
                            <td className="p-3">
                              <div className="font-medium">{camp.title}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {camp.location}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">{camp.startDate.toLocaleDateString('ru-RU')}</div>
                            </td>
                            <td className="p-3">
                              <Badge style={getTypeLabelStyle(camp.type)} className="text-white text-xs">
                                {camp.type}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-muted-foreground">{getPriceDisplay(camp)}</div>
                            </td>
                            <td className="p-3">
                              {isActive(camp) ? (
                                <Badge variant="default" className="text-xs bg-green-600 text-white">
                                  Активный
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs bg-muted-foreground text-white">
                                  В архиве
                                </Badge>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex gap-2 justify-end">
                                <Link href={`/admin/camps/${camp.id}/edit`}>
                                  <Button variant="outline" size="sm">
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Пагинация для кэмпов */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-3 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Показано {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedCamps.length)} из {sortedCamps.length} кэмпов
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Назад
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Вперед
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

                       {/* Вкладка Организаторы */}
            {activeTab === 'organizers' && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Загрузка организаторов...</span>
                  </div>
                ) : organizers.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Организаторы не найдены</p>
                    <p className="text-sm">Создайте нового организатора</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2 font-medium text-sm w-16">Аватарка</th>
                          <th className="text-left p-3 font-medium text-sm">Название</th>
                          <th className="text-left p-3 font-medium text-sm">Email</th>
                          <th className="text-left p-3 font-medium text-sm">Статус</th>
                          <th className="text-left p-3 font-medium text-sm">Веб-сайт</th>
                          <th className="text-right p-3 font-medium text-sm">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrganizers.map((organizer) => (
                          <tr key={organizer.id} className="border-t">
                            <td className="p-2">
                              <div className="flex items-center justify-center">
                                {organizer.logo ? (
                                  <Image
                                    src={organizer.logo}
                                    alt={`Логотип ${organizer.name}`}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover"
                                    onError={(e) => {
                                      // Fallback к инициалам при ошибке загрузки изображения
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                                    organizer.logo ? 'hidden' : 'flex'
                                  }`}
                                  style={{ 
                                    backgroundColor: organizer.color || getLogoPlaceholderColor(organizer.name)
                                  }}
                                >
                                  {getInitials(organizer.name)}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{organizer.name}</div>
                            </td>
                            <td className="p-3">
                              {organizer.email && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {organizer.email}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {organizer.isActive ? (
                                <Badge variant="default" className="text-xs bg-green-600 text-white">
                                  Активный
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs bg-muted-foreground text-white">
                                  Неактивный
                                </Badge>
                              )}
                            </td>
                            <td className="p-3">
                              {organizer.website ? (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Globe className="h-3 w-3" />
                                  <a 
                                    href={organizer.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate max-w-32"
                                  >
                                    {organizer.website}
                                  </a>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Не указан</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex gap-2 justify-end">
                                <Link href={`/admin/organizers/${organizer.id}/edit`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteOrganizer(organizer.id, organizer.name)}
                                  disabled={deleting === organizer.id}
                                  className="text-destructive hover:text-destructive"
                                >
                                  {deleting === organizer.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Пагинация для организаторов */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-3 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Показано {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, organizers.length)} из {organizers.length} организаторов
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Назад
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Вперед
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

                       {/* Вкладка Типы кэмпов */}
            {activeTab === 'campTypes' && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Загрузка типов кэмпов...</span>
                  </div>
                ) : campTypes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Типы кэмпов не найдены</p>
                    <p className="text-sm">Создайте новый тип кэмпа</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium text-sm">Название</th>
                          <th className="text-left p-3 font-medium text-sm">Описание</th>
                          <th className="text-left p-3 font-medium text-sm">Цвет</th>
                          <th className="text-right p-3 font-medium text-sm">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCampTypes.map((campType) => (
                          <tr key={campType.id} className="border-t">
                            <td className="p-3">
                              <div className="font-medium">{campType.name}</div>
                            </td>
                            <td className="p-3">
                              {campType.description && (
                                <div className="text-sm text-muted-foreground">{campType.description}</div>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge 
                                style={{ 
                                  backgroundColor: campType.color || '#6b7280',
                                  color: 'white'
                                }}
                                className="text-xs"
                              >
                                {campType.name}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex gap-2 justify-end">
                                <Link href={`/admin/camp-types/${campType.id}/edit`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCampType(campType.id, campType.name)}
                                  disabled={deleting === campType.id}
                                  className="text-destructive hover:text-destructive"
                                >
                                  {deleting === campType.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Пагинация для типов кэмпов */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-3 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Показано {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, campTypes.length)} из {campTypes.length} типов кэмпов
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Назад
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Вперед
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
         </CardContent>
       </Card>
    </div>
    </AdminOnly>
  );
}; 