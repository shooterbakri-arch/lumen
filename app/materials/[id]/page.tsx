'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, FileText, Download, User2, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Chat from '@/components/Chat';

// واجهة المادة
interface MaterialWithFilePath {
  id: string;
  file_path: string | null;
  subject_name: string;
  description: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  file_url?: string | null;
}

const getSignedUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('materials')
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
};

const MaterialPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [material, setMaterial] = useState<MaterialWithFilePath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single();

      if (error) setError('فشل في العثور على المادة المطلوبة.');
      else if (data) {
        const materialData = data as MaterialWithFilePath;
        setMaterial(materialData);

        let filePath = materialData.file_path;
        if (!filePath && materialData.file_url) {
          const urlParts = materialData.file_url.split('/materials/');
          if (urlParts.length > 1) filePath = urlParts[1];
        }
        if (filePath) {
          const url = await getSignedUrl(filePath);
          setSignedUrl(url);
        } else setError('مسار الملف غير موجود.');
      } else setError('المادة غير موجودة.');
      setLoading(false);
    };
    fetchMaterial();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );

  if (error || !material || !signedUrl)
    return (
      <div className="text-center py-20 bg-gradient-to-br from-white to-gray-100">
        <h1 className="text-2xl text-red-500">{error || 'تعذر الوصول للمادة.'}</h1>
      </div>
    );

  const formattedDate = new Date(material.created_at).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fileForExtension = material.file_path || material.file_url;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-screen font-[Inter]">
      <Card className="mb-8 backdrop-blur-xl bg-white/80 border border-gray-200 shadow-lg rounded-3xl p-6 transition hover:shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              {material.subject_name}
            </h1>
            <p className="text-gray-600 mb-4">
              {material.description || 'لا يوجد وصف متاح لهذه المادة.'}
            </p>
          </div>

          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto flex items-center justify-center 
              bg-gradient-to-r from-indigo-500 to-blue-500 text-white 
              hover:opacity-90 transition px-6 py-3 rounded-xl font-semibold 
              shadow-md hover:shadow-lg"
          >
            <Download size={20} className="ml-2" />
            تنزيل / عرض الملف
          </a>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <User2 size={16} className="text-indigo-500" />
            المعلم:{' '}
            <span className="text-gray-800 font-medium">
              {material.profiles?.full_name || 'غير معروف'}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <Calendar size={16} className="text-indigo-500" />
            تاريخ الرفع:{' '}
            <span className="text-gray-800 font-medium">{formattedDate}</span>
          </span>
          <span className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-500" />
            نوع الملف:{' '}
            <span className="text-gray-800 font-medium">
              {fileForExtension?.split('.').pop()?.toUpperCase() || 'N/A'}
            </span>
          </span>
        </div>
      </Card>

      <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200 p-6 shadow-md hover:shadow-2xl transition">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          🤖 دردش مع المادة
        </h2>
        <Chat fileUrl={signedUrl} />
      </div>
    </div>
  );
};

export default MaterialPage;
