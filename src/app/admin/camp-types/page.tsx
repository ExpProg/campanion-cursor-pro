'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import { getAllCampTypes, deleteCampType } from '@/lib/campTypeService';
import { CampType } from '@/types/campType';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Loader2 } from 'lucide-react';

export default function CampTypesPage() {
  const router = useRouter();
  const [campTypes, setCampTypes] = useState<CampType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCampTypes();
  }, []);

  const loadCampTypes = async () => {
    try {
      setLoading(true);
      const data = await getAllCampTypes();
      setCampTypes(data);
    } catch (error) {
      console.error('Ошибка загрузки типов кэмпов:', error);
      toast.error('Не удалось загрузить типы кэмпов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push('/admin/camp-types/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/camp-types/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот тип кэмпа?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCampType(id);
      toast.success('Тип кэмпа успешно удален');
      loadCampTypes(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка удаления типа кэмпа:', error);
      toast.error('Не удалось удалить тип кэмпа');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCampTypes = campTypes.filter(campType =>
    campType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campType.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminOnly fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
          <p className="text-muted-foreground mt-2">
            Только администраторы могут просматривать типы кэмпов.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Загрузка типов кэмпов...</span>
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
        <p className="text-muted-foreground mt-2">
          Только администраторы могут просматривать типы кэмпов.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Типы кэмпов</h1>
            <p className="text-muted-foreground mt-2">
              Управление типами кэмпов
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить тип кэмпа
          </Button>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по названию или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Список типов кэмпов */}
        <div className="grid gap-4">
          {filteredCampTypes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'Типы кэмпов не найдены' : 'Типы кэмпов не найдены'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Создайте первый тип кэмпа для начала работы'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить тип кэмпа
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredCampTypes.map((campType) => (
              <Card key={campType.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Иконка и цвет */}
                      <div className="flex-shrink-0">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                          style={{ backgroundColor: campType.color }}
                        >
                          {campType.icon}
                        </div>
                      </div>
                      
                      {/* Информация */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{campType.name}</h3>
                          <Badge variant={campType.isActive ? 'default' : 'secondary'}>
                            {campType.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-2">
                          {campType.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>🎨 Цвет: {campType.color}</span>
                          <span>📅 Создан: {campType.createdAt.toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Действия */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(campType.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(campType.id)}
                        disabled={deletingId === campType.id}
                      >
                        {deletingId === campType.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminOnly>
  );
}
