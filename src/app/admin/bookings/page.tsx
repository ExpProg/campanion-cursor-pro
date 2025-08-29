'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBookingRequests, updateBookingRequestStatus } from '@/lib/bookingService';
import { BookingRequest } from '@/types/booking';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookingRequests();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Не удалось загрузить запросы на бронирование');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingRequest['status']) => {
    try {
      setUpdatingStatus(bookingId);
      await updateBookingRequestStatus(bookingId, newStatus);
      
      // Обновляем локальное состояние
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus, updatedAt: new Date() }
          : booking
      ));
      
      toast.success(`Статус запроса обновлен на "${getStatusLabel(newStatus)}"`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Не удалось обновить статус запроса');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusLabel = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Ожидает рассмотрения';
      case 'approved':
        return 'Одобрен';
      case 'rejected':
        return 'Отклонен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Загрузка запросов на бронирование...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Запросы на бронирование</h1>
        <Button onClick={loadBookings} variant="outline">
          Обновить
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground text-lg">
              Запросы на бронирование отсутствуют
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{booking.campTitle}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>От: {booking.name}</span>
                      <span>Контакт: {booking.contact}</span>
                      <span>
                        {format(booking.createdAt, 'dd MMM yyyy, HH:mm', { locale: ru })}
                      </span>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                    {getStatusIcon(booking.status)}
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              {booking.message && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Сообщение:</strong> {booking.message}
                  </p>
                </CardContent>
              )}
              
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                        disabled={updatingStatus === booking.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatingStatus === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Одобрить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        disabled={updatingStatus === booking.id}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        {updatingStatus === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Отклонить
                      </Button>
                    </>
                  )}
                  
                  {booking.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(booking.id, 'pending')}
                      disabled={updatingStatus === booking.id}
                    >
                      {updatingStatus === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      Вернуть на рассмотрение
                    </Button>
                  )}
                  
                  {booking.status === 'rejected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(booking.id, 'pending')}
                      disabled={updatingStatus === booking.id}
                    >
                      {updatingStatus === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      Вернуть на рассмотрение
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

