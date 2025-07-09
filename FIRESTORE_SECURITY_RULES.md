# Настройка Firestore Security Rules

## Проблема
При попытке доступа к Firestore получается ошибка 400 (Bad Request), так как по умолчанию база данных заблокирована и запрещает все операции.

## Решение
Необходимо настроить правила безопасности (Security Rules) в Firebase Console.

## Пошаговая инструкция

### 1. Откройте Firebase Console
1. Перейдите на https://console.firebase.google.com/
2. Выберите проект `campanion-cursor`

### 2. Найдите Firestore Database
1. В левом меню найдите **"Firestore Database"**
2. Нажмите на **"Rules"** (Правила) в верхней части страницы

### 3. Замените правила
Скопируйте и вставьте следующие правила в редактор:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для коллекции camps
    match /camps/{campId} {
      // Разрешить всем читать данные о кемпах (публичное чтение)
      allow read: if true;
      
      // Разрешить только аутентифицированным пользователям создавать/изменять/удалять кемпы
      allow write: if request.auth != null;
    }
    
    // Правила для коллекции events (если используется)
    match /events/{eventId} {
      // Разрешить читать только аутентифицированным пользователям
      allow read: if request.auth != null;
      
      // Разрешить записывать только владельцу события или если userId совпадает
      allow write: if request.auth != null && 
                      (request.auth.uid == resource.data.userId || 
                       request.auth.uid == request.resource.data.userId);
    }
    
    // Правила для других коллекций - по умолчанию требуют аутентификации
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Опубликуйте правила
1. Нажмите кнопку **"Publish"** (Опубликовать)
2. Подтвердите публикацию правил

## Объяснение правил

### Коллекция `camps`:
- **Чтение**: Разрешено всем (публичный доступ)
- **Запись**: Только для аутентифицированных пользователей

### Коллекция `events`:
- **Чтение**: Только для аутентифицированных пользователей
- **Запись**: Только для владельца события

### Остальные коллекции:
- **Чтение и запись**: Только для аутентифицированных пользователей

## Применение изменений
После публикации правил изменения вступят в силу в течение 1 минуты для новых запросов и до 10 минут для активных подключений.

## Проверка
После настройки правил приложение должно успешно загружать данные о кемпах без ошибок 400.

## Устранение ошибки "invalid data. Unsupported field value: undefined"

### Проблема
При загрузке данных возникала ошибка:
```
FirebaseError: Function addDoc() called with invalid data. Unsupported field value: undefined (found in field id)
```

### Причина
В AdminPanel.tsx при подготовке данных для загрузки устанавливалось поле `id: undefined`, что не поддерживается Firestore.

### Решение
Применено комплексное исправление в нескольких файлах:

**1. AdminPanel.tsx** - корректное удаление поля `id`:
```javascript
// ❌ Неправильно (вызывает ошибку)
const campsToSeed = sampleCamps.map(camp => ({
  ...camp,
  id: undefined  // Firestore не поддерживает undefined
}));

// ✅ Правильно (убираем поле id)
const campsToSeed = sampleCamps.map(camp => {
  const { id, ...campWithoutId } = camp;
  return campWithoutId;
});
```

**2. camps.ts** - улучшена функция `campToFirestore`:
```javascript
const campToFirestore = (camp: Omit<Camp, 'id'>) => {
  // Явно исключаем поле id, даже если оно есть в объекте
  const { id, ...campData } = camp as any;
  
  return {
    ...campData,
    startDate: dateToTimestamp(campData.startDate),
    endDate: dateToTimestamp(campData.endDate),
    createdAt: dateToTimestamp(campData.createdAt),
    updatedAt: dateToTimestamp(campData.updatedAt)
  };
};
```

**3. Добавлено отладочное логирование** в функцию `addCamp` для контроля данных.

### Статус
✅ **Исправлено**: Загрузка данных в Firestore теперь работает корректно с множественной защитой от поля `id`.

## Альтернативные правила для разработки

Если нужно временно разрешить все операции для разработки (НЕ ИСПОЛЬЗУЙТЕ В ПРОДАКШЕНЕ):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ВНИМАНИЕ**: Эти правила разрешают полный доступ любому пользователю и должны использоваться ТОЛЬКО для разработки! 