// Disabled until a provider is selected. Never inject remote HTML from ad configuration.
export const adConfig = Object.freeze({
  enabled: false,
  placements: ["header", "content", "sidebar", "footer"],
});
export function adSlot(placement) {
  if (!adConfig.enabled || !adConfig.placements.includes(placement)) return "";
  return `<aside class="ad-slot" data-ad-placement="${placement}" aria-label="Advertisement"><small>Advertisement</small></aside>`;
}
