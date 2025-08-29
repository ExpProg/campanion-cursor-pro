'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Palette, Type, Hash, Sparkles } from 'lucide-react';
import { CampType, CreateCampTypeData, UpdateCampTypeData } from '@/types/campType';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CampTypeFormProps {
  onSubmit: (data: CreateCampTypeData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: CampType | null;
  isEditing?: boolean;
}

const predefinedColors = [
  '#f59e0b', '#0ea5e9', '#8b5cf6', '#10b981', '#f43f5e', '#6366f1', '#f97316', '#4f46e5',
  '#ef4444', '#06b6d4', '#84cc16', '#ec4899', '#14b8a6', '#fbbf24', '#a855f7', '#059669'
];

const predefinedIcons = [
  '☀️', '❄️', '🌍', '⚽', '🎨', '💻', '🏔️', '📚', '🎭', '🎵', '🔬', '🏆', '🌟', '🎪', '🎯', '🎲'
];

export const CampTypeForm: React.FC<CampTypeFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateCampTypeData>({
    name: '',
    description: '',
    color: '#f59e0b',
    icon: '☀️',
  });

  const [isActive, setIsActive] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        color: initialData.color,
        icon: initialData.icon || '☀️',
      });
      setIsActive(initialData.isActive);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim()) {
      toast.error('Название типа кэмпа обязательно');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Описание типа кэмпа обязательно');
      return;
    }
    
    if (!formData.color) {
      toast.error('Выберите цвет для типа кэмпа');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка сохранения типа кэмпа:', error);
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
    setShowColorPicker(false);
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
    setShowIconPicker(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          {isEditing ? 'Редактировать тип кэмпа' : 'Создать новый тип кэмпа'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Измените информацию о типе кэмпа'
            : 'Создайте новый тип кэмпа для категоризации'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Название типа кэмпа *
            </Label>
            <Input
              id="name"
              placeholder="Например: Летний, Зимний, Языковой"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
              className="cursor-text"
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Описание *
            </Label>
            <Textarea
              id="description"
              placeholder="Краткое описание типа кэмпа и его особенностей"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isLoading}
              rows={3}
              className="cursor-text"
            />
          </div>

          {/* Цвет и иконка */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Цвет */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Цвет
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  disabled={isLoading}
                  className="w-full justify-start cursor-pointer"
                >
                  <div 
                    className="w-4 h-4 rounded mr-2 border"
                    style={{ backgroundColor: formData.color }}
                  />
                  {formData.color}
                </Button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-background border rounded-lg shadow-lg z-10 w-64">
                    <div className="grid grid-cols-8 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorSelect(color)}
                          className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform cursor-pointer"
                          style={{ 
                            backgroundColor: color,
                            borderColor: formData.color === color ? '#000' : 'transparent'
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="mt-3">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-10 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Иконка */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Иконка
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  disabled={isLoading}
                  className="w-full justify-start cursor-pointer"
                >
                  <span className="text-lg mr-2">{formData.icon}</span>
                  Выбрать иконку
                </Button>
                
                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-background border rounded-lg shadow-lg z-10 w-64">
                    <div className="grid grid-cols-8 gap-2">
                      {predefinedIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleIconSelect(icon)}
                          className={cn(
                            "w-8 h-8 rounded border-2 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-lg",
                            formData.icon === icon ? "border-primary" : "border-transparent"
                          )}
                          title={icon}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Активность (только для редактирования) */}
          {isEditing && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="isActive">Активный тип кэмпа</Label>
                <p className="text-sm text-muted-foreground">
                  Неактивные типы не будут отображаться при создании кэмпов
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Предварительный просмотр */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <Label className="text-sm font-medium mb-2 block">Предварительный просмотр</Label>
            <div className="flex items-center gap-2">
              <Badge 
                className="cursor-default"
                style={{ 
                  backgroundColor: formData.color,
                  color: '#fff',
                  border: 'none'
                }}
              >
                <span className="mr-1">{formData.icon}</span>
                {formData.name || 'Название типа'}
              </Badge>
              {!isActive && (
                <Badge variant="secondary" className="cursor-default text-white">
                  Неактивен
                </Badge>
              )}
            </div>
            {formData.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {formData.description}
              </p>
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
                  {isEditing ? 'Сохранить изменения' : 'Создать тип кэмпа'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 