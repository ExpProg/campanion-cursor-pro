import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { EventCategory, EventStatus } from "@/types/event"
import { CampType, CampDifficulty } from "@/types/camp"
import { CampType as CampTypeEntity } from "@/types/campType"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryColorClass(category: EventCategory): string {
  const colorMap: Record<EventCategory, string> = {
    'конференция': 'bg-primary/10 text-primary border-primary/20',
    'семинар': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'воркшоп': 'bg-violet-50 text-violet-700 border-violet-200',
    'встреча': 'bg-amber-50 text-amber-700 border-amber-200',
    'презентация': 'bg-rose-50 text-rose-700 border-rose-200',
    'вебинар': 'bg-sky-50 text-sky-700 border-sky-200',
    'другое': 'bg-muted text-muted-foreground border-muted-foreground/20',
  }
  
  return colorMap[category] || colorMap['другое']
}

export function getStatusColorClass(status: EventStatus): string {
  const colorMap: Record<EventStatus, string> = {
    'предстоящее': 'bg-primary/10 text-primary border-primary/20',
    'проходит': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'завершено': 'bg-muted text-muted-foreground border-muted-foreground/20',
    'отменено': 'bg-destructive/10 text-destructive border-destructive/20',
  }
  
  return colorMap[status] || colorMap['предстоящее']
}

// Функция для получения цвета из типа кэмпа из базы данных
export function getCampTypeColorFromDB(campTypes: CampTypeEntity[], typeName: string): string {
  const campType = campTypes.find(t => t.name === typeName);
  if (campType && campType.color) {
    // Используем inline стили для hex цветов
    return `text-white border`;
  }
  return getCampTypeColorClass(typeName as CampType);
}

// Функция для определения цвета текста на основе яркости фона
function getContrastTextColor(backgroundColor: string): string {
  // Убираем # если есть
  const hex = backgroundColor.replace('#', '');
  
  // Конвертируем hex в RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Вычисляем яркость по формуле YIQ
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Если яркость больше 128, используем черный текст, иначе белый
  return yiq >= 128 ? '#000000' : '#ffffff';
}

// Функция для получения inline стилей для цвета типа кэмпа
export function getCampTypeColorStyle(campTypes: CampTypeEntity[], typeName: string): React.CSSProperties {
  const campType = campTypes.find(t => t.name === typeName);
  if (campType && campType.color) {
    return {
      backgroundColor: campType.color,
      color: getContrastTextColor(campType.color),
      borderColor: campType.color,
    };
  }
  return {};
}

export function getCampTypeColorClass(type: CampType): string {
  const colorMap: Record<CampType, string> = {
    'летний': 'bg-amber-50 text-amber-700 border-amber-200',
    'зимний': 'bg-sky-50 text-sky-700 border-sky-200',
    'языковой': 'bg-violet-50 text-violet-700 border-violet-200',
    'спортивный': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'творческий': 'bg-rose-50 text-rose-700 border-rose-200',
    'технический': 'bg-primary/10 text-primary border-primary/20',
    'приключенческий': 'bg-orange-50 text-orange-700 border-orange-200',
    'образовательный': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }
  
  return colorMap[type] || colorMap['образовательный']
}

export function getDifficultyColorClass(difficulty?: CampDifficulty): string {
  if (!difficulty) {
    return 'bg-muted text-muted-foreground border-muted-foreground/20';
  }
  
  const colorMap: Record<CampDifficulty, string> = {
    'начинающий': 'bg-green-50 text-green-700 border-green-200',
    'средний': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'продвинутый': 'bg-orange-50 text-orange-700 border-orange-200',
    'экспертный': 'bg-red-50 text-red-700 border-red-200',
  }
  
  return colorMap[difficulty] || colorMap['начинающий']
}

// Функция для получения цвета типа кэмпа (значение цвета)
export function getCampTypeColorValue(campTypes: CampTypeEntity[], typeName: string): string {
  const campType = campTypes.find(t => t.name === typeName);
  if (campType && campType.color) {
    return campType.color;
  }
  return '#6b7280'; // fallback цвет
}

// Функция для получения стилей лейбла типа кэмпа
export function getCampTypeLabelStyle(campTypes: CampTypeEntity[], typeName: string): React.CSSProperties {
  const campType = campTypes.find(t => t.name === typeName);
  if (campType && campType.color) {
    return {
      backgroundColor: campType.color,
      color: getContrastTextColor(campType.color),
      borderColor: campType.color,
    };
  }
  return {};
}

// Функция для получения цвета placeholder для логотипа
export function getLogoPlaceholderColor(name: string): string {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6366f1', // indigo
  ];
  
  // Простая хеш-функция для получения индекса цвета
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Функция для получения инициалов из имени
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}
