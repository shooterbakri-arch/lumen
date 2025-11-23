import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { question, fileUrl } = await req.json();

    if (!question || !fileUrl) {
      return NextResponse.json({ error: 'Question and fileUrl are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Gemini API key is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // As per the prompt, we are sending the URL as text context.
    // NOTE: For better results, especially with private files, Gemini's File API would be a more robust solution.
    // This implementation follows the user's specific request.
    const prompt = `
      أنت مساعد ذكي متخصص في الإجابة على أسئلة الطلاب بناءً على المواد الدراسية المقدمة.
      استخدم فقط المعلومات الموجودة في المادة المرفقة للإجابة على السؤال. لا تستخدم أي معلومات خارجية.
      
      ملف المادة: ${fileUrl}
      سؤال الطالب: "${question}"

      قم بالإجابة على سؤال الطالب باللغة العربية بشكل واضح ومفصل.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error('Error in Gemini API call:', error);
    return NextResponse.json({ error: 'Failed to get response from Gemini API' }, { status: 500 });
  }
}
