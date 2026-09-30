import type { Rpc } from './codex.js';

export type ModelCapabilities = {
  id?: string;
  model?: string;
  displayName?: string;
  isDefault?: boolean;
  defaultReasoningEffort?: string;
  supportedReasoningEfforts?: Array<{ reasoningEffort: string; description: string }>;
  serviceTiers?: Array<{ id: string; name?: string; description?: string }>;
};

export async function currentModelCapabilities(rpc: Rpc, selectedModel?: string) {
  if (!rpc.ready) return null;
  try {
    const catalog = await rpc.request('model/list', { limit: 100, includeHidden: false });
    const models = Array.isArray(catalog?.data) ? (catalog.data as ModelCapabilities[]) : [];
    return (
      models.find((model) => (model.model || model.id) === selectedModel) ||
      (!selectedModel ? models.find((model) => model.isDefault) : undefined) ||
      null
    );
  } catch {
    return null;
  }
}

export function supportsFastMode(model: ModelCapabilities | null | undefined) {
  return !!fastModeServiceTier(model);
}

export function fastModeServiceTier(model: ModelCapabilities | null | undefined) {
  return model?.serviceTiers?.find((tier) => tier.id === 'fast' || tier.id === 'priority')?.id;
}
