'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Material } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Upload, FileText, Loader2, Trash2, PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Card from '@/components/ui/Card';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMaterials = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('materials')
      .select('*, profiles(full_name)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('فشل في جلب المواد');
    } else {
      setMaterials(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !subjectName || !description || !user) {
        toast.error('يرجى ملء جميع الحقول واختيار ملف.');
        return;
    };

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `public/${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file);

    if (uploadError) {
      toast.error(`فشل رفع الملف: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('materials').insert({
      teacher_id: user.id,
      subject_name: subjectName,
      description: description,
      file_url: publicUrl,
    });

    setUploading(false);

    if (insertError) {
      toast.error(`فشل حفظ المادة: ${insertError.message}`);
    } else {
      toast.success('تم رفع المادة بنجاح!');
      setSubjectName('');
      setDescription('');
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if(fileInput) fileInput.value = '';
      fetchMaterials();
    }
  };
  
  const handleDelete = async (material: Material) => {
    // Extract file path from URL
    const filePath = material.file_url.substring(material.file_url.indexOf('/materials/') + '/materials/'.length);

    // First, delete from DB
    const { error: dbError } = await supabase.from('materials').delete().eq('id', material.id);
    if(dbError) {
      toast.error('فشل حذف المادة من قاعدة البيانات');
      return;
    }

    // Then, delete from Storage
    const { error: storageError } = await supabase.storage.from('materials').remove([filePath]);
     if(storageError) {
      toast.error('فشل حذف الملف من وحدة التخزين، لكن تم حذفه من القائمة.');
    } else {
        toast.success('تم حذف المادة بنجاح');
    }
    fetchMaterials();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">لوحة تحكم المعلم</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><PlusCircle size={24}/> رفع مادة جديدة</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <Label htmlFor="subjectName">اسم المادة</Label>
                <Input id="subjectName" type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required placeholder="مثال: فيزياء 101"/>
              </div>
              <div className="mb-4">
                <Label htmlFor="description">وصف المادة</Label>
                <Input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="وصف موجز لمحتوى المادة"/>
              </div>
              <div className="mb-6">
                <Label htmlFor="file">ملف المادة (PDF, DOCX)</Label>
                <Input id="file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required accept=".pdf,.docx" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-dark file:text-white hover:file:bg-accent"/>
              </div>
              <Button type="submit" isLoading={uploading}>
                <Upload className="ml-2 h-4 w-4" />
                {uploading ? 'جاري الرفع...' : 'رفع المادة'}
              </Button>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-xl font-semibold mb-4">المواد التي قمت برفعها</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {materials.length > 0 ? (
                materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg transition-all hover:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent-light">{material.subject_name}</a>
                        <p className="text-sm text-gray-500">{material.description}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(material)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors">
                        <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">لم تقم برفع أي مواد بعد.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
