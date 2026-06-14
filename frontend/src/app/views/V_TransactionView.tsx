import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

export function V_TransactionView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the booking details passed from the BookingView
  const { bookingID, amount } = location.state || { bookingID: 0, amount: 0 };
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // If someone navigates here directly without a booking, send them back
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
      // Call the Express route we just built!
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingID: bookingID,
          amount: amount,
          paymentMethod: paymentMethod
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setReceiptData(result.receipt);
        setShowReceipt(true); // Show success modal
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Could not connect to the payment server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setShowReceipt(false);
    navigate('/my-bookings'); // Send them to their dashboard!
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex justify-center">
      <div className="max-w-md w-full">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          ← Cancel Payment
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>Booking Reference: #{bookingID}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Amount Due</p>
              <p className="text-4xl font-bold text-primary">${amount}</p>
            </div>

            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4">
                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="cursor-pointer">Credit / Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="cursor-pointer">Bank Transfer</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handlePayment} 
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay $${amount}`}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Digital Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Successful!</DialogTitle>
            <DialogDescription>
              Your booking is now confirmed.
            </DialogDescription>
          </DialogHeader>
          {receiptData && (
            <div className="bg-muted p-4 rounded-md text-sm space-y-2">
              <div className="flex justify-between"><span>Receipt No:</span> <strong>{receiptData.receiptNumber}</strong></div>
              <div className="flex justify-between"><span>Amount Paid:</span> <strong>${receiptData.totalPaid}</strong></div>
              <div className="flex justify-between"><span>Method:</span> <span className="capitalize">{receiptData.method.replace('_', ' ')}</span></div>
            </div>
          )}
          <Button onClick={handleFinish} className="w-full mt-4">View My Bookings</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}