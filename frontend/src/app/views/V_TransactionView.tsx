import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function V_TransactionView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingID, amount } = location.state || { bookingID: null, amount: 0 };
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  if (!bookingID) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingID,
          amount,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed.');
      }

      const result = await response.json();
      setReceiptData(result.receipt);
      setShowReceipt(true);
    } catch (error: any) {
      alert(error.message || 'Could not process payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex justify-center">
      <div className="max-w-md w-full">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>Booking Reference: #{bookingID}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Amount Due</p>
              <p className="text-4xl font-semibold text-primary">{formatPrice(Number(amount))}</p>
            </div>

            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4">
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="cursor-pointer">Credit / Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="cursor-pointer">Bank Transfer</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div className="rounded-lg border p-4 text-sm space-y-3">
                <div>
                  <p className="text-muted-foreground">Bank</p>
                  <p className="font-medium">TPBank</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Number</p>
                  <p className="font-medium">00339705529</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transfer Content</p>
                  <p className="font-medium">BOOKING-{bookingID}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Confirm ${formatPrice(Number(amount))} Payment`}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Successful</DialogTitle>
            <DialogDescription>Your booking is now confirmed.</DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="bg-muted p-4 rounded-md text-sm space-y-2">
              <div className="flex justify-between"><span>Receipt No:</span> <strong>{receiptData.receiptNumber}</strong></div>
              <div className="flex justify-between"><span>Amount Paid:</span> <strong>{formatPrice(Number(receiptData.totalPaid))}</strong></div>
              <div className="flex justify-between"><span>Method:</span> <span className="capitalize">{receiptData.method.replace('_', ' ')}</span></div>
            </div>
          )}
          <Button onClick={() => navigate('/my-bookings')} className="w-full mt-4">
            View My Bookings
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
