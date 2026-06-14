export class M_Booking {
    // --- Private Attributes ---
    private bookingID: number;
    private homestayID: number;
    private guestID: number;
    private checkInDate: Date;
    private checkOutDate: Date;
    private status: string;
  
    constructor(
      bookingID: number,
      homestayID: number,
      guestID: number,
      checkInDate: Date,
      checkOutDate: Date,
      status: string = 'Pending' // Defaults to Pending
    ) {
      this.bookingID = bookingID;
      this.homestayID = homestayID;
      this.guestID = guestID;
      this.checkInDate = checkInDate;
      this.checkOutDate = checkOutDate;
      this.status = status;
    }
  
    // --- Public Methods ---
  
    /**
     * Calculates duration of stay based on check-in and check-out dates.
     */
    public calculateTotalDays(): number {
      // Get the time difference in milliseconds
      const timeDifference = this.checkOutDate.getTime() - this.checkInDate.getTime();
      
      // Convert milliseconds to days (1000ms * 60s * 60m * 24h)
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
      
      return daysDifference;
    }
  
    /**
     * Updates the status of the booking.
     */
    public setStatus(status: string): void {
      // You could add validation here later (e.g., only allow 'Pending', 'Confirmed', 'Cancelled')
      this.status = status;
    }
  
    // --- Getters ---
    // Because your attributes are private, you will need getters so your 
    // BookingController can actually read the data to save it to PostgreSQL.
    public getBookingDetails() {
      return {
        bookingID: this.bookingID,
        homestayID: this.homestayID,
        guestID: this.guestID,
        checkInDate: this.checkInDate,
        checkOutDate: this.checkOutDate,
        status: this.status,
        totalDays: this.calculateTotalDays()
      };
    }
  }