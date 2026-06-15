import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BookingRow, bookingService } from '../../services/bookingService';

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-[#D97706] text-white';
    case 'approved':
      return 'bg-[#2563EB] text-white';
    case 'confirmed':
    case 'completed':
      return 'bg-[#16A34A] text-white';
    case 'rejected':
      return 'bg-[#DC2626] text-white';
    case 'cancelled':
      return 'bg-[#64748B] text-white';
    default:
      return 'bg-[#64748B] text-white';
  }
}

export function V_OwnerBookingsView() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pendingCount = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending').length,
    [bookings]
  );

  useEffect(() => {
    if (!user?.userID) return;

    setIsLoading(true);
    setError('');
    bookingService
      .listForOwner(user.userID)
      .then(setBookings)
      .catch((err: Error) => {
        setError(err.message || 'Failed to load owner bookings.');
        setBookings([]);
      })
      .finally(() => setIsLoading(false));
  }, [user?.userID]);

  const updateBooking = (updated: BookingRow) => {
    setBookings((items) =>
      items.map((booking) => (booking.id === updated.id ? { ...booking, ...updated } : booking))
    );
  };

  const handleApprove = async (bookingId: string) => {
    if (!user?.userID) return;

    setMutatingId(bookingId);
    try {
      const result = await bookingService.approve(bookingId, user.userID);
      updateBooking(result.booking);
      toast.success(result.message || 'Booking approved.');
    } catch (err: any) {
      toast.error(err.message || 'Could not approve booking.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!user?.userID) return;
    if (!window.confirm('Reject this booking request?')) return;

    setMutatingId(bookingId);
    try {
      const result = await bookingService.reject(bookingId, user.userID);
      updateBooking(result.booking);
      toast.success(result.message || 'Booking rejected.');
    } catch (err: any) {
      toast.error(err.message || 'Could not reject booking.');
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <div className="mb-6">
          <h1>Manage Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review booking requests for your homestays. Approved bookings can be paid by the guest via bank transfer.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Requests ({pendingCount} pending)</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md border border-destructive p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No bookings for your homestays yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">
                          {booking.guest
                            ? `${booking.guest.firstName} ${booking.guest.lastName}`
                            : `Guest ${booking.userId}`}
                        </div>
                        {booking.guest?.email && (
                          <div className="text-xs text-muted-foreground">{booking.guest.email}</div>
                        )}
                      </TableCell>
                      <TableCell>{booking.homestay?.title || `Homestay ${booking.homestayId}`}</TableCell>
                      <TableCell>{format(new Date(booking.checkIn), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{format(new Date(booking.checkOut), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell className="font-semibold text-primary">{formatPrice(booking.totalPrice)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(booking.id)}
                              disabled={mutatingId === booking.id}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleReject(booking.id)}
                              disabled={mutatingId === booking.id}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No action</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
