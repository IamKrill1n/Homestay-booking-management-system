import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Users, CheckCircle2, ExternalLink, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Homestay, homestayService } from '../../services/homestayService';
import { Feedback, feedbackService } from '../../services/feedbackService';

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function mapQuery(homestay: Homestay) {
  if (homestay.latitude != null && homestay.longitude != null) {
    return `${homestay.latitude},${homestay.longitude}`;
  }
  return `${homestay.address} ${homestay.city}`;
}

export function V_HomestayDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError('');
    setSelectedImage(0);

    Promise.all([
      homestayService.get(id),
      feedbackService.listForHomestay(id).catch(() => []),
    ])
      .then(([homestayData, feedbackData]) => {
        setHomestay(homestayData);
        setFeedback(feedbackData);
      })
      .catch((err: Error) => {
        setHomestay(null);
        setError(err.message || 'Homestay not found');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const averageRating = useMemo(() => {
    if (feedback.length === 0) return null;
    const total = feedback.reduce((sum, item) => sum + item.rating, 0);
    return total / feedback.length;
  }, [feedback]);

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
          <h2 className="mb-4">{error || 'Homestay not found'}</h2>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a homestay');
      navigate('/login');
      return;
    }
    
    if (homestay.availability !== 'available') {
      toast.error('This homestay is currently unavailable');
      return;
    }
    
    navigate(`/book/${homestay.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <div className="mb-8">
          <div className="aspect-[21/9] overflow-hidden rounded-lg mb-4">
            <img 
              src={homestay.images[selectedImage]} 
              alt={homestay.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4">
            {homestay.images.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImage(index)}
                className={`aspect-video w-24 overflow-hidden rounded-md border-2 transition-all ${
                  selectedImage === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={image} alt={`${homestay.title} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <div>
              <h1 className="mb-2">{homestay.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{homestay.address}, {homestay.city}</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={homestay.availability === 'available' ? 'default' : 'secondary'}>
                  {homestay.availability}
                </Badge>
                <Badge variant={homestay.status === 'approved' ? 'default' : 'secondary'}>
                  {homestay.status}
                </Badge>
                {averageRating != null && (
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {averageRating.toFixed(1)} ({feedback.length})
                  </span>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Amenities</h3>
                {homestay.amenities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No amenities listed.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {homestay.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{homestay.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3>Location</h3>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(homestay))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <span className="text-sm">View on Google Maps</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="mt-4 aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Guest Feedback</h3>
                {feedback.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No feedback yet.</p>
                ) : (
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div key={String(item.feedbackID)} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{item.guestName || `Guest ${item.guestID}`}</p>
                          <span className="flex items-center gap-1 text-sm text-primary">
                            <Star className="h-4 w-4 fill-primary" />
                            {item.rating}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.feedbackMessage}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-[88px]">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-3xl font-semibold text-primary mb-1">
                    {formatPrice(homestay.pricePerHour)}
                    <span className="text-base font-normal text-muted-foreground">
                    /{homestay.rental_type === 'daily' ? 'night' : 'hour'}</span>
                  </div>
                </div>

                <div className="space-y-2 py-4 border-y border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <Badge variant={homestay.availability === 'available' ? 'default' : 'secondary'}>
                      {homestay.availability}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Guests</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{homestay.maxGuests}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!isAuthenticated || homestay.availability !== 'available'}
                >
                  {!isAuthenticated ? 'Login to Book' : 'Book Homestay'}
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please login to book this homestay
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
