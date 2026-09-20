// ISAI MEMORY ENGINE

const STORAGE_KEY = "isai_memory_v1";

export class MemoryEngine {
  constructor() {
    this.memories = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.memories)
    );
  }

  add({
    text,
    category = "general",
    importance = 0.5,
    source = "conversation",
    tags = []
  }) {
    if (!text || !text.trim()) return null;

    const memory = {
      id: crypto.randomUUID(),
      text: text.trim(),
      category,
      importance: Math.max(0, Math.min(1, importance)),
      source,
      tags,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      useCount: 0
    };

    this.memories.push(memory);
    this.save();

    return memory;
  }

  search(query, limit = 5) {
    if (!query) return [];

    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return this.memories
      .map(memory => {
        const text = memory.text.toLowerCase();

        const matches = words.filter(word =>
          text.includes(word)
        ).length;

        return {
          memory,
          score: matches * 0.7 + memory.importance * 0.3
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        item.memory.lastUsedAt = new Date().toISOString();
        item.memory.useCount++;
        return item.memory;
      });
  }

  getImportant(limit = 10) {
    return [...this.memories]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  getRecent(limit = 10) {
    return [...this.memories]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, limit);
  }

  remove(id) {
    this.memories = this.memories.filter(
      memory => memory.id !== id
    );

    this.save();
  }

  clear() {
    this.memories = [];
    this.save();
  }

  count() {
    return this.memories.length;
  }
}

export const memory = new MemoryEngine();
