"use client"
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle,
  Eye,
  MapPin,
  User
} from 'lucide-react';
import { toast } from "sonner";
import { MosqType } from '@/models/mosq';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MosqueVerification() {
  const [mosques, setMosques] = useState<MosqType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUnverifiedMosques();
  }, []);

  const fetchUnverifiedMosques = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/mosques/unverified');
      const data = await response.json();
      
      if (data.success) {
        setMosques(data.mosques);
      } else {
        throw new Error(data.message || "Failed to fetch unverified mosques");
      }
    } catch (error) {
      console.error("Error fetching unverified mosques:", error);
      toast.error("Failed to load unverified mosques");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMosque = async (mosqueId: string) => {
    try {
      const response = await fetch(`/api/admin/mosques/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mosqueId }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the mosque from the list since it's now verified
        setMosques(prev => prev.filter(mosque => mosque._id?.toString() !== mosqueId));
        toast.success("Mosque verified successfully");
      } else {
        throw new Error(data.message || "Failed to verify mosque");
      }
    } catch (error) {
      console.error("Error verifying mosque:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify mosque");
    }
  };

  const handleRejectMosque = async (mosqueId: string) => {
    try {
      const response = await fetch(`/api/admin/mosques/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mosqueId }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the mosque from the list since it's been rejected
        setMosques(prev => prev.filter(mosque => mosque._id?.toString() !== mosqueId));
        toast.success("Mosque rejected successfully");
      } else {
        throw new Error(data.message || "Failed to reject mosque");
      }
    } catch (error) {
      console.error("Error rejecting mosque:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reject mosque");
    }
  };

  const viewMosqueDetails = (mosqueId: string) => {
    router.push(`/admin/mosques/${mosqueId}`);
  };

  return (
    <div className='container mx-auto my-2'>
      <h1 className="text-3xl font-bold mb-6">Mosque Verification</h1>
      
      <Card className="p-6 mb-6">
        {loading ? (
          <div className="text-center py-8">Loading unverified mosques...</div>
        ) : mosques.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No mosques pending verification
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mosque Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Imam</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mosques.map((mosque) => (
                  <TableRow key={mosque._id?.toString()}>
                    <TableCell className="font-medium">{mosque.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span>{mosque.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-muted-foreground" />
                        <span>{mosque.imam}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => viewMosqueDetails(mosque._id?.toString() || '')}
                          title="View Mosque Details"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleVerifyMosque(mosque._id?.toString() || '')}
                          title="Verify Mosque"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleRejectMosque(mosque._id?.toString() || '')}
                          title="Reject Mosque"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}