import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockHomestays } from '../data/mockData';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';

const cities = ['All', ...Array.from(new Set(mockHomestays.map(h => h.city)))];
const amenitiesList = ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Parking', 'Bath Tub', 'Pets'];

export function V_DashboardView() {
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [maxGuests, setMaxGuests] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const filteredHomestays = mockHomestays.filter(homestay => {
    if (homestay.status !== 'approved') return false;
    if (homestay.pricePerHour < priceRange[0] || homestay.pricePerHour > priceRange[1]) return false;
    if (selectedCity !== 'All' && homestay.city !== selectedCity) return false;
    if (maxGuests !== 'All' && homestay.maxGuests < parseInt(maxGuests)) return false;
    if (selectedAmenities.length > 0 && !selectedAmenities.every(a => homestay.amenities.includes(a))) return false;
    return true;
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <h1 className="mb-6">Browse Homestays</h1>
        
        <div className="flex gap-6">
          {/* Filter Panel */}
          <div className="w-[280px] flex-shrink-0">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="mb-4 block">Price Range ($/hour)</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Guests</Label>
                  <Select value={maxGuests} onValueChange={setMaxGuests}>
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
                    {amenitiesList.map(amenity => (
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

                <Button 
                  className="w-full" 
                  onClick={() => {
                    setPriceRange([0, 100]);
                    setSelectedCity('All');
                    setMaxGuests('All');
                    setSelectedAmenities([]);
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Homestay Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-6">
              {filteredHomestays.map(homestay => (
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
                      <p className="font-semibold text-primary">${homestay.pricePerHour}/hour</p>
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
            
            {filteredHomestays.length === 0 && (
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
