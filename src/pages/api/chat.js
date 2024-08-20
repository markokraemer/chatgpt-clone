import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export default async function handler(req) {
  try {
    const { messages, model } = await req.json();

    const response = await openai.createChatCompletion({
      model: model || 'gpt-3.5-turbo',
      stream: true,
      messages,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing your request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}