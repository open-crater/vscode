/**
 * Compute is shown in neutral "tokens", never a dollar value — mirroring the
 * `opencrater` CLI (devs trade attention for compute, not money).
 * 1 token = 1000 micro-USD.
 */
export function formatTokens(microUsd: number): string {
  return `${Math.round((microUsd || 0) / 1000).toLocaleString()} tokens`;
}

/** One decimal under 10 tokens so real-time accrual is visible; whole above. */
export function formatTokensFine(microUsd: number): string {
  const t = (microUsd || 0) / 1000;
  if (t > 0 && t < 10) return `${(Math.round(t * 10) / 10).toFixed(1)} tokens`;
  return `${Math.round(t).toLocaleString()} tokens`;
}
