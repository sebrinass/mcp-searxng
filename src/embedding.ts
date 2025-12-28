import { Ollama } from 'ollama';
import { loadConfig } from './config.js';
import { getCachedEmbedding, setCachedEmbedding } from './cache.js';

export interface SearchResult {
  title: string;
  content: string;
  url: string;
  score: number;
}

export interface ScoredResult extends SearchResult {
  embeddingScore: number;
}

let ollamaClient: Ollama | null = null;

function getOllamaClient(): Ollama {
  if (!ollamaClient) {
    const config = loadConfig();
    ollamaClient = new Ollama({ host: config.embedding.host });
  }
  return ollamaClient;
}

function chunkText(text: string, chunkSize: number, chunkOverlap: number): string[] {
  if (!text) return [];

  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - chunkOverlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const config = loadConfig();
  if (!config.embedding.enabled) {
    return [];
  }

  if (!text || text.trim() === '') {
    return [];
  }

  const cached = getCachedEmbedding(text);
  if (cached) {
    return cached;
  }

  try {
    const chunks = chunkText(text, config.embedding.chunkSize, config.embedding.chunkOverlap);

    if (chunks.length === 0) {
      return [];
    }

    const response = await getOllamaClient().embed({
      model: config.embedding.model,
      input: chunks,
    });

    if (response.embeddings.length === 0) {
      return [];
    }

    const embedding = response.embeddings[0];
    setCachedEmbedding(text, embedding);
    return embedding;
  } catch (error) {
    console.error('Embedding error:', error);
    return [];
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (magA * magB);
}

export async function rerankResults(
  query: string,
  results: SearchResult[]
): Promise<ScoredResult[]> {
  const config = loadConfig();

  if (!config.embedding.enabled || results.length <= config.embedding.topK) {
    return results.map((r) => ({ ...r, embeddingScore: r.score }));
  }

  const queryEmbedding = await getEmbedding(query);
  if (queryEmbedding.length === 0) {
    return results.map((r) => ({ ...r, embeddingScore: r.score }));
  }

  const scoredResults = await Promise.all(
    results.map(async (result) => {
      const text = `${result.title} ${result.content}`;
      const resultEmbedding = await getEmbedding(text);
      const embeddingScore = cosineSimilarity(queryEmbedding, resultEmbedding);

      return {
        ...result,
        embeddingScore,
      };
    })
  );

  return scoredResults
    .sort((a, b) => b.embeddingScore - a.embeddingScore)
    .slice(0, config.embedding.topK);
}
