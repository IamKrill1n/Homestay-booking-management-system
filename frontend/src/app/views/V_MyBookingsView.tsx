import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { BookingRow, bookingService } from '../../services/bookingService';
import { feedbackService } from '../../services/feedbackService';

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function canLeaveFeedback(booking: BookingRow) {
  const status = booking.status.toLowerCase();
  const checkoutHasPassed = new Date(booking.checkOut) <= new Date();
  return !booking.hasFeedback && status !== 'cancelled' && (status === 'completed' || checkoutHasPassed);
}

export function V_MyBookingsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [rating, setRating] = useState('5');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!user?.userID) return;

    setIsLoading(true);
    bookingService
      .listForUser(user.userID)
      .then(setMyBookings)
      .catch((error) => {
        console.error('Error fetching bookings:', error);
        setMyBookings([]);
      })
      .finally(() => setIsLoading(false));
  }, [user?.userID]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const result = await bookingService.cancel(bookingId);
      setMyBookings((bookings) =>
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: result.booking.status } : booking
        )
      );
      toast.success(result.message || 'Booking cancelled.');
    } catch (error: any) {
      toast.error(error.message || 'Could not cancel booking.');
    }
  };

  const openFeedbackDialog = (booking: BookingRow) => {
    setSelectedBooking(booking);
    setRating('5');
    setFeedbackMessage('');
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedBooking || !user?.userID) return;

    setIsSubmittingFeedback(true);
    try {
      const result = await feedbackService.submit({
        bookingID: selectedBooking.id,
        guestID: user.userID,
        rating: Number(rating),
        feedbackMessage,
      });
      setMyBookings((bookings) =>
        bookings.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, hasFeedback: true } : booking
        )
      );
      toast.success(result.message || 'Feedback submitted.');
      setSelectedBooking(null);
      setFeedbackMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Could not submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#D97706] text-white';
      case 'approved':
      case 'completed':
        return 'bg-[#16A34A] text-white';
      case 'confirmed':
        return 'bg-[#2563EB] text-white';
      case 'rejected':
        return 'bg-[#DC2626] text-white';
      case 'cancelled':
        return 'bg-[#64748B] text-white';
      default:
        return 'bg-[#64748B] text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <h1 className="mb-6">My Bookings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Your Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {myBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {isLoading ? 'Loading bookings...' : "You haven't made any bookings yet."}
                </p>
                <Button onClick={() => navigate('/')}>
                  Browse Homestays
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.homestay?.title || `Homestay ${booking.homestayId}`}
                      </TableCell>
                      <TableCell>{format(new Date(booking.checkIn), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{format(new Date(booking.checkOut), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell className="font-semibold text-primary">{formatPrice(booking.totalPrice)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleCancel(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          {canLeaveFeedback(booking) && (
                            <Button variant="outline" size="sm" onClick={() => openFeedbackDialog(booking)}>
                              Leave Feedback
                            </Button>
                          )}
                          {booking.hasFeedback && (
                            <Badge variant="secondary">Feedback sent</Badge>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/homestay/${booking.homestayId}`)}>
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Feedback</DialogTitle>
            <DialogDescription>
              Share feedback for {selectedBooking?.homestay?.title || 'this homestay'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="feedbackMessage">Feedback</Label>
              <Textarea
                id="feedbackMessage"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)} disabled={isSubmittingFeedback}>
              Cancel
            </Button>
            <Button
              onClick={handleFeedbackSubmit}
              disabled={
                isSubmittingFeedback ||
                !feedbackMessage.trim() ||
                Number(rating) < 1 ||
                Number(rating) > 5
              }
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
