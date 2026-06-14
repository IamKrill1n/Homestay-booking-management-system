import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockHomestays } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';

export function V_MyBookingsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [myBookings, setMyBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user?.userID) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/user/${user.userID}`)
        .then(response => response.json())
        .then(data => {
          // Map PostgreSQL snake_case to the frontend's camelCase
          const formattedData = data.map((b: any) => ({
            id: b.booking_id,
            homestayId: b.homestay_id,
            userId: b.guest_id,
            checkIn: b.check_in_date,
            checkOut: b.check_out_date,
            totalPrice: b.total_price || 180, // Fallback since DB schema doesn't have total_price yet
            status: b.status.toLowerCase(), // Ensures 'Pending', 'Approved', 'booked' all match
            createdAt: b.created_at || new Date().toISOString() // Fallback for date formatting
          }));
          setMyBookings(formattedData);
        })
        .catch(error => console.error("Error fetching bookings:", error));
    }
  }, [user]);

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });

      if (response.ok) {
        setMyBookings(prevBookings => 
          prevBookings.map(b => 
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
      } else {
        alert('Failed to cancel the booking. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      alert('Could not connect to the server.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#D97706] text-white';
      case 'approved':
        return 'bg-[#16A34A] text-white';
      case 'confirmed':
        return 'bg-[#2563EB] text-white';
      case 'rejected':
      case 'cancelled':
        return 'bg-[#DC2626] text-white';
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
                <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
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
                          {homestay?.title || `Homestay #${booking.homestayId}`}
                        </TableCell>
                        <TableCell>{format(new Date(booking.checkIn), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>{format(new Date(booking.checkOut), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell className="font-semibold text-primary">${booking.totalPrice}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {/* Capitalize the first letter for the UI */}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          {booking.status === 'pending' && (
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleCancel(booking.id)}>
                              Cancel
                            </Button>
                          )}
                          
                          {booking.status === 'approved' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate('/checkout', { 
                                state: { 
                                  bookingID: booking.id, 
                                  amount: booking.totalPrice 
                                } 
                              })}
                            >
                              View Details
                            </Button>
                          )}

                          {booking.status === 'confirmed' && (
                            <span className="text-sm text-green-600 font-medium px-3 py-1 border rounded-md">
                              Paid
                            </span>
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