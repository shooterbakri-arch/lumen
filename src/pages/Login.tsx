import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Card from '../components/ui/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'بيانات الدخول غير صحيحة' : error.message);
    } else {
      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center pt-16">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h2>
        <form onSubmit={handleLogin}>
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
          <div className="mb-6">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" isLoading={loading}>
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          ليس لديك حساب؟{' '}
          <Link to="/signup" className="text-accent-light hover:underline">
            أنشئ حساباً جديداً
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
