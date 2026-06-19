import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "..", "data");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

const DEFAULT_CONFIG = {
  api_keys: {
    groq: process.env.GROQ_API_KEY || "",
  },
  settings: {
    default_provider: "groq",
    default_model: "llama-3.3-70b-versatile",
  },
};

async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

async function writeConfig(config: any) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await readConfig();
  return NextResponse.json({ config });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const currentConfig = await readConfig();
    const newConfig = { ...currentConfig, ...body };
    await writeConfig(newConfig);

    // Also update env for current process
    if (body.api_keys?.groq) {
      process.env.GROQ_API_KEY = body.api_keys.groq;
    }

    return NextResponse.json({ success: true, config: newConfig });
  } catch (error) {
    console.error("Save config error:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
