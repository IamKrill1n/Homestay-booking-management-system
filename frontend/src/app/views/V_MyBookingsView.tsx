import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockHomestays } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';

interface BookingRow {
  id: string;
  homestayId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export function V_MyBookingsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.userID) return;

    setIsLoading(true);
    fetch(`${API_BASE_URL}/bookings/user/${user.userID}`)
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch bookings.');
        }
        return response.json();
      })
      .then((data) => {
        const formattedBookings = data.map((booking: any) => ({
          id: String(booking.bookingID),
          homestayId: String(booking.homestayID),
          userId: String(booking.guestID),
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          totalPrice: Number(booking.totalPrice ?? 0),
          status: String(booking.status).toLowerCase(),
          createdAt: booking.createdAt || new Date().toISOString(),
        }));
        setMyBookings(formattedBookings);
      })
      .catch((error) => {
        console.error('Error fetching bookings:', error);
        setMyBookings([]);
      })
      .finally(() => setIsLoading(false));
  }, [user?.userID]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking.');
      }

      setMyBookings((bookings) =>
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
    } catch (error: any) {
      alert(error.message || 'Could not cancel booking.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#D97706] text-white';
      case 'approved':
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
                  {myBookings.map(booking => {
                    const homestay = mockHomestays.find(h => h.id === booking.homestayId);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {homestay?.title || 'Unknown'}
                        </TableCell>
                        <TableCell>{format(new Date(booking.checkIn), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>{format(new Date(booking.checkOut), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell className="font-semibold text-primary">${booking.totalPrice}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
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
                          {(booking.status === 'approved' || booking.status === 'confirmed') && (
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
