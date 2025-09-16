import { Settings, VectorStoreIndex } from "llamaindex";
import { PGVectorStore } from "@llamaindex/postgres";
import {
  Gemini,
  GEMINI_EMBEDDING_MODEL,
  GEMINI_MODEL,
  GeminiEmbedding,
  GeminiSession,
} from "@llamaindex/google";

Settings.llm = new Gemini({
  model: GEMINI_MODEL.GEMINI_PRO_LATEST,
  apiKey: process.env.GOOGLE_AI_API_KEY ?? "",
});
Settings.embedModel = new GeminiEmbedding({
  model: GEMINI_EMBEDDING_MODEL.TEXT_EMBEDDING_004,
  session: new GeminiSession({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" }),
  embedInfo: {
    dimensions: 768,
  },
});

export const vectorStore = new PGVectorStore({
  dimensions: 768,
  clientConfig: { connectionString: process.env.DATABASE_URL ?? "" },
  embeddingModel: Settings.embedModel,
});
