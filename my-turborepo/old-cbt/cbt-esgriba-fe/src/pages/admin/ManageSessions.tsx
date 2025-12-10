import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import sessionService, {
  ExamSession,
  CreateSessionPayload,
} from "@/lib/services/sessionService";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function ManageSessions() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamSession | null>(null);
  const [form, setForm] = useState<CreateSessionPayload>({
    number: undefined,
    label: "",
    start_time: "08:00",
    end_time: "09:30",
    duration_minutes: undefined,
    is_active: true,
  });

  const load = async () => {
    try {
      setLoading(true);
      const data = await sessionService.list();
      setSessions(data);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.response?.data?.message || "Gagal memuat sesi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      number: undefined,
      label: "",
      start_time: "08:00",
      end_time: "09:30",
      duration_minutes: undefined,
      is_active: true,
    });
    setOpen(true);
  };

  const openEdit = (s: ExamSession) => {
    setEditing(s);
    setForm({
      number: s.number ?? undefined,
      label: s.label,
      start_time: s.start_time,
      end_time: s.end_time,
      duration_minutes: s.duration_minutes ?? undefined,
      is_active: s.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (!form.label) {
        toast({
          title: "Error",
          description: "Label sesi wajib diisi",
          variant: "destructive",
        });
        return;
      }
      if (editing) {
        await sessionService.update(editing.id, form);
        toast({ title: "Berhasil", description: "Sesi diperbarui" });
      } else {
        await sessionService.create(form);
        toast({ title: "Berhasil", description: "Sesi dibuat" });
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.response?.data?.message || "Gagal menyimpan sesi",
        variant: "destructive",
      });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Hapus sesi ini?")) return;
    try {
      await sessionService.delete(id);
      toast({ title: "Berhasil", description: "Sesi dihapus" });
      load();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.response?.data?.message || "Gagal menghapus sesi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Sesi Ujian</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Sesi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Sesi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Memuat...</p>
          ) : sessions.length === 0 ? (
            <p>Belum ada sesi</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="border rounded-md p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">
                      {s.label}
                      {s.number ? ` (Sesi ${s.number})` : ""}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.start_time} - {s.end_time} • Durasi{" "}
                      {s.duration_minutes} menit
                    </div>
                    {!s.is_active && (
                      <div className="text-xs text-amber-600">Nonaktif</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(s)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sesi" : "Tambah Sesi"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nomor (opsional)</Label>
              <Input
                type="number"
                value={form.number ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    number: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <div className="col-span-1">
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Sesi 1"
              />
            </div>
            <div>
              <Label>Jam Mulai *</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Jam Selesai *</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
            <div>
              <Label>Durasi (menit) (kosongkan untuk otomatis)</Label>
              <Input
                type="number"
                value={form.duration_minutes ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration_minutes: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Aktif</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>{editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
