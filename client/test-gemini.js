// Simple Gemini API Test Script
// Run with: node test-gemini.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ VITE_GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('🔑 API Key found:', API_KEY.substring(0, 10) + '...');
console.log('\n📡 Testing Gemini API...\n');

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Test 1: gemini-1.5-flash
        console.log('Test 1: Trying gemini-1.5-flash...');
        try {
            const model1 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result1 = await model1.generateContent('Explain astrophysics in 2 sentences.');
            const response1 = await result1.response;
            const text1 = response1.text();
            console.log('✅ gemini-1.5-flash WORKS!');
            console.log('Response:', text1);
            console.log('Response length:', text1.length, 'characters\n');
        } catch (error) {
            console.log('❌ gemini-1.5-flash FAILED');
            console.log('Error:', error.message);
            console.log('Status:', error.status || 'N/A');
            console.log('');
        }

        // Test 2: gemini-pro
        console.log('Test 2: Trying gemini-pro...');
        try {
            const model2 = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result2 = await model2.generateContent('Explain quantum physics in 2 sentences.');
            const response2 = await result2.response;
            const text2 = response2.text();
            console.log('✅ gemini-pro WORKS!');
            console.log('Response:', text2);
            console.log('Response length:', text2.length, 'characters\n');
        } catch (error) {
            console.log('❌ gemini-pro FAILED');
            console.log('Error:', error.message);
            console.log('Status:', error.status || 'N/A');
            console.log('');
        }

        // Test 3: gemini-1.5-pro
        console.log('Test 3: Trying gemini-1.5-pro...');
        try {
            const model3 = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const result3 = await model3.generateContent('Explain thermodynamics in 2 sentences.');
            const response3 = await result3.response;
            const text3 = response3.text();
            console.log('✅ gemini-1.5-pro WORKS!');
            console.log('Response:', text3);
            console.log('Response length:', text3.length, 'characters\n');
        } catch (error) {
            console.log('❌ gemini-1.5-pro FAILED');
            console.log('Error:', error.message);
            console.log('Status:', error.status || 'N/A');
            console.log('');
        }

        console.log('\n✅ Test complete!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

testGemini();
