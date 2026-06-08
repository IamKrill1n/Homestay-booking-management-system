import { Link } from 'react-router-dom';
import { mockHomestays } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Edit, Eye, Trash2 } from 'lucide-react';

export function V_HomestayManagementView() {
  const { user } = useAuth();
  
  // Filter homestays by owner
  const myHomestays = mockHomestays.filter(h => h.ownerId === user?.id);

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
            {myHomestays.length === 0 ? (
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
                  {myHomestays.map(homestay => (
                    <TableRow key={homestay.id}>
                      <TableCell className="font-medium">{homestay.title}</TableCell>
                      <TableCell>{homestay.city}</TableCell>
                      <TableCell>${homestay.pricePerHour}</TableCell>
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
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
