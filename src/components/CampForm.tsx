'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, Plus, X, Upload } from 'lucide-react';
import { CreateCampData, CampVariant, Camp, CampType } from '@/types/camp';
import { CampType as CampTypeEntity } from '@/types/campType';
import { getActiveCampTypes } from '@/lib/campTypeService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useOrganizers } from '@/hooks/useOrganizers';

interface CampFormProps {
  onSubmit: (campData: CreateCampData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Camp | null;
  isEditing?: boolean;
}

export const CampForm: React.FC<CampFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateCampData>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    type: '',
    status: 'draft',
    price: undefined,
    variants: [],
    organizerId: '',
    image: '',
    campUrl: '',
    directBooking: false,
    features: [],
    included: [],
  });

  const [newFeature, setNewFeature] = useState('');
  const [newIncluded, setNewIncluded] = useState('');
  const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useVariants, setUseVariants] = useState(false);
  const [campTypes, setCampTypes] = useState<CampTypeEntity[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const { organizers, loading: loadingOrganizers, error: errorOrganizers } = useOrganizers();

  // Загружаем типы кэмпов из базы данных
  useEffect(() => {
    const loadCampTypes = async () => {
      try {
        setLoadingTypes(true);
        console.log('🔍 Загружаем типы кэмпов из базы данных...');
        const types = await getActiveCampTypes();
        setCampTypes(types);
        
        // Если типов нет в базе, используем статические
        if (types.length === 0) {
          console.log('Типы кэмпов не найдены в базе, используем статические');
        } else {
          console.log('✅ Загружено типов кэмпов:', types.length, types.map(t => t.name));
        }
      } catch (error) {
        console.error('Ошибка загрузки типов кэмпов:', error);
        toast.error('Не удалось загрузить типы кэмпов');
      } finally {
        setLoadingTypes(false);
      }
    };

    loadCampTypes();
  }, []);

  // Статические типы для fallback
  const staticCampTypes: CampType[] = [
    'летний',
    'зимний',
    'языковой',
    'спортивный',
    'творческий',
    'технический',
    'приключенческий',
    'образовательный',
  ];

  // Используем типы из базы данных или статические
  const availableTypes = campTypes.length > 0 ? campTypes.map(t => t.name) : staticCampTypes;
  
  // Проверяем, есть ли текущий тип в доступных типах
  const currentTypeExists = availableTypes.includes(formData.type);

  useEffect(() => {
    // Ждем, когда загрузятся организаторы и initialData
    if (initialData && !loadingOrganizers && organizers.length > 0) {
      // Сравниваем id через String.trim()
      const orgId = String(initialData.organizerId || '').trim();
      const orgExists = organizers.some(o => String(o.id).trim() === orgId);
      console.log('[CampForm] useEffect: initialData.organizerId =', orgId);
      console.log('[CampForm] useEffect: organizers =', organizers.map(o => o.id));
      console.log('[CampForm] useEffect: orgExists =', orgExists);
      setFormData({
        title: initialData.title,
        description: initialData.description,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        location: initialData.location,
        type: initialData.type || (availableTypes.length > 0 ? availableTypes[0] : ''),
        status: initialData.status,
        price: initialData.price,
        variants: initialData.variants || [],
        organizerId: orgExists ? orgId : '',
        image: initialData.image || '',
        campUrl: initialData.campUrl || '',
        directBooking: initialData.directBooking || false,
        features: initialData.features,
        included: initialData.included,
      });
      setUseVariants(Boolean(initialData.variants && initialData.variants.length > 0));
    }
  }, [initialData, loadingOrganizers, organizers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.title.trim()) {
      toast.error('Название кэмпа обязательно');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Описание кэмпа обязательно');
      return;
    }
    
    if (!formData.organizerId) {
      toast.error('Организатор обязателен');
      return;
    }
    
    if (!formData.location.trim()) {
      toast.error('Местоположение обязательно');
      return;
    }
    
    if (!formData.campUrl.trim()) {
      toast.error('Ссылка на кэмп обязательна');
      return;
    }
    
    // Проверяем, что ссылка имеет правильный формат
    try {
      new URL(formData.campUrl);
    } catch {
      toast.error('Ссылка на кэмп должна быть в правильном формате (например, https://example.com)');
      return;
    }
    
    if (!formData.type || formData.type.trim() === '') {
      toast.error('Тип кэмпа обязателен');
      return;
    }
    
    // Проверяем, что выбранный тип существует в доступных типах
    if (!availableTypes.includes(formData.type)) {
      toast.error('Выбранный тип кэмпа не существует');
      return;
    }
    
    if (formData.endDate <= formData.startDate) {
      toast.error('Дата окончания должна быть позже даты начала');
      return;
    }

    // Проверяем варианты или базовую цену
    if (useVariants) {
      if (!formData.variants || formData.variants.length === 0) {
        toast.error('Добавьте хотя бы один вариант участия');
        return;
      }
      
      // Проверяем каждый вариант
      for (const variant of formData.variants) {
        if (!variant.name.trim()) {
          toast.error('Название варианта обязательно');
          return;
        }
        if (!variant.description.trim()) {
          toast.error('Описание варианта обязательно');
          return;
        }
        // Цена может быть не указана (price по запросу)
        if (variant.price !== undefined && variant.price <= 0) {
          toast.error('Цена варианта должна быть больше 0 или не указана');
          return;
        }
      }
    }
    // Базовая цена теперь необязательна

    try {
      // Подготавливаем данные для отправки
      const submitData = {
        ...formData,
        // Убираем неиспользуемые поля
        ...(useVariants ? { price: undefined } : { variants: undefined }),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Ошибка сохранения кэмпа:', error);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const addIncluded = () => {
    if (newIncluded.trim() && !formData.included.includes(newIncluded.trim())) {
      setFormData(prev => ({
        ...prev,
        included: [...prev.included, newIncluded.trim()]
      }));
      setNewIncluded('');
    }
  };

  const removeIncluded = (item: string) => {
    setFormData(prev => ({
      ...prev,
      included: prev.included.filter(i => i !== item)
    }));
  };

  const addVariant = () => {
    const newVariant: CampVariant = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const removeVariant = (variantId: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== variantId) || []
    }));
  };

  const updateVariant = (variantId: string, field: keyof CampVariant, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v => 
        v.id === variantId ? { ...v, [field]: value } : v
      ) || []
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Здесь можно добавить логику для загрузки файла
      toast.info('Функция загрузки файлов в разработке');
    }
  };

  // Проверяем, загружены ли все необходимые данные для редактирования
  const isDataLoading = isEditing && (loadingOrganizers || loadingTypes);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Редактировать кэмп' : 'Создать новый кэмп'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Измените информацию о кэмпе'
            : 'Заполните информацию для создания нового кэмпа'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isDataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Загрузка данных...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="mb-2 block">Название кэмпа *</Label>
              <Input
                id="title"
                placeholder="Введите название кэмпа"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={isLoading}
                className="cursor-text"
              />
            </div>

            <div>
              <Label htmlFor="organizer" className="mb-2 block">Организатор *</Label>
              <Select
                key={formData.organizerId + '-' + organizers.map(o => o.id).join(',')}
                value={formData.organizerId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, organizerId: value }))}
                disabled={isLoading || loadingOrganizers}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder={loadingOrganizers ? 'Загрузка...' : (formData.organizerId ? organizers.find(o => String(o.id).trim() === String(formData.organizerId).trim())?.name : 'Выберите организатора')} />
                </SelectTrigger>
                <SelectContent>
                  {organizers.map((org) => (
                    <SelectItem key={org.id} value={org.id} className="cursor-pointer">
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorOrganizers && <div className="text-destructive text-sm mt-1">Ошибка загрузки организаторов</div>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">Описание кэмпа *</Label>
            <Textarea
              id="description"
              placeholder="Подробное описание программы кэмпа, что ждет участников"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isLoading}
              rows={4}
              className="cursor-text"
            />
          </div>

          {/* Даты */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Дата начала *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cursor-pointer",
                      !formData.startDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="mb-2 block">Дата окончания *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cursor-pointer",
                      !formData.endDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Местоположение и ссылка на кэмп */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="location" className="mb-2 block">Местоположение *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Например: Подмосковье, база отдыха 'Березки'"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10 cursor-text"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="campUrl" className="mb-2 block">Ссылка на кэмп *</Label>
              <div className="relative">
                <Input
                  id="campUrl"
                  placeholder="https://example.com/camp"
                  value={formData.campUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, campUrl: e.target.value }))}
                  className="cursor-text"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Введите полную ссылку на страницу кэмпа (например, https://example.com/camp)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="directBooking" className="mb-2 block">Прямое бронирование</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="directBooking"
                  checked={formData.directBooking}
                  onChange={(e) => setFormData(prev => ({ ...prev, directBooking: e.target.checked }))}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                <Label htmlFor="directBooking" className="cursor-pointer text-sm">
                  Разрешить прямое бронирование на сайте
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Если включено, пользователи смогут оставлять заявки на бронирование прямо на сайте
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="type" className="mb-2 block">Тип кэмпа *</Label>
              <Select
                key={`type-${formData.type}`}
                value={formData.type}
                onValueChange={(value: CampType) => setFormData(prev => ({ ...prev, type: value }))}
                disabled={isLoading || loadingTypes}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder={formData.type ? formData.type : "Не указано"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type} className="cursor-pointer">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ценообразование */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="singlePrice"
                checked={!useVariants}
                onChange={() => setUseVariants(false)}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <Label htmlFor="singlePrice" className="cursor-pointer">Базовая цена</Label>
              
              <input
                type="radio"
                id="variants"
                checked={useVariants}
                onChange={() => setUseVariants(true)}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <Label htmlFor="variants" className="cursor-pointer">Варианты участия</Label>
            </div>

            {!useVariants ? (
              <div>
                <Label htmlFor="price" className="mb-2 block">Базовая цена (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Введите стоимость участия (или оставьте пустым для 'цена по запросу')"
                  value={formData.price || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      price: value === '' ? undefined : parseFloat(value) || undefined 
                    }));
                  }}
                  disabled={isLoading}
                  className="cursor-text"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Если цена не указана, будет отображаться "Цена по запросу"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Варианты участия *</Label>
                  <Button
                    type="button"
                    onClick={addVariant}
                    disabled={isLoading}
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить вариант
                  </Button>
                </div>
                
                {formData.variants?.map((variant, index) => (
                  <div key={variant.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Вариант {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        disabled={isLoading}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Название *</Label>
                          <Input
                            placeholder="Например: Стандарт"
                            value={variant.name}
                            onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                            disabled={isLoading}
                            className="cursor-text"
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block">Цена (₽)</Label>
                          <Input
                            type="number"
                            placeholder="Оставьте пустым для 'цена по запросу'"
                            value={variant.price || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateVariant(variant.id, 'price', value === '' ? undefined : parseFloat(value) || undefined);
                            }}
                            disabled={isLoading}
                            className="cursor-text"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Описание *</Label>
                        <Textarea
                          placeholder="Краткое описание"
                          value={variant.description}
                          onChange={(e) => updateVariant(variant.id, 'description', e.target.value)}
                          disabled={isLoading}
                          className="cursor-text min-h-[80px] w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Изображение */}
          <div className="space-y-4">
            <Label>Изображение кэмпа</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="url"
                  checked={imageInputType === 'url'}
                  onChange={() => setImageInputType('url')}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                <Label htmlFor="url" className="cursor-pointer">URL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="file"
                  checked={imageInputType === 'file'}
                  onChange={() => setImageInputType('file')}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                <Label htmlFor="file" className="cursor-pointer">Файл</Label>
              </div>
            </div>
            
            {imageInputType === 'url' ? (
              <div className="relative">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  disabled={isLoading}
                  className="cursor-text"
                />
              </div>
            ) : (
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="pl-10 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Особенности */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Особенности кэмпа</Label>
              <Button
                type="button"
                onClick={addFeature}
                disabled={isLoading || !newFeature.trim()}
                size="sm"
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Например: Wi-Fi, бассейн, спортзал"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                disabled={isLoading}
                className="cursor-text"
              />
            </div>
            
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="cursor-default">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      disabled={isLoading}
                      className="ml-1 hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Что включено */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Что включено в стоимость</Label>
              <Button
                type="button"
                onClick={addIncluded}
                disabled={isLoading || !newIncluded.trim()}
                size="sm"
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Например: Проживание, питание, трансфер"
                value={newIncluded}
                onChange={(e) => setNewIncluded(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
                disabled={isLoading}
                className="cursor-text"
              />
            </div>
            
            {formData.included.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.included.map((item, index) => (
                  <Badge key={index} variant="outline" className="cursor-default">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeIncluded(item)}
                      disabled={isLoading}
                      className="ml-1 hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="cursor-pointer"
              >
                Отмена
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Сохранение...
                </>
              ) : (
                <>
                  {isEditing ? 'Сохранить изменения' : 'Создать кэмп'}
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  );
}; 