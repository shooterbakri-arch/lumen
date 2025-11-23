import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // تأكد من صحة المسار
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Upload, FileText, Loader2, Trash2, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Card from '../components/ui/Card';

// ⚠️ ملاحظة: يجب تعديل تعريف النوع (Type) ليناسب الجدول الجديد
// افترضنا أن الجدول يحتوي على id, teacher_id, subject_name, file_path, created_at
interface Material {
  id: string;
  subject_name: string; // تم تغيير 'title' إلى 'subject_name'
  file_path: string;    // تم إضافة 'file_path' بدلاً من 'file_url'
  created_at: string;
  teacher_id: string;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  // تم إزالة useState الخاص بـ courses و selectedCourse لأنه لم يعد مستخدماً في الـ Refactor
  const [materials, setMaterials] = useState<Material[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --------------------------------------------------------
  // 1. وظيفة جلب المواد (تعتمد على teacher_id)
  // --------------------------------------------------------
  const fetchMaterials = async () => {
    if (!user?.id) return;
    setLoading(true);

    // *التعديل 1: الفلترة بواسطة teacher_id بدلاً من course_id*
    const { data, error } = await supabase
      .from('materials')
      .select('id, subject_name, file_path, created_at, teacher_id')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('فشل في جلب المواد');
      console.error(error);
    } else {
      setMaterials(data as Material[]);
    }
    setLoading(false);
  };

  // 2. تحديث useEffect للجلب بناءً على user.id
  useEffect(() => {
    if (user?.id) {
      fetchMaterials();
    }
  }, [user?.id]);
  
  // --------------------------------------------------------
  // 3. وظيفة الحصول على رابط موقع (Signed URL)
  // --------------------------------------------------------
  const getSignedUrl = async (path: string) => {
    // *نستخدم createSignedUrl لأن الـ Bucket أصبح خاصاً*
    const { data, error } = await supabase.storage
      .from('materials')
      .createSignedUrl(path, 60); // الرابط صالح لمدة 60 ثانية 

    if (error) {
      toast.error('فشل في إنشاء رابط التنزيل/العرض. تأكد من صلاحية السياسات.');
      console.error(error);
      return null;
    }
    return data.signedUrl;
  };

  // --------------------------------------------------------
  // 4. دالة معالجة الرفع
  // --------------------------------------------------------
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    // *التعديل 2: التحقق من وجود user.id*
    if (!file || !title || !user?.id) {
      toast.error('يرجى اختيار ملف وكتابة عنوان.');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    // *التعديل 3: مسار التخزين لاستخدامه في DB*
    const storagePath = `${user.id}/${title.replace(/\s/g, '_')}_${Date.now()}.${fileExt}`;

    // 1. Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(storagePath, file); // نستخدم storagePath

    if (uploadError) {
      toast.error(`فشل رفع الملف: ${uploadError.message}. (تأكد من أن دورك 'teacher')`);
      setUploading(false);
      return;
    }

    // 2. Insert into materials table
    const { error: insertError } = await supabase.from('materials').insert({
      teacher_id: user.id,          // *التعديل 4: استخدام teacher_id*
      subject_name: title,         // *التعديل 5: استخدام subject_name*
      file_path: storagePath,      // *التعديل 6: تخزين المسار بدلاً من file_url*
      // تم إزالة course_id
    });

    setUploading(false);

    if (insertError) {
      toast.error(`فشل حفظ المادة في DB: ${insertError.message}`);
    } else {
      toast.success('تم رفع المادة بنجاح!');
      setTitle('');
      setFile(null);
      fetchMaterials(); // Refresh materials list
    }
  };

  // --------------------------------------------------------
  // 5. دالة معالجة عرض الملف
  // --------------------------------------------------------
  const handleView = async (filePath: string) => {
      const url = await getSignedUrl(filePath);
      if (url) {
          window.open(url, '_blank');
      }
  };
}
