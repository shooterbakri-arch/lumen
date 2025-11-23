import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const { session, profile } = useAuth();
  return (
    <div className="text-center py-20 md:py-32">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
        مرحباً بك في <span className="text-accent">لومن</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
        نظام إدارة تعلم حديث وبسيط، مصمم لتسهيل العملية التعليمية للمعلمين والطلاب.
      </p>
      <div className="flex justify-center gap-4">
        {session && profile?.role === 'teacher' ? (
            <Link to="/dashboard">
                <Button>الذهاب إلى لوحة التحكم</Button>
            </Link>
        ) : (
            <Link to="/signup">
                <Button>ابدأ الآن مجاناً</Button>
            </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
