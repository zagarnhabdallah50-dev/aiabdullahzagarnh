export default async function handler(req, res) {
  // إعدادات CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // التعامل مع طلب OPTIONS (الفحص المبدئي)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // التأكد من أن الطلب هو POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // استخراج الرسائل من الطلب
    const body = JSON.parse(req.body);
    const { messages } = body;
    
    // استدعاء API الخاص بـ Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    // إذا كان الرد خطأ
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      throw new Error(errorData.error?.message || 'API request failed');
    }

    // جلب البيانات من Groq
    const data = await response.json();
    
    // إرسال الرد
    res.status(200).json({
      reply: data.choices[0]?.message?.content,
      choices: data.choices
    });
    
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى'
    });
  }
}
