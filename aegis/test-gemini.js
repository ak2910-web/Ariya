const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name} (supports: ${model.supportedGenerationMethods?.join(', ')})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
