import { Camp } from '@/types/camp';

export const sampleCamps: Camp[] = [
  {
    id: '1',
    title: 'IT-буткэмп "Tech Retreat"',
    description: 'Интенсивная программа для всех, кто хочет развиваться в IT: изучение новых технологий, создание проектов, нетворкинг с экспертами индустрии. Подходит как для начинающих, так и для опытных специалистов.',
    startDate: new Date('2024-07-15T10:00:00'),
    endDate: new Date('2024-07-29T18:00:00'),
    location: 'Подмосковье, база отдыха "Березки"',
    type: 'технический',
    price: 85000,
    organizer: 'Центр профессионального развития "CodePro"',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop&crop=center',
    features: ['Wi-Fi', 'Коворкинг-зоны', 'Проектная работа', 'Менторство', 'Networking-ужины'],
    difficulty: 'средний',
    ageGroup: '16+ лет',
    included: ['Проживание', '3-разовое питание', 'Учебные материалы', 'Сертификат', 'Трансфер'],
    createdAt: new Date('2024-01-15T09:00:00'),
    updatedAt: new Date('2024-01-15T09:00:00'),
  },
  {
    id: '2',
    title: 'Языковое погружение "English Immersion"',
    description: 'Интенсивный курс английского с носителями языка для всех уровней подготовки. От базового общения до деловой переписки. Индивидуальный подход к каждому участнику.',
    startDate: new Date('2024-08-05T09:00:00'),
    endDate: new Date('2024-08-19T17:00:00'),
    location: 'Сочи, бизнес-отель "Резиденция"',
    type: 'языковой',
    price: 95000,
    organizer: 'Международный центр "Global Languages"',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop&crop=center',
    features: ['Носители языка', 'Разговорные клубы', 'Индивидуальная работа', 'Интерактивные игры'],
    difficulty: 'средний',
    ageGroup: '14+ лет',
    included: ['Проживание', 'Питание', 'Учебные материалы', 'Сертификат', 'Культурная программа'],
    createdAt: new Date('2024-01-10T11:30:00'),
    updatedAt: new Date('2024-02-01T15:20:00'),
  },
  {
    id: '3',
    title: 'Фитнес-ретрит "Active Life"',
    description: 'Спортивный кэмп для всех возрастов и уровней подготовки: функциональные тренировки, йога, плавание, командные игры. Персональные планы от профессиональных тренеров.',
    startDate: new Date('2024-06-20T08:00:00'),
    endDate: new Date('2024-07-04T19:00:00'),
    location: 'Анапа, спортивный комплекс "Олимп"',
    type: 'спортивный',
    price: 75000,
    organizer: 'Фитнес-центр "Healthy Life"',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center',
    features: ['Современный тренажерный зал', 'Бассейн', 'SPA-зона', 'Групповые и персональные тренировки'],
    difficulty: 'средний',
    ageGroup: '12+ лет',
    included: ['Проживание', 'Здоровое питание', 'Оборудование', 'Медицинский контроль', 'Консультации'],
    createdAt: new Date('2024-01-05T16:45:00'),
    updatedAt: new Date('2024-01-26T10:00:00'),
  },
  {
    id: '4',
    title: 'Арт-резиденция "Creative Minds"',
    description: 'Творческий ретрит для художников всех возрастов: живопись, скульптура, цифровое искусство, фотография. Развитие творческих способностей в вдохновляющей атмосфере.',
    startDate: new Date('2024-07-01T10:00:00'),
    endDate: new Date('2024-07-15T18:00:00'),
    location: 'Суздаль, арт-резиденция "Вдохновение"',
    type: 'творческий',
    price: 68000,
    organizer: 'Галерея современного искусства "ArtSpace"',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&crop=center',
    features: ['Профессиональные мастерские', 'Галерея', 'Коворкинг для креативщиков', 'Выставка работ'],
    difficulty: 'начинающий',
    ageGroup: '10+ лет',
    included: ['Проживание', 'Питание', 'Материалы', 'Персональная выставка', 'Мастер-классы'],
    createdAt: new Date('2024-01-20T14:15:00'),
    updatedAt: new Date('2024-01-20T14:15:00'),
  },
  {
    id: '5',
    title: 'Приключенческий кэмп "Adventure Quest"',
    description: 'Активный отдых на природе: пеший туризм, скалолазание (безопасные маршруты), командные игры, квесты. Развитие уверенности в себе и навыков работы в команде.',
    startDate: new Date('2024-08-10T09:00:00'),
    endDate: new Date('2024-08-24T17:00:00'),
    location: 'Алтай, турбаза "Горный приют"',
    type: 'приключенческий',
    price: 89000,
    organizer: 'Клуб активного отдыха "Adventure Club"',
    image: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=250&fit=crop&crop=center',
    features: ['Безопасное снаряжение', 'Опытные инструкторы', 'Страховка', 'Экскурсии по природе'],
    difficulty: 'средний',
    ageGroup: '14+ лет',
    included: ['Проживание', 'Питание', 'Снаряжение', 'Инструкторы', 'Медицинская страховка'],
    createdAt: new Date('2024-01-12T10:20:00'),
    updatedAt: new Date('2024-02-01T09:45:00'),
  },
  {
    id: '6',
    title: 'Горнолыжный ретрит "Winter Fun"',  
    description: 'Зимний отдых для всей семьи: горные лыжи, сноуборд для всех уровней, детские склоны, зимние развлечения. Лыжные инструкторы для детей и взрослых, SPA и развлекательная программа.',
    startDate: new Date('2024-12-26T10:00:00'),
    endDate: new Date('2025-01-08T18:00:00'),
    location: 'Красная Поляна, Сочи',
    type: 'зимний',
    price: 125000,
    organizer: 'Семейный курорт "Winter Paradise"',
    image: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=250&fit=crop&crop=center',
    features: ['Семейные склоны', 'Детская школа лыж', 'Инструкторы разных уровней', 'SPA-центр', 'Развлечения'],
    difficulty: 'начинающий',
    ageGroup: 'Все возрасты',
    included: ['Комфортное проживание', 'Полноценное питание', 'Ски-пасс', 'Уроки катания', 'Развлекательная программа'],
    createdAt: new Date('2024-01-18T13:30:00'),
    updatedAt: new Date('2024-01-25T11:15:00'),
  },
]; 