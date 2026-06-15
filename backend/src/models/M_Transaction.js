export class M_Transaction { 
  constructor( 
    transactionID, 
    bookingID, 
    amount, 
    paymentMethod, 
    transactionDate = new Date(), 
    status = 'pending' 
  ) { 
    this.transactionID = transactionID; 
    this.bookingID = bookingID; 
    this.amount = amount; 
    this.paymentMethod = paymentMethod; 
    this.transactionDate = transactionDate; 
    this.status = status; 
  } 

  updateStatus(newStatus) { 
    this.status = newStatus; 
  } 

  generateReceipt() { 
    return { 
      receiptNumber: `TXN-${this.transactionID}-${this.bookingID}`, 
      date: this.transactionDate.toISOString(), 
      totalPaid: this.amount, 
      method: this.paymentMethod, 
      status: this.status 
    }; 
  } 

  getTransactionDetails() { 
    return { 
      transactionID: this.transactionID, 
      bookingID: this.bookingID, 
      amount: this.amount, 
      paymentMethod: this.paymentMethod, 
      transactionDate: this.transactionDate, 
      status: this.status 
    }; 
  } 
}