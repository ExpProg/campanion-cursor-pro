# 🖼️ Функциональность изображений

## Обзор

Добавлена возможность прикрепления изображений к мероприятиям для более привлекательного визуального представления.

## Новые возможности

### 🎨 Отображение в карточках
- **Адаптивные изображения** - автоматическое масштабирование под размер карточки
- **Оптимизация производительности** - использование Next.js Image для быстрой загрузки
- **Hover эффекты** - плавное увеличение при наведении
- **Fallback** - корректная обработка ошибок загрузки

### 📤 Способы добавления изображений

#### 1. Загрузка файла
- Поддерживаемые форматы: JPG, PNG, GIF, WebP
- Максимальный размер: 5MB
- Автоматическое преобразование в base64 для localStorage
- Валидация типа и размера файла

#### 2. Ссылка на изображение
- Поддержка любых HTTPS URL
- Автоматическая проверка корректности ссылки
- Поддержка популярных сервисов (Unsplash, и др.)

### 🎯 UX улучшения
- **Превью изображения** в форме редактирования
- **Кнопка удаления** для быстрого удаления изображения
- **Drag & Drop** интерфейс для загрузки файлов
- **Разделитель "или"** между способами добавления
- **Уведомления** об ошибках и успешных операциях

## Технические детали

### Структура данных
```typescript
type Event = {
  // ... остальные поля
  image?: string; // URL или base64 строка
}
```

### Компоненты

#### EventCard.tsx
```tsx
// Отображение изображения в карточке
{event.image && (
  <div className="relative h-48 w-full overflow-hidden">
    <Image
      src={event.image}
      alt={event.title}
      fill
      className="object-cover transition-transform duration-200 hover:scale-105"
    />
  </div>
)}
```

#### EventForm.tsx
```tsx
// Функция загрузки файла
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Валидация размера и типа
    // Конвертация в base64
    // Обновление состояния формы
  }
};
```

### Конфигурация Next.js
```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    {
      protocol: 'https', 
      hostname: '**', // Все HTTPS домены
    },
  ],
}
```

## Примеры использования

### 1. Загрузка с компьютера
1. Откройте форму создания/редактирования мероприятия
2. В разделе "Изображение мероприятия" нажмите "Загрузить файл"
3. Выберите изображение (JPG, PNG до 5MB)
4. Изображение появится в превью
5. Сохраните мероприятие

### 2. Добавление по ссылке
1. Откройте форму создания/редактирования мероприятия
2. В поле "Вставьте ссылку на изображение..." введите URL
3. Изображение появится в превью
4. Сохраните мероприятие

### 3. Удаление изображения
1. В форме нажмите ❌ на превью изображения
2. Или очистите поле с URL
3. Изображение будет удалено

## Адаптивность

### Мобильные устройства
- Карточки с изображениями адаптируются под ширину экрана
- Превью в форме масштабируется корректно
- Touch-friendly кнопки управления

### Планшеты и десктоп
- Полноразмерные превью изображений
- Hover эффекты для лучшего UX
- Оптимизированное расположение элементов

## Оптимизация производительности

- **Next.js Image** - автоматическая оптимизация и lazy loading
- **WebP конвертация** - современные форматы изображений
- **Responsive images** - подходящие размеры для разных экранов
- **Base64 для localStorage** - быстрое локальное хранение

## Безопасность

- **Валидация типов файлов** - только изображения
- **Ограничение размера** - максимум 5MB
- **CSP настройки** - безопасная загрузка внешних ресурсов
- **Graceful fallback** - корректная обработка ошибок

## Будущие улучшения

- [ ] Поддержка множественных изображений
- [ ] Интеграция с CDN для хранения
- [ ] Автоматическое сжатие изображений
- [ ] Поддержка видео
- [ ] Drag & Drop в сам интерфейс
- [ ] Кроппинг изображений
- [ ] Автоматическое создание превью разных размеров

## Примеры изображений

В демонстрационных данных используются изображения с Unsplash:
- Конференции и технологические мероприятия
- Профессиональные фотографии мероприятий
- Современные офисные пространства
- AI и технологические темы

---

*Все изображения оптимизируются автоматически для лучшей производительности* 📱💻 