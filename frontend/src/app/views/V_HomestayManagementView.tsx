import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Homestay, homestayService } from '../../services/homestayService';

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function V_HomestayManagementView() {
  const { user } = useAuth();
  const [myHomestays, setMyHomestays] = useState<Homestay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.userID) return;

    setIsLoading(true);
    setError('');
    homestayService
      .listOwner(user.userID)
      .then(setMyHomestays)
      .catch((err: Error) => {
        setError(err.message || 'Failed to load your homestays.');
        setMyHomestays([]);
      })
      .finally(() => setIsLoading(false));
  }, [user?.userID]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this homestay?')) return;

    try {
      const result = await homestayService.deleteOwner(id);
      if (result.homestay) {
        setMyHomestays((items) =>
          items.map((item) => (item.id === id ? result.homestay as Homestay : item))
        );
      }
      toast.success(result.message || 'Homestay archived.');
    } catch (err: any) {
      toast.error(err.message || 'Could not archive homestay.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#D97706] text-white';
      case 'approved':
        return 'bg-[#16A34A] text-white';
      case 'archived':
        return 'bg-[#64748B] text-white';
      case 'rejected':
        return 'bg-[#DC2626] text-white';
      default:
        return 'bg-[#64748B] text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[80px] py-8">
        <div className="flex items-center justify-between mb-6">
          <h1>My Homestays</h1>
          <Link to="/homestay/new">
            <Button>+ Add New Homestay</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Your Homestays</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md border border-destructive p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading homestays...</div>
            ) : myHomestays.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't listed any homestays yet.</p>
                <Link to="/homestay/new">
                  <Button>Create Your First Homestay</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Price/Hour</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myHomestays.map((homestay) => (
                    <TableRow key={homestay.id}>
                      <TableCell className="font-medium">{homestay.title}</TableCell>
                      <TableCell>{homestay.city}</TableCell>
                      <TableCell>{formatPrice(homestay.pricePerHour)}</TableCell>
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
                        <div className="flex justify-end gap-2">
                          <Link to={`/homestay/${homestay.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/homestay/edit/${homestay.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(homestay.id)}
                            disabled={homestay.status === 'archived'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
  );
}
