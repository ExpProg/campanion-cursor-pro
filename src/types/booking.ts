export type BookingRequest = {
  id: string;
  campId: string;
  campTitle: string;
  name: string;
  contact: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
};

