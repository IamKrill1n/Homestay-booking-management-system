export class M_Transaction {
  constructor({
    transactionID = null,
    bookingID,
    amount,
    paymentMethod,
    transactionDate = new Date(),
    status = "pending",
  } = {}) {
    this.transactionID = transactionID;
    this.bookingID = bookingID;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.transactionDate = transactionDate;
    this.status = status;
  }

  generateReceipt() {
    return {
      receiptNumber: `TXN-${this.transactionID ?? "new"}-${this.bookingID}`,
      date: new Date(this.transactionDate).toISOString(),
      totalPaid: this.amount,
      method: this.paymentMethod,
      status: this.status,
    };
  }
}

export default M_Transaction;
