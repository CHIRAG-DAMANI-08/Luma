import { ChromaClient } from 'chromadb';
import { pipeline } from '@xenova/transformers';

// We create a global instance of ChromaClient that can be reused across all serverless function invocations.
const chromaClient = new ChromaClient({
  url: process.env.CHROMA_SERVER_HOST || 'http://localhost:8000'
});
let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

/**
 * Generates a text embedding from a given text string.
 * @param {string} text The text to embed.
 * @returns {Promise<number[]>} The embedding as an array of numbers.
 */
export async function getEmbedding(text) {
  try {
    const embeddingPipeline = await getEmbedder();
    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding:", error);
    return []; 
  }
}

/**
 * Retrieves or creates a ChromaDB collection for a given user.
 * @param {string} userId The unique ID of the user.
 * @returns {Promise<Collection>} The ChromaDB collection object.
 */
export async function getOrCreateCollection(userId) {
  const collectionName = `user-${userId}-history`;
  return chromaClient.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: {
      generate: async (texts) => {
        const embeddings = await Promise.all(texts.map(text => getEmbedding(text)));
        return embeddings;
      }
    }
  });
}
