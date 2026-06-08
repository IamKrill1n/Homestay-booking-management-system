import { mockBookings, mockHomestays } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';

export function V_MyBookingsView() {
  const { user } = useAuth();
  
  const myBookings = mockBookings.filter(b => b.userId === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#D97706] text-white';
      case 'approved':
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
                <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
                <Button onClick={() => window.location.href = '/'}>
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
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              Cancel
                            </Button>
                          )}
                          {booking.status === 'approved' && (
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
