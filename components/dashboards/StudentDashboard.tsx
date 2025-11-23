'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Material } from '@/types';
import { Loader2, FileText } from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';

const StudentDashboard = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching materials:', error);
      } else {
        setMaterials(data as any);
      }
      setLoading(false);
    };
    fetchMaterials();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">المواد الدراسية المتاحة</h1>
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Link href={`/materials/${material.id}`} key={material.id}>
              <Card className="h-full flex flex-col justify-between hover:border-accent-light transition-colors cursor-pointer">
                <div>
                  <h2 className="text-xl font-bold mb-2">{material.subject_name}</h2>
                  <p className="text-gray-400 mb-4">{material.description}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <span>
                    رفع بواسطة: {material.profiles?.full_name || 'غير معروف'}
                  </span>
                  <div className="flex items-center gap-1">
                    <FileText size={16} />
                    <span>مادة دراسية</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">لا توجد أي مواد دراسية متاحة في الوقت الحالي.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
