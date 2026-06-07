import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockHomestays } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { format } from 'date-fns';

export function V_BookingView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const homestay = mockHomestays.find(h => h.id === id);

  if (!homestay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2>Homestay not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const calculateHours = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
  };

  const hours = calculateHours();
  const totalPrice = hours * homestay.pricePerHour;

  const handleBooking = () => {
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <div className="max-w-[600px] mx-auto">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Book Homestay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Homestay Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex gap-4">
                  <img
                    src={homestay.images[0]}
                    alt={homestay.title}
                    className="w-24 h-24 rounded-md object-cover"
                  />
                  <div>
                    <h3 className="mb-1">{homestay.title}</h3>
                    <p className="text-sm text-muted-foreground">{homestay.address}</p>
                    <p className="text-sm text-muted-foreground">{homestay.city}</p>
                    <p className="text-sm font-semibold text-primary mt-2">
                      ${homestay.pricePerHour}/hour
                    </p>
                  </div>
                </div>
              </div>

              {/* Date/Time Pickers */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="checkIn">Check-in Date & Time</Label>
                  <Input
                    id="checkIn"
                    type="datetime-local"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="checkOut">Check-out Date & Time</Label>
                  <Input
                    id="checkOut"
                    type="datetime-local"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              {checkIn && checkOut && hours > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4>Price Breakdown</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">${homestay.pricePerHour}/hour × {hours} hours</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${totalPrice}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut || hours <= 0}
                  className="flex-1"
                >
                  Confirm Booking
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Successful!</DialogTitle>
            <DialogDescription>
              Your booking request has been submitted. The owner will review and respond to your request soon.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
