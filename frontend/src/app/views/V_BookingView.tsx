import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Homestay, homestayService } from '../../services/homestayService';
import { bookingService } from '../../services/bookingService';


function normalizeTime(timeStr?: string, defaultTime = '14:00:00') {
  if (!timeStr) return defaultTime;
  // If it's just "14:00", append ":00"
  if (timeStr.length === 5) return `${timeStr}:00`;
  return timeStr;
}

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
  const [bookedRanges, setBookedRanges] = useState<any[]>([]);
  const [hourlyDate, setHourlyDate] = useState('');
  const [hourlyTime, setHourlyTime] = useState('14:00');
  const [hourlyDuration, setHourlyDuration] = useState('1');

  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour}:${min}`;
  });

  useEffect(() => {
    if (homestay?.rental_type === 'hourly' && hourlyDate) {
      const start = new Date(`${hourlyDate}T${hourlyTime}:00`);
      if (!isNaN(start.getTime())) {
        // Set Check-in
        setCheckIn(`${hourlyDate}T${hourlyTime}:00`);
        
        // Calculate Check-out (add duration in hours)
        const end = new Date(start.getTime() + Number(hourlyDuration) * 60 * 60 * 1000);
        
        // Format local time safely back to YYYY-MM-DDTHH:mm:00
        const pad = (n: number) => n.toString().padStart(2, '0');
        const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:00`;
        setCheckOut(endStr);
      }
    }
  }, [hourlyDate, hourlyTime, hourlyDuration, homestay?.rental_type]);

  useEffect(() => {
    if (!id) return;
  
    setIsLoading(true);
    setError('');
    
    Promise.all([
      homestayService.get(id),
      bookingService.getUnavailableDates(id)
    ])
      .then(([fetchedHomestay, ranges]) => {
        setHomestay(fetchedHomestay);
        setBookedRanges(ranges);
      })
      .catch((err: Error) => {
        setHomestay(null);
        setError(err.message || 'Homestay not found.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const calculateDuration = () => {
    if (!checkIn || !checkOut || !homestay) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();

    if (homestay.rental_type === 'daily') {
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } else {
      return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    }
  };

  const hasOverlap = () => {
    if (!checkIn || !checkOut || bookedRanges.length === 0) return false;
    
    const reqStart = new Date(checkIn).getTime();
    const reqEnd = new Date(checkOut).getTime();
  
    return bookedRanges.some(range => {
      const bookedStart = new Date(range.check_in_date).getTime();
      const bookedEnd = new Date(range.check_out_date).getTime();
  
      if (homestay?.rental_type === 'daily') {
        // For daily: We only care about the date part (nights). 
        // If a booking ends on the 25th, a new booking CAN start on the 25th.
        const isOverlapping = reqStart < bookedEnd && reqEnd > bookedStart;
        return isOverlapping;
      } else {
        // For hourly: Strict time overlap check
        return reqStart < bookedEnd && reqEnd > bookedStart;
      }
    });
  };
  
  const isOverlapping = hasOverlap();

  const duration = calculateDuration();
  const totalPrice = homestay ? duration * homestay.pricePerHour : 0;

  const unit = homestay?.rental_type === 'daily' ? 'night' : 'hour';

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
        checkInDate: homestay?.rental_type === 'daily' ? checkIn.split('T')[0] : checkIn,
        checkOutDate: homestay?.rental_type === 'daily' ? checkOut.split('T')[0] : checkOut,
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
                      {formatPrice(homestay.pricePerHour)}/{unit}
                    </p>
                  </div>
                </div>
              </div>

              {homestay.rental_type === 'hourly' ? (
                // --- HOURLY UI: Pick Date, Time, and Duration ---
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hourlyDate">Date</Label>
                    <Input
                      id="hourlyDate"
                      type="date"
                      value={hourlyDate}
                      onChange={(e) => setHourlyDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Select value={hourlyTime} onValueChange={setHourlyTime}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* <div>
                      <Label>Duration</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <Select value={hourlyDuration} onValueChange={setHourlyDuration}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground w-10">
                          {hourlyDuration === '1' ? 'hour' : 'hours'}
                        </span>
                      </div>
                    </div> */}

                    <div>
                      <Label>Duration</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <Input
                          type="number"
                          min={1}
                          max={24}
                          placeholder="Enter hours"
                          value={hourlyDuration}
                          className="flex-1"
                          onChange={(e) => {
                            const val = e.target.value;
                            
                            if (val === "") {
                              setHourlyDuration("");
                              return;
                            }

                            const parsed = parseInt(val, 10);
                            
                            if (!isNaN(parsed)) {
                              if (parsed > 24) {
                                setHourlyDuration("24");
                              } else if (parsed < 1) {
                                setHourlyDuration("1");
                              } else {
                                setHourlyDuration(parsed.toString());
                              }
                            }
                          }}
                        />
                        
                        <span className="text-sm text-muted-foreground w-10">
                          {hourlyDuration === '1' ? 'hour' : 'hours'}
                        </span>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ) : (
                // --- DAILY UI: Pick Date Only ---
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="checkIn">Check-in Date</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={checkIn ? checkIn.split('T')[0] : ''}
                      onChange={(e) => {
                        const dateVal = e.target.value;
                        if (!dateVal) return setCheckIn('');
                        const time = normalizeTime(homestay.check_in_time, '14:00:00');
                        setCheckIn(`${dateVal}T${time}`);
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Check-in time is fixed at {homestay.check_in_time?.slice(0, 5) || '14:00'}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="checkOut">Check-out Date</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={checkOut ? checkOut.split('T')[0] : ''}
                      onChange={(e) => {
                        const dateVal = e.target.value;
                        if (!dateVal) return setCheckOut('');
                        const time = normalizeTime(homestay.check_out_time, '10:00:00');
                        setCheckOut(`${dateVal}T${time}`);
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Check-out time is fixed at {homestay.check_out_time?.slice(0, 5) || '10:00'}
                    </p>
                  </div>
                </div>
              )}

              {checkIn && checkOut && duration > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4>Price Breakdown</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                    {formatPrice(homestay.pricePerHour)}/{unit} x {duration} {unit}{duration > 1 ? 's' : ''}
                    </span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              )}

              {isOverlapping && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  These dates/times overlap with an existing booking. Please select different dates.
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut || duration <= 0 || isSubmitting || isOverlapping}
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
