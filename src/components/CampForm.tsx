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
import { CalendarIcon, MapPin, Users, Plus, X, Upload, Link as LinkIcon } from 'lucide-react';
import { CampType, CampDifficulty, CreateCampData, CampVariant, Camp } from '@/types/camp';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CampFormProps {
  onSubmit: (campData: CreateCampData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Camp | null;
  isEditing?: boolean;
}

const campTypes: CampType[] = [
  'летний',
  'зимний',
  'языковой',
  'спортивный',
  'творческий',
  'технический',
  'приключенческий',
  'образовательный',
];

const difficulties: CampDifficulty[] = [
  'начинающий',
  'средний',
  'продвинутый',
  'экспертный',
];

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
    type: 'летний',
    price: undefined,
    variants: [],
    organizer: '',
    image: '',
    features: [],
    difficulty: 'начинающий',
    ageGroup: '',
    included: [],
  });

  const [newFeature, setNewFeature] = useState('');
  const [newIncluded, setNewIncluded] = useState('');
  const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useVariants, setUseVariants] = useState(false);

  // Инициализация формы с данными для редактирования
  useEffect(() => {
    if (initialData && isEditing) {
      console.log('🔄 Инициализация формы с данными для редактирования:', initialData);
      setFormData({
        title: initialData.title,
        description: initialData.description,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        location: initialData.location,
        type: initialData.type,
        price: initialData.price,
        variants: initialData.variants || [],
        organizer: initialData.organizer,
        image: initialData.image || '',
        features: initialData.features || [],
        difficulty: initialData.difficulty,
        ageGroup: initialData.ageGroup,
        included: initialData.included || [],
      });

      // Устанавливаем режим вариантов если они есть
      if (initialData.variants && initialData.variants.length > 0) {
        setUseVariants(true);
      }
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!formData.title.trim()) {
      toast.error('Введите название кэмпа');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Введите описание кэмпа');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Введите местоположение');
      return;
    }

    if (!formData.organizer.trim()) {
      toast.error('Введите организатора');
      return;
    }

    if (!formData.ageGroup.trim()) {
      toast.error('Введите возрастную группу');
      return;
    }

    // Проверяем цену только если не используются варианты
    if (!useVariants && (formData.price === undefined || formData.price <= 0)) {
      toast.error('Введите корректную стоимость');
      return;
    }

    // Если используются варианты, проверяем их валидность
    if (useVariants) {
      if (!formData.variants || formData.variants.length === 0) {
        toast.error('Добавьте хотя бы один вариант');
        return;
      }

      for (const variant of formData.variants) {
        if (!variant.name.trim()) {
          toast.error('Введите название для всех вариантов');
          return;
        }
        if (!variant.description.trim()) {
          toast.error('Введите описание для всех вариантов');
          return;
        }
        if (variant.price <= 0) {
          toast.error('Введите корректную цену для всех вариантов');
          return;
        }
      }
    }

    if (formData.startDate >= formData.endDate) {
      toast.error('Дата окончания должна быть позже даты начала');
      return;
    }

    try {
      // Если выбран файл, можно здесь добавить логику загрузки в cloud storage
      let imageUrl = formData.image;
      if (imageInputType === 'file' && selectedFile) {
        // TODO: Здесь будет логика загрузки файла в Firebase Storage
        toast.info('Загрузка файла будет реализована позже. Используйте URL изображения.');
        return;
      }

      await onSubmit({
        ...formData,
        image: imageUrl,
        // Исключаем price если используются варианты
        ...(useVariants ? {} : { price: formData.price }),
        // Исключаем variants если не используются
        ...(useVariants ? { variants: formData.variants } : {}),
      });
    } catch (error: any) {
      console.error('Ошибка создания кэмпа:', error);
      toast.error(error.message || 'Не удалось создать кэмп');
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

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
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

  const removeIncluded = (index: number) => {
    setFormData(prev => ({
      ...prev,
      included: prev.included.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Создаем временный URL для превью
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
    }
  };

  const addVariant = () => {
    const variantCount = formData.variants?.length || 0;
    const defaultNames = ['Стандарт', 'Премиум', 'VIP', 'Делюкс', 'Эконом'];
    const defaultDescriptions = ['Базовый пакет', 'Расширенный пакет', 'Премиум пакет', 'Делюкс пакет', 'Эконом пакет'];
    
    const newVariant: CampVariant = {
      id: Math.random().toString(36).substr(2, 9),
      name: defaultNames[variantCount] || `Вариант ${variantCount + 1}`,
      description: defaultDescriptions[variantCount] || `Пакет ${variantCount + 1}`,
      price: 0,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const updateVariant = (id: string, field: keyof CampVariant, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(variant =>
        variant.id === id
          ? { ...variant, [field]: value }
          : variant
      ) || []
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(variant => variant.id !== id) || []
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {isEditing ? 'Редактирование кэмпа' : 'Создание нового кэмпа'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Обновите информацию о кэмпе. Все поля, отмеченные *, обязательны для заполнения.'
            : 'Заполните информацию о кэмпе. Все поля, отмеченные *, обязательны для заполнения.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-2 block">Название кэмпа *</Label>
                <Input
                  id="title"
                  placeholder="Например: IT-буткэмп Tech Retreat"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="organizer" className="mb-2 block">Организатор *</Label>
                <Input
                  id="organizer"
                  placeholder="Название организации"
                  value={formData.organizer}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="location" className="mb-2 block">Местоположение *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Город, адрес или регион"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ageGroup" className="mb-2 block">Возрастная группа *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ageGroup"
                    placeholder="Например: 14+ лет или Все возрасты"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="type" className="mb-2 block">Тип кэмпа</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: CampType) => setFormData(prev => ({ ...prev, type: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип кэмпа" />
                  </SelectTrigger>
                  <SelectContent>
                    {campTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty" className="mb-2 block">Сложность</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: CampDifficulty) => setFormData(prev => ({ ...prev, difficulty: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сложность" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ценообразование */}
              <div>
                <Label className="mb-3 block">Ценообразование *</Label>
                <div className="space-y-4">
                  {/* Переключатель между простой ценой и вариантами */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={!useVariants ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setUseVariants(false);
                          setFormData(prev => ({ ...prev, variants: [] }));
                        }}
                        disabled={isLoading}
                      >
                        Фиксированная цена
                      </Button>
                      <Button
                        type="button"
                        variant={useVariants ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setUseVariants(true);
                          setFormData(prev => ({ ...prev, price: undefined }));
                          // Добавляем первый вариант автоматически
                          if (!formData.variants || formData.variants.length === 0) {
                            const firstVariant: CampVariant = {
                              id: Math.random().toString(36).substr(2, 9),
                              name: 'Стандарт',
                              description: 'Базовый пакет',
                              price: 0,
                            };
                            setFormData(prev => ({
                              ...prev,
                              variants: [firstVariant]
                            }));
                          }
                        }}
                        disabled={isLoading}
                      >
                        Варианты участия
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {!useVariants 
                        ? 'Одна цена для всех участников'
                        : 'Разные варианты участия с разными ценами (например: Стандарт, Премиум, VIP)'
                      }
                    </p>
                  </div>

                  {/* Простая цена */}
                  {!useVariants && (
                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">₽</span>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          placeholder="85000"
                          value={formData.price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                          className="pl-8"
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Укажите стоимость участия в рублях
                      </p>
                    </div>
                  )}

                  {/* Варианты */}
                  {useVariants && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Варианты участия</strong> позволяют предложить разные пакеты услуг. 
                          Например: "Стандарт" (50,000₽), "Премиум" (75,000₽), "VIP" (100,000₽)
                        </p>
                      </div>
                      
                      {formData.variants?.map((variant, index) => (
                        <Card key={variant.id} className="p-4 border-l-4 border-l-blue-500">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-medium text-blue-700">
                              Вариант {index + 1}
                            </h4>
                            {formData.variants && formData.variants.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariant(variant.id)}
                                disabled={isLoading}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs font-medium">Название *</Label>
                              <Input
                                placeholder="Стандарт"
                                value={variant.name}
                                onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                disabled={isLoading}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Описание *</Label>
                              <Input
                                placeholder="Базовый пакет"
                                value={variant.description}
                                onChange={(e) => updateVariant(variant.id, 'description', e.target.value)}
                                disabled={isLoading}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Цена (₽) *</Label>
                              <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">₽</span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="50000"
                                  value={variant.price || ''}
                                  onChange={(e) => updateVariant(variant.id, 'price', parseInt(e.target.value) || 0)}
                                  className="pl-8"
                                  disabled={isLoading}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                        disabled={isLoading}
                        className="w-full border-dashed border-2 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить вариант участия
                      </Button>
                      
                      {formData.variants && formData.variants.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Добавлено вариантов: {formData.variants.length}. 
                          На странице кэмпа будет показан диапазон цен от минимальной до максимальной.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Изображение */}
              <div>
                <Label className="mb-2 block">Изображение кэмпа</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={imageInputType === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageInputType('url')}
                      disabled={isLoading}
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={imageInputType === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageInputType('file')}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Файл
                    </Button>
                  </div>

                  {imageInputType === 'url' ? (
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      disabled={isLoading}
                    />
                  ) : (
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Выбран файл: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Превью изображения"
                        className="w-full h-32 object-cover rounded-md border"
                        onError={() => toast.error('Не удалось загрузить изображение')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Даты */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Дата начала *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "dd MMMM yyyy", { locale: ru })
                    ) : (
                      <span>Выберите дату начала</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date || new Date() }))}
                    disabled={isLoading}
                    initialFocus
                    locale={ru}
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
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "dd MMMM yyyy", { locale: ru })
                    ) : (
                      <span>Выберите дату окончания</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date || new Date() }))}
                    disabled={isLoading}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Описание */}
          <div>
            <Label htmlFor="description" className="mb-2 block">Описание *</Label>
            <Textarea
              id="description"
              placeholder="Подробное описание кэмпа, программы, что входит в стоимость..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Особенности */}
          <div>
            <Label className="mb-3 block">Особенности и удобства</Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Добавить особенность"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                disabled={isLoading}
              />
              <Button type="button" onClick={addFeature} disabled={isLoading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {feature}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 p-0 h-auto"
                    onClick={() => removeFeature(index)}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Что включено */}
          <div>
            <Label className="mb-3 block">Что включено в стоимость</Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Добавить услугу"
                value={newIncluded}
                onChange={(e) => setNewIncluded(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
                disabled={isLoading}
              />
              <Button type="button" onClick={addIncluded} disabled={isLoading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.included.map((item, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {item}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 p-0 h-auto"
                    onClick={() => removeIncluded(index)}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (isEditing ? 'Обновление...' : 'Создание...') 
                : (isEditing ? 'Обновить кэмп' : 'Создать кэмп')
              }
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Отмена
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 