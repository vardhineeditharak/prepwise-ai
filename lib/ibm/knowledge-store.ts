import { createClient } from "@/lib/supabase/server";

interface KnowledgeItem {
  content: string;
  category: string;
  metadata?: Record<string, any>;
}

export async function storeKnowledge(items: KnowledgeItem[]): Promise<void> {
  const supabase = await createClient();

  const rows = items.map((item) => ({
    content: item.content,
    category: item.category,
    metadata: item.metadata || {},
  }));

  const { error } = await supabase.from("knowledge_embeddings").insert(rows);
  if (error) console.error("Failed to store knowledge:", error);
}

export async function searchSimilar(
  query: string,
  options: { limit?: number; category?: string } = {}
): Promise<{ content: string; category: string; metadata: any; similarity: number }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_knowledge", {
    search_query: query,
    match_count: options.limit || 5,
  });

  if (error) {
    console.error("Full-text search failed:", error);
    return [];
  }

  type SearchResult = { content: string; category: string; metadata: any; similarity: number };
  let results: SearchResult[] = (data || []).map((r: any) => ({
    content: r.content,
    category: r.category,
    metadata: r.metadata,
    similarity: r.rank,
  }));

  if (options.category) {
    results = results.filter((r: SearchResult) => r.category === options.category);
  }

  return results;
}
