import {genkit} from 'genkit';
import {googleAI, textEmbedding004} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // 2.0 Flash 모델로 확실히 설정
  model: 'googleai/gemini-2.0-flash',
});

export const embeddingModel = textEmbedding004;
