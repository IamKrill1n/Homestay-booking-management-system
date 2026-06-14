import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Homestay, homestayService } from '../../services/homestayService';
import { bookingService } from '../../services/bookingService';

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function V_BookingView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError('');
    homestayService
      .get(id)
      .then(setHomestay)
      .catch((err: Error) => {
        setHomestay(null);
        setError(err.message || 'Homestay not found.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const calculateHours = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
  };

  const hours = calculateHours();
  const totalPrice = homestay ? hours * homestay.pricePerHour : 0;

  const handleBooking = async () => {
    if (!user?.userID || !id) {
      alert('You must be signed in to book a homestay.');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingService.create({
        homestayID: Number(id),
        guestID: Number(user.userID),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
      });
      setShowSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Could not create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading homestay...</p>
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2>{error || 'Homestay not found'}</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <div className="max-w-[600px] mx-auto">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Book Homestay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      {formatPrice(homestay.pricePerHour)}/hour
                    </p>
                  </div>
                </div>
              </div>

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

              {checkIn && checkOut && hours > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4>Price Breakdown</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatPrice(homestay.pricePerHour)}/hour x {hours} hours
                    </span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut || hours <= 0 || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
