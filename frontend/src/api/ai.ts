import { api } from "../lib/api";
import type { GeneratedTextResponse } from "../lib/types";

export function generateDescription(title: string, keywords?: string): Promise<GeneratedTextResponse> {
  return api.post<GeneratedTextResponse>("/ai/generate-description", { title, keywords });
}
