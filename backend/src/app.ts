import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/bookingRoutes';
import transactionRoutes from './routes/transactionRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/bookings', bookingRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('TypeScript Backend is running smoothly!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});