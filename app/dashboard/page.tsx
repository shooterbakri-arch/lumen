'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DashboardPage = () => {
  const { profile, loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login');
    }
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <span className="sr-only">جاري التحميل...</span>
      </div>
    );
  }

  if (profile?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (profile?.role === 'student') {
    return <StudentDashboard />;
  }

  return (
    <div className="text-center py-10">
      <h1 className="text-2xl font-bold">خطأ في تحديد الدور</h1>
      <p className="text-gray-400 mt-4">
        لم نتمكن من تحديد دور حسابك. يرجى التواصل مع الدعم الفني.
      </p>
    </div>
  );
};

export default DashboardPage;
