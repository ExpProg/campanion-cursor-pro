# 🔐 Настройка Google аутентификации

## 📋 Что было добавлено

### ✅ Интеграция Google Auth в Firebase
- Обновлен `AuthContext` с функцией `loginWithGoogle()`
- Добавлена кнопка "Войти через Google" в `AuthForm`
- Использован `GoogleAuthProvider` из Firebase Auth
- Добавлены обработка ошибок и toast уведомления

### 🎨 UI компоненты
- **Google иконка** - SVG компонент с официальными цветами Google
- **Разделитель "Или"** между Google Auth и email/password формой
- **Responsive дизайн** с сохранением стиля приложения

## ⚙️ Необходимая настройка Firebase

### 1. Включение Google провайдера в Firebase Console

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `campanion-cursor`
3. Перейдите в **Authentication** → **Sign-in method**
4. Найдите **Google** и нажмите на него
5. Включите переключатель **Enable**
6. Укажите **Project public-facing name**: `project-22851781795`
7. Выберите **Project support email** (ваш email)
8. Нажмите **Save**

### 2. Добавление авторизованных доменов

В разделе **Authentication** → **Settings** → **Authorized domains** должны быть:
- `localhost` (для разработки)
- Ваш production домен (когда будете деплоить)

### 3. Получение Web App ID

1. В **Project Settings** → **General** → **Your apps**
2. Найдите веб-приложение
3. Скопируйте **App ID** и замените `PLACEHOLDER` в конфигурации

## 🔧 Переменные окружения

Создайте файл `.env.local` в корне проекта:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAGwzDlJp1E56x69KeyhWibHtvoTNWMQ4c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=campanion-cursor.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=campanion-cursor
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=campanion-cursor.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=22851781795
NEXT_PUBLIC_FIREBASE_APP_ID=ВАШ_РЕАЛЬНЫЙ_APP_ID
```

## 🚀 Как это работает

### Пользовательский флоу:
1. Пользователь нажимает "Войти через Google"
2. Открывается popup окно Google OAuth
3. Пользователь выбирает аккаунт и подтверждает разрешения
4. Firebase получает токен и создает пользователя
5. Пользователь автоматически входит в приложение

### Обработка ошибок:
- ✅ Popup заблокировано браузером
- ✅ Пользователь закрыл окно
- ✅ Отмена запроса
- ✅ Общие ошибки аутентификации

## 🔐 Безопасность

### Автоматически настроенные scopes:
- `profile` - доступ к основной информации профиля
- `email` - доступ к email адресу

### Что получает приложение:
- **displayName** - имя из Google аккаунта
- **email** - email адрес
- **photoURL** - аватар пользователя (если есть)
- **uid** - уникальный идентификатор Firebase

## 📱 Тестирование

### В режиме разработки:
1. Запустите `npm run dev`
2. Откройте `http://localhost:3000`
3. Нажмите "Войти через Google"
4. Используйте любой Google аккаунт для тестирования

### Возможные проблемы:
- **Popup блокировка** - разрешите popup'ы для localhost
- **CORS ошибки** - проверьте настройки Authorized domains
- **App ID ошибка** - убедитесь что App ID правильный

## 🎯 Результат

После успешной настройки пользователи смогут:
- ✅ Войти через Google одним кликом
- ✅ Автоматически получить имя и email из Google
- ✅ Использовать аватар из Google аккаунта
- ✅ Не вводить пароли (используется Google OAuth)

Все события будут привязаны к Google аккаунту пользователя через Firebase UID. 