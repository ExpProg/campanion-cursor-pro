'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { CampCard } from '@/components/CampCard';
import { useCamps } from '@/hooks/useCamps';
import { useAuthRole } from '@/hooks/useRole';
import { Camp } from '@/types/camp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { Mountain, Loader2, RefreshCw, AlertCircle, MapPin, X, ChevronDown, ChevronUp, Filter, Archive } from 'lucide-react';

export default function CampsPage() {
  const [locationInput, setLocationInput] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState<string>('');
  const [priceTo, setPriceTo] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showArchivedCamps, setShowArchivedCamps] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { camps, allCamps, loading, error, refetch } = useCamps();
  const { isAdmin } = useAuthRole();

  // Получаем уникальные места
  const uniqueLocations = useMemo(() => {
    const locations = camps.map((camp: Camp) => camp.location);
    return Array.from(new Set(locations)).sort();
  }, [camps]);

  // Фильтруем места для подсказок
  const filteredSuggestions = useMemo(() => {
    if (!locationInput) return uniqueLocations.slice(0, 10); // Показываем первые 10 мест при пустом поле
    return uniqueLocations.filter(location => 
      location.toLowerCase().includes(locationInput.toLowerCase())
    );
  }, [uniqueLocations, locationInput]);

  // Выбираем список кэмпов для фильтрации
  const campsToFilter = showArchivedCamps && isAdmin ? allCamps : camps;

  // Фильтрация кэмпов
  const filteredCamps = useMemo(() => {
    return campsToFilter.filter((camp: Camp) => {
      const matchesLocation = !locationInput || camp.location.toLowerCase().includes(locationInput.toLowerCase());
      
      const matchesStartDate = !startDate || camp.startDate >= startDate;
      const matchesEndDate = !endDate || camp.endDate <= endDate;
      
      // Фильтрация по месяцам
      const matchesMonths = selectedMonths.length === 0 || 
        selectedMonths.includes(camp.startDate.getMonth()) ||
        selectedMonths.includes(camp.endDate.getMonth());

      // Фильтрация по категориям
      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.includes(camp.type);

      // Фильтрация по цене
      const priceFromValue = priceFrom ? parseFloat(priceFrom) : null;
      const priceToValue = priceTo ? parseFloat(priceTo) : null;
      
      let matchesPriceFrom = true;
      let matchesPriceTo = true;
      
      if (priceFromValue || priceToValue) {
        // Если есть варианты, проверяем по минимальной/максимальной цене вариантов
        if (camp.variants && camp.variants.length > 0) {
          const variantPrices = camp.variants.map(v => v.price);
          const minVariantPrice = Math.min(...variantPrices);
          const maxVariantPrice = Math.max(...variantPrices);
          
          matchesPriceFrom = !priceFromValue || maxVariantPrice >= priceFromValue;
          matchesPriceTo = !priceToValue || minVariantPrice <= priceToValue;
        } else if (camp.price) {
          // Если есть базовая цена, проверяем её
          matchesPriceFrom = !priceFromValue || camp.price >= priceFromValue;
          matchesPriceTo = !priceToValue || camp.price <= priceToValue;
        } else {
          // Если нет ни вариантов, ни цены, не показываем в результатах при фильтрации по цене
          matchesPriceFrom = false;
          matchesPriceTo = false;
        }
      }

      return matchesLocation && matchesStartDate && matchesEndDate && matchesMonths && matchesCategories && matchesPriceFrom && matchesPriceTo;
    });
  }, [campsToFilter, locationInput, startDate, endDate, selectedMonths, selectedCategories, priceFrom, priceTo]);

  // Названия месяцев
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Опции месяцев для MultiSelect
  const monthOptions = months.map((month, index) => ({
    value: index.toString(),
    label: month
  }));

  // Категории кэмпов
  const campCategories = [
    { value: 'летний', label: 'Летний' },
    { value: 'зимний', label: 'Зимний' },
    { value: 'языковой', label: 'Языковой' },
    { value: 'спортивный', label: 'Спортивный' },
    { value: 'творческий', label: 'Творческий' },
    { value: 'технический', label: 'Технический' },
    { value: 'приключенческий', label: 'Приключенческий' },
    { value: 'образовательный', label: 'Образовательный' }
  ];

  const toggleMonth = (monthIndex: number) => {
    setSelectedMonths(prev => 
      prev.includes(monthIndex) 
        ? prev.filter(m => m !== monthIndex)
        : [...prev, monthIndex]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleMonthsChange = (values: string[]) => {
    setSelectedMonths(values.map(v => parseInt(v)));
  };

  const handleCategoriesChange = (values: string[]) => {
    setSelectedCategories(values);
  };

  const clearFilters = () => {
    setLocationInput('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedMonths([]);
    setSelectedCategories([]);
    setPriceFrom('');
    setPriceTo('');
    setShowSuggestions(false);
    setShowArchivedCamps(false);
  };

  const hasActiveFilters = locationInput || startDate || endDate || selectedMonths.length > 0 || selectedCategories.length > 0 || priceFrom || priceTo || (isAdmin && showArchivedCamps);



  const handleLocationSelect = (location: string) => {
    setLocationInput(location);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    setShowSuggestions(true);
  };

  const handleLocationInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      e.preventDefault();
      handleLocationSelect(filteredSuggestions[0]);
    }
  };

  // Закрываем подсказки при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const suggestionsList = document.querySelector('[data-suggestions-list]');
      
      if (inputRef.current && 
          !inputRef.current.contains(target) && 
          (!suggestionsList || !suggestionsList.contains(target))) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);



  // Состояние загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Загрузка кэмпов...</h2>
          <p className="text-muted-foreground text-center">
            Подключаемся к базе данных и загружаем актуальную информацию
          </p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground text-center mb-4">
            {error}
          </p>
          <Button onClick={refetch} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mountain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Кэмпы для всех возрастов</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Откройте новые горизонты для себя и своих близких! Выберите идеальный кэмп из нашей коллекции программ для развития, обучения и незабываемого отдыха для всех возрастов.
        </p>
        
        {/* Счетчик кэмпов */}
        <div className="mt-4 text-sm text-muted-foreground">
          {isAdmin ? (
            <span>
              Показано {filteredCamps.length} из {allCamps.length} кэмпов
              {showArchivedCamps && ' (включая архивные)'}
            </span>
          ) : (
            <span>Найдено {filteredCamps.length} кэмпов</span>
          )}
        </div>
        

      </div>

      {/* Фильтры поиска */}
      <div className="bg-background border border-border rounded-lg p-6 mb-8">
        {/* Десктопная версия */}
        <div className="hidden lg:flex lg:flex-row gap-4 items-end">
          {/* Дата начала */}
          <div className="w-48">
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="Дата С"
              className="h-12"
            />
          </div>

          {/* Дата конца */}
          <div className="w-48">
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="Дата По"
              className="h-12"
            />
          </div>

          {/* Выбор места */}
          <div className="flex-1 relative">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Введите место проведения"
                value={locationInput}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleLocationInputKeyDown}
                className="pl-10 pr-10 h-12 text-base bg-background"
              />
              {locationInput && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationInput('');
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Список подсказок */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div 
                  data-suggestions-list 
                  className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                >
                  {!locationInput && (
                    <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border">
                      Популярные места
                    </div>
                  )}
                  {filteredSuggestions.map((location) => (
                    <button
                      key={location}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm border-b border-border last:border-b-0 transition-colors focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleLocationSelect(location);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{location}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Цена от */}
          <div className="w-36">
            <Input
              type="number"
              placeholder="Цена от"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="h-12 text-base bg-background"
            />
          </div>

          {/* Цена до */}
          <div className="w-36">
            <Input
              type="number"
              placeholder="Цена до"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="h-12 text-base bg-background"
            />
          </div>

          {/* Кнопки */}
          {hasActiveFilters && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters} className="h-12">
                Очистить
              </Button>
            </div>
          )}
        </div>

        {/* Мобильная и планшетная версия */}
        <div className="lg:hidden">
          {/* Кнопка показа/скрытия фильтров */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 h-12"
            >
              <Filter className="h-4 w-4" />
              <span>Фильтры</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {[locationInput, startDate, endDate, priceFrom, priceTo].filter(Boolean).length + selectedMonths.length + selectedCategories.length}
                </span>
              )}
              {showMobileFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="h-12 px-3">
                <span className="text-sm">Очистить все</span>
              </Button>
            )}
          </div>

          {/* Блок фильтров (скрываемый) */}
          {showMobileFilters && (
            <div className="flex flex-col gap-4 pb-4">
              {/* Первая строка: Даты */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <DatePicker
                    date={startDate}
                    onDateChange={setStartDate}
                    placeholder="Дата С"
                    className="h-12 w-full"
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    date={endDate}
                    onDateChange={setEndDate}
                    placeholder="Дата По"
                    className="h-12 w-full"
                  />
                </div>
              </div>

              {/* Вторая строка: Место */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Место проведения"
                      value={locationInput}
                      onChange={(e) => handleLocationInputChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={handleLocationInputKeyDown}
                      className="pl-10 pr-10 h-12 text-base bg-background"
                    />
                    {locationInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocationInput('');
                          setShowSuggestions(false);
                          inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    
                    {/* Список подсказок для мобильной версии */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div 
                        data-suggestions-list 
                        className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                      >
                        {!locationInput && (
                          <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border">
                            Популярные места
                          </div>
                        )}
                        {filteredSuggestions.map((location) => (
                          <button
                            key={location}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm border-b border-border last:border-b-0 transition-colors focus:bg-accent focus:text-accent-foreground focus:outline-none"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleLocationSelect(location);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{location}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Третья строка: Цены */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Цена от"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    className="h-12 text-base bg-background"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Цена до"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                    className="h-12 text-base bg-background"
                  />
                </div>
              </div>

              {/* Четвертая строка: Фильтры месяцев и категорий */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <MultiSelect
                    options={monthOptions}
                    selectedValues={selectedMonths.map(m => m.toString())}
                    onSelectionChange={handleMonthsChange}
                    placeholder="Месяц"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <MultiSelect
                    options={campCategories}
                    selectedValues={selectedCategories}
                    onSelectionChange={handleCategoriesChange}
                    placeholder="Категория"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Быстрые фильтры - Десктопная версия (теги) */}
        <div className="hidden lg:block">
          {/* Быстрые фильтры по месяцам */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {months.map((month, index) => (
                <Button
                  key={index}
                  variant={selectedMonths.includes(index) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleMonth(index)}
                  className="h-6 px-2 text-xs"
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Быстрые фильтры по категориям */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {campCategories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategories.includes(category.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category.value)}
                  className="h-6 px-2 text-xs"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>


      </div>

      {/* Фильтр для администраторов */}
      {isAdmin && (
        <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">Управление архивными кэмпами</span>
            </div>
            <Button
              variant={showArchivedCamps ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchivedCamps(!showArchivedCamps)}
              className="flex items-center gap-2"
            >
              {showArchivedCamps ? 'Скрыть архивные' : 'Показать все кэмпы'}
            </Button>
          </div>
          {showArchivedCamps && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Показано {filteredCamps.length} из {allCamps.length} кэмпов (включая архивные)</span>
                <Badge variant="secondary" className="text-xs">
                  Архивные: {allCamps.filter(camp => camp.status === 'archived').length}
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Результаты */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Найдено: <span className="font-semibold text-foreground">{filteredCamps.length}</span> {filteredCamps.length === 1 ? 'кэмп' : 'кэмпов'}
        </p>
      </div>

      {/* Сетка кэмпов */}
      {filteredCamps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCamps.map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Кэмпы не найдены
          </h3>
          <p className="text-muted-foreground mb-4">
            Попробуйте изменить критерии поиска или очистить фильтры
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>
              Показать все кэмпы
            </Button>
          )}
        </div>
      )}

      {/* Информационный блок */}
      <div className="mt-16 bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Не нашли подходящий кэмп?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Свяжитесь с нами, и мы поможем подобрать идеальную программу для ваших целей или расскажем о предстоящих новых кэмпах.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Связаться с нами
          </Button>
          <Button variant="outline" size="lg">
            Подписаться на новости
          </Button>
        </div>
      </div>
    </div>
  );
} 