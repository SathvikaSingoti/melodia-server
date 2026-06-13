require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `Return ONLY a JSON array of strings: ["test1", "test2"]`;
    const result = await model.generateContent(prompt);
    console.log("Success:");
    console.log(result.response.text());
  } catch (err) {
    console.error("Error:");
    console.error(err);
  }
}

test();
