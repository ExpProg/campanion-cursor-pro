'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import { getOrganizers, deleteOrganizer } from '@/lib/organizerService';
import { Organizer } from '@/types/organizer';
import { toast } from 'sonner';
import { AdminOnly } from '@/components/RoleProtected';
import { Loader2 } from 'lucide-react';
import { getLogoPlaceholderColor, getInitials } from '@/lib/utils';

export default function OrganizersPage() {
  const router = useRouter();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizers();
  }, []);

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      const data = await getOrganizers();
      setOrganizers(data);
    } catch (error) {
      console.error('Ошибка загрузки организаторов:', error);
      toast.error('Не удалось загрузить организаторов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push('/admin/organizers/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/organizers/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого организатора?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteOrganizer(id);
      toast.success('Организатор успешно удален');
      loadOrganizers(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка удаления организатора:', error);
      toast.error('Не удалось удалить организатора');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminOnly fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">Доступ запрещен</h1>
          <p className="text-muted-foreground mt-2">
            Только администраторы могут просматривать организаторов.
          </p>
        </div>
      }>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Загрузка организаторов...</span>
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
          Только администраторы могут просматривать организаторов.
        </p>
      </div>
    }>
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Организаторы</h1>
            <p className="text-muted-foreground mt-2">
              Управление организаторами кэмпов
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить организатора
          </Button>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по названию, описанию или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Список организаторов */}
        <div className="grid gap-4">
          {filteredOrganizers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'Организаторы не найдены' : 'Организаторы не найдены'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Создайте первого организатора для начала работы'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить организатора
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredOrganizers.map((organizer) => (
              <Card key={organizer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Аватар */}
                      <div className="flex-shrink-0">
                        {organizer.logo ? (
                          <img
                            src={organizer.logo}
                            alt={organizer.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                            style={{ backgroundColor: organizer.color || getLogoPlaceholderColor(organizer.name) }}
                          >
                            {getInitials(organizer.name)}
                          </div>
                        )}
                      </div>
                      
                      {/* Информация */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{organizer.name}</h3>
                          <Badge variant={organizer.isActive ? 'default' : 'secondary'}>
                            {organizer.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                        
                        {organizer.description && (
                          <p className="text-muted-foreground mb-2 line-clamp-2">
                            {organizer.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {organizer.contactEmail && (
                            <span>📧 {organizer.contactEmail}</span>
                          )}
                          {organizer.contactPhone && (
                            <span>📞 {organizer.contactPhone}</span>
                          )}
                          {organizer.website && (
                            <span>🌐 {organizer.website}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Действия */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(organizer.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(organizer.id)}
                        disabled={deletingId === organizer.id}
                      >
                        {deletingId === organizer.id ? (
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
