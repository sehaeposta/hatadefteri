'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Trash2,
  Filter,
  BookOpen,
  Calculator,
  FlaskConical,
  Landmark,
  Moon,
  Languages,
  ImageIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// Branş tanımları
const BRANCHES = [
  { value: 'TURKCE', label: 'Türkçe', icon: BookOpen, color: 'bg-red-500' },
  { value: 'MATEMATIK', label: 'Matematik', icon: Calculator, color: 'bg-blue-500' },
  { value: 'FEN', label: 'Fen Bilgisi', icon: FlaskConical, color: 'bg-green-500' },
  { value: 'INKILAP', label: 'İnkılap Tarihi', icon: Landmark, color: 'bg-amber-500' },
  { value: 'DIN', label: 'Din Kültürü', icon: Moon, color: 'bg-purple-500' },
  { value: 'INGILIZCE', label: 'İngilizce', icon: Languages, color: 'bg-cyan-500' },
] as const;

type Branch = typeof BRANCHES[number]['value'];

interface Question {
  id: string;
  branch: Branch;
  imageUrl: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [newBranch, setNewBranch] = useState<Branch>('TURKCE');
  const [newNote, setNewNote] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Soruları yükle
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = selectedBranch === 'ALL' 
        ? '/api/questions' 
        : `/api/questions?branch=${selectedBranch}`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      toast.error('Sorular yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Görsel yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setNewImage(data.url);
        toast.success('Görsel yüklendi');
      }
    } catch (error) {
      toast.error('Görsel yüklenemedi');
    } finally {
      setIsUploading(false);
    }
  };

  // Soru ekle
  const handleAddQuestion = async () => {
    if (!newImage) {
      toast.error('Lütfen bir görsel seçin');
      return;
    }

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: newBranch,
          imageUrl: newImage,
          note: newNote || null,
        }),
      });

      if (res.ok) {
        toast.success('Soru eklendi');
        setIsAddDialogOpen(false);
        setNewImage(null);
        setNewNote('');
        setNewBranch('TURKCE');
        fetchQuestions();
      }
    } catch (error) {
      toast.error('Soru eklenemedi');
    }
  };

  // Soru sil
  const handleDeleteQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Soru silindi');
        fetchQuestions();
      }
    } catch (error) {
      toast.error('Soru silinemedi');
    }
  };

  // Branş bilgilerini getir
  const getBranchInfo = (branch: Branch) => {
    return BRANCHES.find((b) => b.value === branch) || BRANCHES[0];
  };

  // Branş bazlı istatistikler
  const getBranchStats = () => {
    const stats: Record<string, number> = {};
    BRANCHES.forEach((b) => {
      stats[b.value] = questions.filter((q) => q.branch === b.value).length;
    });
    return stats;
  };

  const stats = getBranchStats();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Hata Günlüğü</h1>
                <p className="text-sm text-muted-foreground">
                  Yanlış sorularını kaydet ve takip et
                </p>
              </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Soru Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni Soru Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Branş Seçimi */}
                  <div className="space-y-2">
                    <Label>Branş</Label>
                    <Select
                      value={newBranch}
                      onValueChange={(v) => setNewBranch(v as Branch)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((branch) => (
                          <SelectItem key={branch.value} value={branch.value}>
                            <div className="flex items-center gap-2">
                              <branch.icon className="h-4 w-4" />
                              {branch.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Görsel Yükleme */}
                  <div className="space-y-2">
                    <Label>Soru Görseli</Label>
                    <div className="flex flex-col items-center gap-3">
                      {newImage ? (
                        <div className="relative w-full">
                          <img
                            src={newImage}
                            alt="Yüklenen soru"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => setNewImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          {isUploading ? (
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">
                                Görsel yüklemek için tıklayın
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Not */}
                  <div className="space-y-2">
                    <Label>Not (Opsiyonel)</Label>
                    <Textarea
                      placeholder="Soru ile ilgili notunuz..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleAddQuestion}
                    disabled={!newImage}
                  >
                    Kaydet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Branş İstatistikleri */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 mb-6">
          {BRANCHES.map((branch) => (
            <Card
              key={branch.value}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedBranch === branch.value
                  ? 'ring-2 ring-primary shadow-lg'
                  : ''
              }`}
              onClick={() =>
                setSelectedBranch(
                  selectedBranch === branch.value ? 'ALL' : branch.value
                )
              }
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${branch.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                >
                  <branch.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <p className="text-xs sm:text-sm font-medium truncate">
                  {branch.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {stats[branch.value] || 0}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtre Bilgisi */}
        {selectedBranch !== 'ALL' && (
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Filtre: {getBranchInfo(selectedBranch as Branch).label}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBranch('ALL')}
            >
              Temizle
            </Button>
          </div>
        )}

        {/* Soru Listesi */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : questions.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz soru yok</h3>
              <p className="text-muted-foreground mb-4">
                Yanlış yaptığınız soruların fotoğraflarını yükleyerek
                başlayabilirsiniz
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Soruyu Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {questions.map((question) => {
              const branchInfo = getBranchInfo(question.branch);
              return (
                <Card key={question.id} className="group overflow-hidden">
                  <div
                    className="relative aspect-[4/3] cursor-pointer"
                    onClick={() => {
                      setSelectedImage(question.imageUrl);
                      setIsImageDialogOpen(true);
                    }}
                  >
                    <img
                      src={question.imageUrl}
                      alt="Soru"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge
                      className={`absolute top-2 left-2 ${branchInfo.color} text-white`}
                    >
                      <branchInfo.icon className="h-3 w-3 mr-1" />
                      {branchInfo.label}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    {question.note && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {question.note}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Soruyu Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu soruyu silmek istediğinizden emin misiniz? Bu
                              işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md dark:bg-slate-900/80 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>Toplam {questions.length} soru kayıtlı</p>
        </div>
      </footer>

      {/* Görsel Görüntüleme Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Soru detayı"
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
