import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

interface Major {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  classes_count?: number;
  subjects_count?: number;
  users_count?: number;
}

export default function ManageMajors() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = async () => {
    try {
      const response = await api.get('/majors');
      setMajors(response.data.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data jurusan',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/majors/${editingId}`, formData);
        toast({ title: 'Berhasil', description: 'Jurusan berhasil diupdate' });
      } else {
        await api.post('/majors', formData);
        toast({ title: 'Berhasil', description: 'Jurusan berhasil ditambahkan' });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ code: '', name: '', description: '', is_active: true });
      fetchMajors();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menyimpan data',
      });
    }
  };

  const handleEdit = (major: Major) => {
    setFormData({
      code: major.code,
      name: major.name,
      description: major.description || '',
      is_active: major.is_active,
    });
    setEditingId(major.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus jurusan ini?')) return;
    
    try {
      await api.delete(`/majors/${id}`);
      toast({ title: 'Berhasil', description: 'Jurusan berhasil dihapus' });
      fetchMajors();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menghapus data',
      });
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Jurusan</h1>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({ code: '', name: '', description: '', is_active: true });
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jurusan
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Jurusan' : 'Tambah Jurusan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Kode Jurusan *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="TKR, TKJ, AKT"
                  required
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="name">Nama Jurusan *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Teknik Kendaraan Ringan"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi jurusan..."
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {majors.map((major) => (
          <Card key={major.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-lg">{major.code}</h3>
                  {major.is_active && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{major.name}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(major)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(major.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {major.description && (
              <p className="text-sm text-gray-500 mb-4">{major.description}</p>
            )}
            <div className="flex gap-4 text-sm text-gray-600 border-t pt-4">
              <div>
                <div className="font-semibold">{major.classes_count || 0}</div>
                <div>Kelas</div>
              </div>
              <div>
                <div className="font-semibold">{major.subjects_count || 0}</div>
                <div>Mapel</div>
              </div>
              <div>
                <div className="font-semibold">{major.users_count || 0}</div>
                <div>Siswa</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {majors.length === 0 && (
        <Card className="p-12 text-center text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada data jurusan</p>
        </Card>
      )}
    </div>
  );
}
