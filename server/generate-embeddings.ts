import { db } from "./db";
import { knowledgeArticles } from "@shared/schema";
import { generateEmbedding } from "./openai";
import { eq } from "drizzle-orm";

async function generateEmbeddings() {
  console.log("Generating embeddings for knowledge articles...");

  const articles = await db.select().from(knowledgeArticles);
  console.log(`Found ${articles.length} articles`);

  for (const article of articles) {
    try {
      console.log(`\nProcessing: ${article.title}`);

      // Combine title, excerpt, and a portion of content for embedding
      const textForEmbedding = `${article.title}\n\n${article.excerpt}\n\n${article.content.substring(0, 2000)}`;

      console.log(`  Generating embedding...`);
      const embedding = await generateEmbedding(textForEmbedding);

      console.log(`  Embedding generated (${embedding.length} dimensions)`);
      console.log(`  Updating database...`);

      await db
        .update(knowledgeArticles)
        .set({ embedding })
        .where(eq(knowledgeArticles.id, article.id));

      console.log(`  ✓ Complete`);
    } catch (error) {
      console.error(`  ✗ Error processing article "${article.title}":`, error);
    }
  }

  console.log("\n✓ All embeddings generated!");
}

generateEmbeddings()
  .catch((error) => {
    console.error("Error generating embeddings:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
