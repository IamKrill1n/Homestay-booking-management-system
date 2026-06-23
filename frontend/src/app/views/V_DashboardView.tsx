import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Homestay, homestayService } from '../../services/homestayService';

const amenitiesList = ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Parking', 'Bath Tub', 'Pets'];
const defaultPriceRange = [0, 500000];

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseNumberParam(value: string | null | undefined, fallback: number): number {
  if (value === null || value === undefined || value.trim() === '') {
    return fallback;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseAmenities(value: string | null) {
  return value ? value.split(',').filter(Boolean) : [];
}

export function V_DashboardView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [rentalType, setRentalType] = useState('All');
  const [cityOptions, setCityOptions] = useState<string[]>(['All']);
  const [priceRange, setPriceRange] = useState(defaultPriceRange);
  const [selectedCity, setSelectedCity] = useState('All');
  const [maxGuests, setMaxGuests] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    homestayService
      .list()
      .then((allHomestays) => {
        const cities = Array.from(new Set(allHomestays.map((homestay) => homestay.city).filter(Boolean)));
        setCityOptions(['All', ...cities]);
      })
      .catch(() => setCityOptions(['All']));
  }, []);

  useEffect(() => {
    const currentMin = parseNumberParam(searchParams.get('minPrice'), defaultPriceRange[0]);
    const currentMax = parseNumberParam(searchParams.get('maxPrice'), defaultPriceRange[1]);
    setPriceRange([currentMin, currentMax]);
    setSelectedCity(searchParams.get('city') || 'All');
    setMaxGuests(searchParams.get('maxGuests') || 'All');
    setSelectedAmenities(parseAmenities(searchParams.get('amenities')));
    setRentalType(searchParams.get('rental_type') || 'All');
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    setError('');

    homestayService
      .list({
        q: searchParams.get('q'),
        city: searchParams.get('city'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        maxGuests: searchParams.get('maxGuests'),
        amenities: parseAmenities(searchParams.get('amenities')),
        rental_type: searchParams.get('rental_type') as 'hourly' | 'daily' | null,
      })
      .then(setHomestays)
      .catch((err: Error) => {
        setError(err.message || 'Failed to load homestays.');
        setHomestays([]);
      })
      .finally(() => setIsLoading(false));
  }, [searchParams]);

  const resultLabel = useMemo(() => {
    if (query) return `Search results for "${query}"`;
    return 'Browse Homestays';
  }, [query]);

  const updateParams = (updates: Record<string, string | number | string[] | null>) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      const shouldDelete =
        value == null ||
        value === '' ||
        value === 'All' ||
        (Array.isArray(value) && value.length === 0);

      if (shouldDelete) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        next.set(key, value.join(','));
      } else {
        next.set(key, String(value));
      }
    }

    setSearchParams(next);
  };

  const updateParam = (key: string, value: string | number | string[] | null) => {
    updateParams({ [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((item) => item !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(next);
    updateParam('amenities', next);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <h1 className="mb-6">{resultLabel}</h1>
        
        <div className="flex gap-6">

          {/* Filter */}
          <div className="w-[280px] flex-shrink-0">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="mb-4 block">Price Range (VND)</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    onValueCommit={(value) => {
                      updateParams({ minPrice: value[0], maxPrice: value[1] });
                    }}
                    min={0}
                    max={500000}
                    step={10000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Rental Type</Label>
                  <Select
                    value={rentalType}
                    onValueChange={(value) => {
                      setRentalType(value);
                      updateParam('rental_type', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Stays</SelectItem>
                      <SelectItem value="hourly">Hourly Stays</SelectItem>
                      <SelectItem value="daily">Daily Stays</SelectItem>
                      </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">City</Label>
                  <Select
                    value={selectedCity}
                    onValueChange={(value) => {
                      setSelectedCity(value);
                      updateParam('city', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Guests</Label>
                  <Select
                    value={maxGuests}
                    onValueChange={(value) => {
                      setMaxGuests(value);
                      updateParam('maxGuests', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="6">6+</SelectItem>
                      <SelectItem value="8">8+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Amenities</Label>
                  <div className="space-y-2">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <label
                          htmlFor={amenity}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            {error && (
              <div className="mb-4 rounded-md border border-destructive p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading homestays...</div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {homestays.map((homestay) => (
                  <Card key={homestay.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img 
                        src={homestay.images[0]} 
                        alt={homestay.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-1">{homestay.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{homestay.city}</p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-primary">{formatPrice(homestay.pricePerHour)} / {homestay.rental_type === 'daily' ? 'night' : 'hour'}</p>
                        <Badge variant={homestay.availability === 'available' ? 'default' : 'secondary'}>
                          {homestay.availability}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Link to={`/homestay/${homestay.id}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {!isLoading && homestays.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No homestays found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
