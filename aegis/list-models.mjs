import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

try {
  console.log('Fetching available models...\n');
  
  // Try a few common model names directly
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest'
  ];
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('test');
      console.log(`✅ ${modelName} - WORKS`);
    } catch (err) {
      if (err.message.includes('429')) {
        console.log(`⚠️  ${modelName} - QUOTA EXCEEDED (model exists)`);
      } else if (err.message.includes('404')) {
        console.log(`❌ ${modelName} - NOT FOUND`);
      } else {
        console.log(`❓ ${modelName} - ${err.message.substring(0, 50)}`);
      }
    }
  }
} catch (error) {
  console.error('Error:', error.message);
}
