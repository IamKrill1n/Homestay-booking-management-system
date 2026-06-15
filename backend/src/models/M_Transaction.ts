export class M_Transaction {
    // --- Private Attributes ---
    public transactionID: number;
    public bookingID: number;
    public amount: number;
    public paymentMethod: string;
    private transactionDate: Date;
    private status: string;
  
    constructor(
      transactionID: number,
      bookingID: number,
      amount: number,
      paymentMethod: string,
      transactionDate: Date = new Date(),
      status: string = 'Pending'
    ) {
      this.transactionID = transactionID;
      this.bookingID = bookingID;
      this.amount = amount;
      this.paymentMethod = paymentMethod;
      this.transactionDate = transactionDate;
      this.status = status;
    }
  
    // --- Public Methods ---
    
    /**
     * Updates the status of the transaction (e.g., 'Completed', 'Failed', 'Refunded')
     */
    public updateStatus(newStatus: string): void {
      this.status = newStatus;
    }
  
    /**
     * Returns a formatted receipt object for the frontend
     */
    public generateReceipt() {
      return {
        receiptNumber: `TXN-${this.transactionID}-${this.bookingID}`,
        date: this.transactionDate.toISOString(),
        totalPaid: this.amount,
        method: this.paymentMethod,
        status: this.status
      };
    }
  
    // --- Getters ---
    public getTransactionDetails() {
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