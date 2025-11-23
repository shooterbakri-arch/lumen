'use client';
import { useState } from 'react';
import { useRouter, redirect } from 'next/navigation';
import Link from 'next/link';
// تأكد أن هذا المسار صحيح لإعداد Supabase الخاص بك
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
// تأكد من وجود المكونات التالية في مساراتها الصحيحة
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

const SignUpPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useAuth();
  
  // بالنسبة لهذا التطبيق، يمكن للطلاب فقط التسجيل. المعلمون مسجلون مسبقًا.
  const role = 'student';

  if (session) {
    redirect('/dashboard');
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ⭐️ التحديث: تنظيف جميع المدخلات من المسافات الزائدة (.trim()) قبل المعالجة ⭐️
    const processedEmail = email.trim();
    const processedFullName = fullName.trim();
    // تحويل وتنظيف الكود الجامعي
    const processedStudentCode = studentCode.trim().toLowerCase(); 
    
    // التحقق من أن الكود الجامعي ليس فارغاً بعد التنظيف
    if (!processedStudentCode) {
        toast.error('الرجاء إدخال الكود الجامعي.');
        setLoading(false);
        return;
    }

    // المتابعة بالتسجيل وإرسال الكود في الـ Metadata
    const { data, error } = await supabase.auth.signUp({
      email: processedEmail, // استخدام البريد المنظف
      password,
      options: {
        data: {
          full_name: processedFullName, // استخدام الاسم المنظف
          role: role,
          student_code: processedStudentCode, // استخدام الكود المنظف والموحد
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
        let errorMessage = error.message;

        // ترجمة رسائل الخطأ الشائعة من Supabase لتحسين تجربة المستخدم
        if (errorMessage.includes('User already registered')) {
            errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
        } else if (errorMessage.includes('Invalid or already used student code')) {
             errorMessage = 'الكود الجامعي غير صحيح أو تم استخدامه بالفعل.';
        } else if (errorMessage.includes('Email not valid') || errorMessage.includes('Invalid email address')) {
            errorMessage = 'تنسيق البريد الإلكتروني غير صحيح. يرجى المحاولة ببريد آخر.';
        } else if (errorMessage.includes('Student code (student_code) is required')) {
             errorMessage = 'الكود الجامعي مطلوب لإكمال التسجيل.';
        }

        toast.error(`فشل التسجيل: ${errorMessage}`); 
    } else if (data.user?.identities?.length === 0) {
      toast.error('هذا المستخدم موجود بالفعل.');
    } else {
      toast.success('تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق منه لإكمال التسجيل.');
      router.push('/login');
    }
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">إنشاء حساب طالب</h2>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="مثال: محمد الأحمد"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">كلمة المرور (6 أحرف على الأقل)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>
           <div className="mb-6">
            <Label htmlFor="studentCode">الكود الجامعي</Label>
            <Input
              id="studentCode"
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
              placeholder="أدخل الكود الخاص بك للتحقق"
            />
          </div>
          <Button type="submit" isLoading={loading}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-accent-light hover:underline">
            سجل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default SignUpPage;