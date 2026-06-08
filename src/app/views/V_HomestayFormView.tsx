import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockHomestays } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

const amenitiesList = ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Parking', 'Bath Tub', 'Pet'];

export function V_HomestayFormView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  
  const existingHomestay = isEdit ? mockHomestays.find(h => h.id === id) : null;

  const [formData, setFormData] = useState({
    title: existingHomestay?.title || '',
    address: existingHomestay?.address || '',
    city: existingHomestay?.city || '',
    pricePerHour: existingHomestay?.pricePerHour.toString() || '',
    maxGuests: existingHomestay?.maxGuests.toString() || '',
    description: existingHomestay?.description || '',
    amenities: existingHomestay?.amenities || [],
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/my-homestays');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <div className="max-w-[900px] mx-auto">
          <Button variant="outline" onClick={() => navigate('/my-homestays')} className="mb-6">
            ← Back to My Homestays
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit' : 'Create'} Homestay</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pricePerHour">Price per Hour ($)</Label>
                    <Input
                      id="pricePerHour"
                      type="number"
                      min="1"
                      value={formData.pricePerHour}
                      onChange={(e) => handleChange('pricePerHour', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxGuests">Max Guests</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      min="1"
                      value={formData.maxGuests}
                      onChange={(e) => handleChange('maxGuests', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {amenitiesList.map(amenity => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity}
                            checked={formData.amenities.includes(amenity)}
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

                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="images">Images</Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload images of your homestay
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {isEdit ? 'Update' : 'Submit'} Homestay
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/my-homestays')} className="flex-1">
                    Cancel
                  </Button>
                </div>

                {!isEdit && (
                  <p className="text-sm text-muted-foreground text-center">
                    Your homestay will be pending admin approval after submission.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Homestay Updated!' : 'Homestay Submitted!'}</DialogTitle>
            <DialogDescription>
              {isEdit 
                ? 'Your changes have been saved successfully.'
                : 'Your homestay has been submitted for admin approval. You will be notified once it\'s reviewed.'}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
