'use client';
import { useState, FormEvent } from 'react';
import { Send } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatProps {
  fileUrl: string; // الرابط الموقَّع الكامل للملف في Supabase Storage
}

// 🛑 تم إزالة دالة extractInternalPath

const Chat = ({ fileUrl }: ChatProps) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // --- 🔑 بيانات الربط مع FastAPI ---
    const studentId = profile?.id || "anonymous_student_id"; 
    const projectId = "P007"; 
    const BACKEND_URL = 'http://127.0.0.1:8000/ask_question/'; 
    // ----------------------------------------
    
    // 🎯 المسار المرسل هو الرابط الكامل نفسه (fileUrl)
    const signedUrlToSend = fileUrl;
    
    if (!signedUrlToSend) {
        const errorMessage: Message = { sender: 'ai', text: 'عذراً، لم يتم توفير رابط المادة للتحليل.' };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
    }

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                student_id: studentId,
                project_id: projectId,
                question: input,
                file_path: signedUrlToSend, // 👈 إرسال الرابط الموقَّع الكامل
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `فشل في الاتصال بالخادم. رمز الحالة: ${response.status}`);
        }

        const data = await response.json();
        
        const aiMessage: Message = { sender: 'ai', text: data.answer }; 
        setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
        console.error("خطأ في الاتصال بالخلفية:", error);
        const errorMessage: Message = { sender: 'ai', text: `عذراً، حدث خطأ: ${error.message || 'فشل الاتصال بالنظام.'}` };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
        <h2 className="text-xl font-semibold mb-4">اسأل المساعد الذكي عن هذه المادة</h2>
        <div className="h-[50vh] overflow-y-auto p-4 bg-gray-900 rounded-md mb-4 space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-gray-700'}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            ))}
             {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-lg bg-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                </div>
            )}
            {messages.length === 0 && !isLoading && (
                 <div className="text-center text-gray-500 pt-16">
                    <p>يمكنك طرح أي سؤال حول محتوى هذه المادة.</p>
                    <p>مثال: "لخص لي الفصل الأول."</p>
                </div>
            )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                disabled={isLoading}
            />
            <Button type="submit" isLoading={isLoading} className="w-auto">
                <Send size={20} />
            </Button>
        </form>
    </Card>
  );
};

export default Chat;