"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Выберите дату и время",
  disabled,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "10:00"
  );

  React.useEffect(() => {
    setSelectedDate(date);
    if (date) {
      setTimeValue(format(date, "HH:mm"));
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    // Парсим текущее время
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    // Создаем новую дату с выбранным временем
    const dateWithTime = new Date(newDate);
    dateWithTime.setHours(hours, minutes, 0, 0);
    
    setSelectedDate(dateWithTime);
    onDateChange?.(dateWithTime);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    
    if (!selectedDate) return;

    const [hours, minutes] = newTime.split(':').map(Number);
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours, minutes, 0, 0);
    
    setSelectedDate(newDateTime);
    onDateChange?.(newDateTime);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "dd MMMM yyyy, HH:mm", { locale: ru })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="border-b border-border p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabled}
              initialFocus
              locale={ru}
            />
          </div>
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="time" className="text-sm font-medium">
                Время:
              </Label>
              <Input
                id="time"
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-auto"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="p-3 border-t flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setSelectedDate(undefined);
                onDateChange?.(undefined);
                setOpen(false);
              }}
            >
              Очистить
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={!selectedDate}
            >
              Готово
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 