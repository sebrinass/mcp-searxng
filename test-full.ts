#!/usr/bin/env node

import { loadConfig } from './dist/config.js';
import { getEmbedding, cosineSimilarity, rerankResults } from './dist/embedding.js';

interface SearchResult {
  title: string;
  content: string;
  url: string;
  score: number;
}

async function searchSearXNG(query: string): Promise<SearchResult[]> {
  const config = loadConfig();
  const url = new URL('/search', config.searxngUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('pageno', '1');

  const response = await fetch(url.toString());
  const data = await response.json();

  return data.results.map((result: any) => ({
    title: result.title || '',
    content: result.content || '',
    url: result.url || '',
    score: result.score || 0,
  }));
}

async function main() {
  console.log('='.repeat(60));
  console.log('MCP SearXNG + Embedding 完整测试');
  console.log('='.repeat(60));

  const config = loadConfig();
  console.log('\n📋 配置信息:');
  console.log(`   SearXNG: ${config.searxngUrl}`);
  console.log(`   Ollama: ${config.embedding.host}`);
  console.log(`   模型: ${config.embedding.model}`);
  console.log(`   TOP_K: ${config.embedding.topK}`);
  console.log(`   分块大小: ${config.embedding.chunkSize}`);
  console.log(`   分块重叠: ${config.embedding.chunkOverlap}`);
  console.log(`   Embedding: ${config.embedding.enabled ? '✅ 启用' : '❌ 禁用'}`);

  const query = process.argv[2] || 'AI 新闻';
  console.log(`\n🔍 搜索查询: "${query}"`);

  console.log('\n📡 第1步: 调用 SearXNG 搜索...');
  const results = await searchSearXNG(query);
  console.log(`   ✅ 获取到 ${results.length} 条原始结果`);

  if (!config.embedding.enabled || results.length === 0) {
    console.log('\n📊 最终结果 (未启用 embedding):');
    results.slice(0, config.embedding.topK).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title}`);
      console.log(`      URL: ${r.url}`);
    });
    return;
  }

  console.log('\n🧠 第2步: 生成查询 embedding...');
  const queryEmbedding = await getEmbedding(query);
  console.log(`   ✅ 向量维度: ${queryEmbedding.length}`);

  console.log('\n⚖️ 第3步: 计算相似度并排序...');
  const scoredResults = await rerankResults(query, results);
  console.log(`   ✅ 计算完成，共 ${scoredResults.length} 条结果`);

  console.log('\n📊 最终结果 (按相似度排序，保留 URL):');
  console.log('='.repeat(60));

  scoredResults.slice(0, config.embedding.topK).forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.title}`);
    console.log(`   URL: ${r.url}`);
    console.log(`   相似度: ${(r.embeddingScore * 100).toFixed(2)}%`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成！');
  console.log(`📝 总结: 从 ${results.length} 条结果中筛选出 ${scoredResults.slice(0, config.embedding.topK).length} 条最相关的`);
}

main().catch(console.error);
