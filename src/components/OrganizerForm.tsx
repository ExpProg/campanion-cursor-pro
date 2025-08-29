'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Organizer, CreateOrganizerData, UpdateOrganizerData } from '@/types/organizer';
import { Palette } from 'lucide-react';
import { getLogoPlaceholderColor } from '@/lib/utils';

interface OrganizerFormProps {
  onSubmit: (data: CreateOrganizerData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Organizer | null;
  isEditing?: boolean;
}

export const OrganizerForm: React.FC<OrganizerFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateOrganizerData>({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logo: '',
    color: '#f59e0b', // Будет переопределено в useEffect если есть initialData
    isActive: true,
  });

  const [showColorPicker, setShowColorPicker] = useState(false);

  const predefinedColors = [
    '#f59e0b', '#0ea5e9', '#8b5cf6', '#10b981', '#f43f5e', '#6366f1', '#f97316', '#4f46e5',
    '#ef4444', '#06b6d4', '#84cc16', '#ec4899', '#14b8a6', '#fbbf24', '#a855f7', '#059669'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        contactEmail: initialData.contactEmail || '',
        contactPhone: initialData.contactPhone || '',
        website: initialData.website || '',
        logo: initialData.logo || '',
        color: initialData.color || getLogoPlaceholderColor(initialData.name),
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim()) {
      toast.error('Название организатора обязательно');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка сохранения организатора:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Редактировать организатора' : 'Создать нового организатора'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Измените информацию об организаторе'
            : 'Заполните информацию для создания нового организатора'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div>
            <Label htmlFor="name" className="mb-2 block">Название организатора *</Label>
            <Input
              id="name"
              placeholder="Введите название организации или ФИО"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
              className="cursor-text"
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">Описание</Label>
            <Textarea
              id="description"
              placeholder="Краткое описание организатора"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isLoading}
              rows={3}
              className="cursor-text"
            />
          </div>

          {/* Контактная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contactEmail" className="mb-2 block">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                disabled={isLoading}
                className="cursor-text"
              />
            </div>

            <div>
              <Label htmlFor="contactPhone" className="mb-2 block">Телефон</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                disabled={isLoading}
                className="cursor-text"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website" className="mb-2 block">Веб-сайт</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              disabled={isLoading}
              className="cursor-text"
            />
          </div>

          <div>
            <Label htmlFor="logo" className="mb-2 block">URL логотипа</Label>
            <Input
              id="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              disabled={isLoading}
              className="cursor-text"
            />
          </div>

          {/* Выбор цвета */}
          <div>
            <Label className="mb-2 block">Цвет аватарки</Label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: formData.color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <div className="flex-1">
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#f59e0b"
                  disabled={isLoading}
                  className="cursor-text"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Выбрать
              </Button>
            </div>
            
            {/* Палитра цветов */}
            {showColorPicker && (
              <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-8 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, color }));
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Статус */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">Активный организатор</Label>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать организатора')}
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