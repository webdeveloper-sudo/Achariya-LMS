import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

console.log('Testing gemini-flash-latest...\n');

const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
const result = await model.generateContent('Explain astrophysics in 2 sentences for students.');
const response = await result.response;
console.log('✅ Response:', response.text());
console.log('\nLength:', response.text().length, 'characters');
