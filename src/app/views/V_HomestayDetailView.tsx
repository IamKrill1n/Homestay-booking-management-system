import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockHomestays } from '../data/mockData';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Users, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function V_HomestayDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);

  const homestay = mockHomestays.find(h => h.id === id);

  if (!homestay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Homestay not found</h2>
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
        {/* Image Gallery */}
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
                key={index}
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
          {/* Left Column - Details */}
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
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {homestay.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
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
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homestay.address + ' ' + homestay.city)}`}
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
          </div>

          {/* Right Column - Sticky Card */}
          <div>
            <Card className="sticky top-[88px]">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-3xl font-semibold text-primary mb-1">
                    ${homestay.pricePerHour}
                    <span className="text-base font-normal text-muted-foreground">/hour</span>
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
