import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useToast } from '../hooks/use-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'siswa',
    nim_nip: '',
    kelas: '',
    jurusan: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/register', formData)
      toast({
        title: 'Registrasi berhasil',
        description: 'Silakan login dengan akun Anda',
      })
      navigate('/login')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registrasi gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Daftar Akun Baru</CardTitle>
          <CardDescription>Lengkapi informasi untuk membuat akun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nim_nip">NIM/NIP</Label>
                <Input
                  id="nim_nip"
                  name="nim_nip"
                  value={formData.nim_nip}
                  onChange={handleChange}
                />
              </div>
              {formData.role === 'siswa' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="kelas">Kelas</Label>
                    <Input
                      id="kelas"
                      name="kelas"
                      value={formData.kelas}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jurusan">Jurusan</Label>
                    <Input
                      id="jurusan"
                      name="jurusan"
                      value={formData.jurusan}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Sudah punya akun? Masuk disini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
