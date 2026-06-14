import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { Homestay, homestayService } from '../../services/homestayService';

const amenitiesList = ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Parking', 'Bath Tub', 'Pets'];

interface FormData {
  title: string;
  address: string;
  city: string;
  pricePerHour: string;
  maxGuests: string;
  description: string;
  amenities: string[];
}

const emptyForm: FormData = {
  title: '',
  address: '',
  city: '',
  pricePerHour: '',
  maxGuests: '',
  description: '',
  amenities: [],
};

function formFromHomestay(homestay: Homestay): FormData {
  return {
    title: homestay.title,
    address: homestay.address,
    city: homestay.city,
    pricePerHour: String(homestay.pricePerHour),
    maxGuests: String(homestay.maxGuests),
    description: homestay.description,
    amenities: homestay.amenities,
  };
}

export function V_HomestayFormView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !id || !user?.userID) {
      setFormData(emptyForm);
      return;
    }

    setIsLoading(true);
    setError('');
    homestayService
      .getOwner(id, user.userID)
      .then((homestay) => setFormData(formFromHomestay(homestay)))
      .catch((err: Error) => setError(err.message || 'Failed to load homestay.'))
      .finally(() => setIsLoading(false));
  }, [id, isEdit, user?.userID]);

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userID) {
      setError('You must be signed in as an owner.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ownerId: user.userID,
        title: formData.title,
        address: formData.address,
        city: formData.city,
        pricePerHour: Number(formData.pricePerHour),
        maxGuests: Number(formData.maxGuests),
        description: formData.description,
        amenities: formData.amenities,
      };

      const result = isEdit && id
        ? await homestayService.updateOwner(id, payload)
        : await homestayService.createOwner(payload);

      setSuccessMessage(result.message);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Could not save homestay.');
    } finally {
      setIsSubmitting(false);
    }
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
            Back to My Homestays
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit' : 'Create'} Homestay</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md border border-destructive p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading homestay...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Label htmlFor="pricePerHour">Price per Hour (VND)</Label>
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
                        {amenitiesList.map((amenity) => (
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
                        disabled
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Image persistence is not enabled yet; listings use fallback images.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : `${isEdit ? 'Update' : 'Submit'} Homestay`}
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Homestay Updated!' : 'Homestay Submitted!'}</DialogTitle>
            <DialogDescription>
              {successMessage || 'Your homestay has been saved successfully.'}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
