// Check what models are available with your Gemini API key
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ VITE_GEMINI_API_KEY not found');
    process.exit(1);
}

console.log('🔍 Checking available Gemini models...\n');

async function listAvailableModels() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Try to list models
        console.log('Fetching model list from Google...\n');

        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY
        );

        if (!response.ok) {
            console.error('❌ Failed to fetch models');
            console.error('Status:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }

        const data = await response.json();

        if (data.models && data.models.length > 0) {
            console.log('✅ Available models with your API key:\n');
            data.models.forEach((model, index) => {
                console.log(`${index + 1}. ${model.name}`);
                console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                console.log(`   Description: ${model.description || 'N/A'}`);
                console.log(`   Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
            });

            // Try the first available model
            const firstModel = data.models[0];
            if (firstModel.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`\n🧪 Testing first available model: ${firstModel.name}...\n`);

                const modelName = firstModel.name.replace('models/', '');
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say "Hello from Gemini!" in 5 words');
                const response = await result.response;
                const text = response.text();

                console.log('✅ SUCCESS! Model works!');
                console.log('Response:', text);
                console.log('\n🎉 Your Gemini API is working! Use model:', modelName);
            }
        } else {
            console.log('⚠️ No models available with your API key');
            console.log('This might mean:');
            console.log('1. API not enabled in Google Cloud Console');
            console.log('2. Wrong API key type (need Google AI Studio key, not Vertex AI)');
            console.log('3. Regional restrictions');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nPossible issues:');
        console.error('1. Check if you\'re using Google AI Studio API key: https://makersuite.google.com/app/apikey');
        console.error('2. Not Vertex AI / Google Cloud API key');
        console.error('3. API might not be enabled in your project');
    }
}

listAvailableModels();
