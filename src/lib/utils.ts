import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { EventCategory, EventStatus } from "@/types/event"
import { CampType, CampDifficulty } from "@/types/camp"

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

export function getDifficultyColorClass(difficulty: CampDifficulty): string {
  const colorMap: Record<CampDifficulty, string> = {
    'начинающий': 'bg-green-50 text-green-700 border-green-200',
    'средний': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'продвинутый': 'bg-orange-50 text-orange-700 border-orange-200',
    'экспертный': 'bg-red-50 text-red-700 border-red-200',
  }
  
  return colorMap[difficulty] || colorMap['начинающий']
}
