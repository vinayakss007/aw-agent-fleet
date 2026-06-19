// Simple JSON-file-backed database for MVP
// Migrate to SQLite/PostgreSQL when scaling

import { promises as fs } from "fs";
import path from "path";

// Use /tmp/data on all environments for persistence in serverless
const DATA_DIR = process.env.DATA_DIR || "/tmp/data";

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

async function readCollection<T>(collection: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath(collection), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeCollection<T>(collection: string, data: T[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(filePath(collection), JSON.stringify(data, null, 2), "utf-8");
}

// Generic CRUD
export async function getAll<T>(collection: string): Promise<T[]> {
  return readCollection<T>(collection);
}

export async function getById<T extends { id: string }>(collection: string, id: string): Promise<T | null> {
  const items = await readCollection<T>(collection);
  return items.find((item) => item.id === id) || null;
}

export async function findWhere<T>(collection: string, predicate: (item: T) => boolean): Promise<T[]> {
  const items = await readCollection<T>(collection);
  return items.filter(predicate);
}

export async function create<T extends { id: string }>(collection: string, item: T): Promise<T> {
  const items = await readCollection<T>(collection);
  items.push(item);
  await writeCollection(collection, items);
  return item;
}

export async function update<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): Promise<T | null> {
  const items = await readCollection<T>(collection);
  const index = items.findIndex((item: any) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates } as T;
  await writeCollection(collection, items);
  return items[index];
}

export async function remove<T extends { id: string }>(collection: string, id: string): Promise<boolean> {
  const items = await readCollection<T>(collection);
  const filtered = items.filter((item: any) => item.id !== id);
  if (filtered.length === items.length) return false;
  await writeCollection(collection, filtered);
  return true;
}

export async function count(collection: string): Promise<number> {
  const items = await readCollection(collection);
  return items.length;
}

export const db = {
  getAll,
  getById,
  findWhere,
  create,
  update,
  remove,
  count,
};
