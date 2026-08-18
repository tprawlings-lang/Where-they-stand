export interface DiscoveryTarget { externalId: string; canonicalUrl: string; }
export interface RawSource { url: string; retrievedAt: string; body: string; }
export interface NormalizedSource { url: string; retrievedAt: string; title: string | null; text: string; contentHash: string; }
export interface CollectorHealth { ok: boolean; detail?: string; }
export interface CollectorAdapter {
  readonly provider: "fec"|"congress"|"google-civic"|"web"|"x"|"meta"|"youtube"|"bluesky";
  discover(query: string): Promise<DiscoveryTarget[]>;
  fetch(target: DiscoveryTarget): Promise<RawSource>;
  normalize(source: RawSource): Promise<NormalizedSource>;
  health_check(): Promise<CollectorHealth>;
}
export class PlaceholderCollector implements CollectorAdapter {
  constructor(public readonly provider: CollectorAdapter["provider"]) {}
  async discover(): Promise<DiscoveryTarget[]> { return []; }
  async fetch(): Promise<RawSource> { throw new Error(`${this.provider} collection is not implemented`); }
  async normalize(source: RawSource): Promise<NormalizedSource> { return { url:source.url,retrievedAt:source.retrievedAt,title:null,text:source.body,contentHash:"uncomputed" }; }
  async health_check(): Promise<CollectorHealth> { return {ok:true,detail:"adapter scaffold only"}; }
}
