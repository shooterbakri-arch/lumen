import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Card from '../components/ui/Card';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (data.user?.identities?.length === 0) {
      toast.error('هذا المستخدم موجود بالفعل.');
    } else {
      toast.success('تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق منه لإكمال التسجيل.');
      navigate('/login');
    }
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">إنشاء حساب جديد</h2>
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
            <Label htmlFor="password">كلمة المرور</Label>
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
            <Label htmlFor="role">أنا</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-light"
            >
              <option value="student">طالب</option>
              <option value="teacher">معلم</option>
            </select>
          </div>
          <Button type="submit" isLoading={loading}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-accent-light hover:underline">
            سجل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default SignUp;
