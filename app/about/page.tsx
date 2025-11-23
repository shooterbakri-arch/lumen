import Card from '@/components/ui/Card';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-8">حول <span className="text-accent">Dulite Dev</span></h1>
      <Card className="text-lg text-gray-300 leading-relaxed">
        <p className="mb-4">
          <strong className="text-white">Dulite Dev</strong> هو منصة تعليمية مبتكرة تم تصميمها لردم الفجوة بين المعلمين والطلاب باستخدام أحدث تقنيات الذكاء الاصطناعي. هدفنا هو توفير بيئة تعليمية تفاعلية وذكية تجعل الوصول إلى المعرفة أسهل وأسرع من أي وقت مضى.
        </p>
        <p className="mb-4">
          بالنسبة <strong className="text-white">للمعلمين</strong>، توفر المنصة أدوات سهلة لرفع المواد الدراسية مثل ملفات PDF و Word، مما يسمح لهم بمشاركة المحتوى التعليمي مع طلابهم بكل يسر.
        </p>
        <p className="mb-4">
          أما بالنسبة <strong className="text-white">للطلاب</strong>، فيمكنهم استعراض المواد المتاحة وطرح الأسئلة مباشرة حول محتوى هذه المواد. يقوم مساعدنا الذكي، المبني على نموذج Google Gemini 1.5 Pro، بتحليل الملفات وتقديم إجابات دقيقة ومفصلة من داخل المادة نفسها، مما يوفر وقتاً وجهداً كبيراً في البحث عن المعلومات.
        </p>
        <p>
          نحن نؤمن بأن التكنولوجيا يمكن أن تحدث ثورة في التعليم، ونسعى في <strong className="text-white">Dulite Dev</strong> لنكون جزءاً من هذه الثورة.
        </p>
      </Card>
    </div>
  );
};

export default AboutPage;
