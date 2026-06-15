import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Homestay, homestayService } from '../../services/homestayService';

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function V_AdminVerificationView() {
  const [selectedHomestay, setSelectedHomestay] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingHomestays, setPendingHomestays] = useState<Homestay[]>([]);
  const [allHomestays, setAllHomestays] = useState<Homestay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');

  const homestayDetail = useMemo(
    () => allHomestays.find((homestay) => homestay.id === selectedHomestay)
      || pendingHomestays.find((homestay) => homestay.id === selectedHomestay),
    [allHomestays, pendingHomestays, selectedHomestay]
  );

  const loadHomestays = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [pending, all] = await Promise.all([
        homestayService.listPendingAdmin(),
        homestayService.listAdmin(),
      ]);
      setPendingHomestays(pending);
      setAllHomestays(all);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin homestays.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomestays();
  }, []);

  const mergeUpdatedHomestay = (updated: Homestay | null) => {
    if (!updated) return;
    setPendingHomestays((items) => items.filter((item) => item.id !== updated.id));
    setAllHomestays((items) =>
      items.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleApprove = async (id: string) => {
    setIsMutating(true);
    try {
      const result = await homestayService.approveAdmin(id);
      mergeUpdatedHomestay(result.homestay);
      toast.success(result.message || 'Homestay approved.');
      setSelectedHomestay(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not approve homestay.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedHomestay) return;

    setIsMutating(true);
    try {
      const result = await homestayService.rejectAdmin(selectedHomestay, rejectReason);
      mergeUpdatedHomestay(result.homestay);
      toast.success(result.message || 'Homestay rejected.');
      setShowRejectDialog(false);
      setSelectedHomestay(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.message || 'Could not reject homestay.');
    } finally {
      setIsMutating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#D97706] text-white';
      case 'approved':
        return 'bg-[#16A34A] text-white';
      case 'rejected':
        return 'bg-[#DC2626] text-white';
      default:
        return 'bg-[#64748B] text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <h1 className="mb-6">Admin - Verify Homestays</h1>

        {error && (
          <div className="mb-4 rounded-md border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification ({pendingHomestays.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading pending homestays...</div>
              ) : pendingHomestays.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending homestays to verify.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Homestay</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Price/Hour</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingHomestays.map((homestay) => (
                      <TableRow key={homestay.id}>
                        <TableCell className="font-medium">{homestay.title}</TableCell>
                        <TableCell>Owner {homestay.ownerId}</TableCell>
                        <TableCell>{homestay.city}</TableCell>
                        <TableCell>{formatPrice(homestay.pricePerHour)}</TableCell>
                        <TableCell>{format(new Date(homestay.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedHomestay(homestay.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Homestays</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading homestays...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Homestay</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allHomestays.map((homestay) => (
                      <TableRow key={homestay.id}>
                        <TableCell className="font-medium">{homestay.title}</TableCell>
                        <TableCell>Owner {homestay.ownerId}</TableCell>
                        <TableCell>{homestay.city}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(homestay.status)}>
                            {homestay.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={homestay.availability === 'available' ? 'default' : 'secondary'}>
                            {homestay.availability}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedHomestay(homestay.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={!!selectedHomestay} onOpenChange={(open) => !open && setSelectedHomestay(null)}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          {homestayDetail && (
            <>
              <SheetHeader>
                <SheetTitle>Review Homestay</SheetTitle>
                <SheetDescription>
                  Review the homestay details and approve or reject the listing.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-2">
                  {homestayDetail.images.map((img, idx) => (
                    <img
                      key={img}
                      src={img}
                      alt={`${homestayDetail.title} ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>

                <div>
                  <h3>{homestayDetail.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{homestayDetail.address}</p>
                  <p className="text-sm text-muted-foreground">{homestayDetail.city}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price per Hour</Label>
                    <p className="mt-1 font-semibold text-primary">{formatPrice(homestayDetail.pricePerHour)}</p>
                  </div>
                  <div>
                    <Label>Max Guests</Label>
                    <p className="mt-1">{homestayDetail.maxGuests}</p>
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(homestayDetail.status)}>
                      {homestayDetail.status}
                    </Badge>
                  </div>
                </div>

                {homestayDetail.rejectionReason && (
                  <div>
                    <Label>Rejection Reason</Label>
                    <p className="mt-1 text-sm">{homestayDetail.rejectionReason}</p>
                  </div>
                )}

                <div>
                  <Label>Amenities</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {homestayDetail.amenities.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No amenities listed.</span>
                    ) : (
                      homestayDetail.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline">
                          {amenity}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-sm">{homestayDetail.description}</p>
                </div>

                <div>
                  <Label>Submitted On</Label>
                  <p className="mt-1 text-sm">{format(new Date(homestayDetail.createdAt), 'MMMM dd, yyyy')}</p>
                </div>

                {homestayDetail.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      onClick={() => handleApprove(homestayDetail.id)}
                      className="flex-1 bg-[#16A34A] hover:bg-[#16A34A]/90"
                      disabled={isMutating}
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => setShowRejectDialog(true)}
                      variant="destructive"
                      className="flex-1"
                      disabled={isMutating}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Homestay</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this homestay listing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for Rejection</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason..."
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isMutating}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason.trim() || isMutating}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
