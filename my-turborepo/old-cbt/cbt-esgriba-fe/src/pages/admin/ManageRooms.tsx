import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Room {
  id: number;
  code: string;
  name: string;
  capacity: number;
  building?: string;
  floor?: number;
  tests_count?: number;
}

export default function ManageRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    capacity: "",
    building: "",
    floor: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms");
      setRooms(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data ruangan",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        code: room.code,
        name: room.name,
        capacity: room.capacity.toString(),
        building: room.building || "",
        floor: room.floor?.toString() || "",
      });
    } else {
      setEditingRoom(null);
      setFormData({
        code: "",
        name: "",
        capacity: "",
        building: "",
        floor: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        building: formData.building || null,
        floor: formData.floor ? parseInt(formData.floor) : null,
      };

      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, submitData);
        toast({
          title: "Berhasil",
          description: "Ruangan berhasil diperbarui",
        });
      } else {
        await api.post("/rooms", submitData);
        toast({
          title: "Berhasil",
          description: "Ruangan berhasil ditambahkan",
        });
      }
      setIsDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/rooms/${deleteId}`);
      toast({ title: "Berhasil", description: "Ruangan berhasil dihapus" });
      setIsDeleteDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus ruangan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kelola Ruangan</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manajemen data ruangan dan kapasitas
          </p>
        </div>
        <Button className="h-9 sm:h-10" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Tambah Ruangan</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <DoorOpen className="h-8 w-8 text-primary" />
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {room.code}
                </span>
              </div>
              <CardTitle className="mt-2">{room.name}</CardTitle>
              <CardDescription>
                {room.building && room.floor
                  ? `${room.building} - Lantai ${room.floor}`
                  : "Lokasi belum diatur"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kapasitas:</span>
                  <span className="font-medium">{room.capacity} orang</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Ujian:</span>
                  <span className="font-medium">{room.tests_count || 0}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(room)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteId(room.id);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Edit Ruangan" : "Tambah Ruangan"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Perbarui informasi ruangan"
                : "Tambahkan ruangan baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Kode Ruangan</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Contoh: R-101"
              />
            </div>
            <div>
              <Label htmlFor="name">Nama Ruangan</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Ruang Kelas 101"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Kapasitas</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="Contoh: 40"
                />
              </div>
              <div>
                <Label htmlFor="floor">Lantai</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
                  }
                  placeholder="Contoh: 1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="building">Gedung</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
                placeholder="Contoh: Gedung A"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Ruangan?</DialogTitle>
            <DialogDescription>
              Data ruangan akan dihapus permanen. Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
