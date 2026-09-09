import { Injectable, computed, signal } from '@angular/core';

export interface Campaign {
  id: string;
  name: string;
  owner: string;
  image: string;
  adSets: number;
  ads: number;
  impressions: number;
  clicks: number;
  votes: number;
  spend: number;
  status: 'Active' | 'Paused' | 'Draft';
  updatedAt: number;
  viewedAt: number;
}

// Demo data is isolated here; replace this service's source with the campaign API.
const DEMO_CAMPAIGNS: Campaign[] = [
  { id: 'anime', name: 'STOP WATCHING ANIME', owner: 'grindset_guru', image: 'anime.png', adSets: 3, ads: 7, impressions: 4800000, clicks: 92000, votes: 8200, spend: 2500, status: 'Active', updatedAt: 6, viewedAt: 6 },
  { id: 'cat', name: 'LOST MY CAT. SHE IS DRAMATIC.', owner: 'cat_parent_9', image: 'cat.png', adSets: 2, ads: 5, impressions: 3100000, clicks: 54000, votes: 6400, spend: 1750, status: 'Active', updatedAt: 5, viewedAt: 5 },
  { id: 'ex', name: 'YOUR EX IS STILL LOOKING.', owner: 'petty_vibe', image: 'ex.png', adSets: 4, ads: 9, impressions: 2900000, clicks: 48000, votes: 5100, spend: 1500, status: 'Paused', updatedAt: 4, viewedAt: 4 },
  { id: 'coffee', name: 'BUY COFFEE NOT MEGA CORPS.', owner: 'clout_goblin', image: 'coffee.png', adSets: 3, ads: 6, impressions: 1200000, clicks: 32000, votes: 2400, spend: 1200, status: 'Active', updatedAt: 3, viewedAt: 3 },
  { id: 'rich', name: 'GET RICH IN 3 SECONDS.', owner: 'dropship_lord', image: 'rich.png', adSets: 2, ads: 4, impressions: 890000, clicks: 18000, votes: 1900, spend: 800, status: 'Paused', updatedAt: 2, viewedAt: 2 },
  { id: 'jpegs', name: 'COLLECT STUPID JPEGS NOW.', owner: 'pixel_grails', image: 'jpegs.png', adSets: 4, ads: 11, impressions: 740000, clicks: 14000, votes: 1500, spend: 700, status: 'Draft', updatedAt: 1, viewedAt: 1 }
];

@Injectable({ providedIn: 'root' })
export class CampaignService {
  readonly user = signal({ handle: 'clout_goblin', initials: 'CG' });
  private readonly source = signal<Campaign[]>(this.restore());
  readonly campaigns = this.source.asReadonly();
  readonly statusTotals = computed(() => ({
    live: this.campaigns().filter(campaign => campaign.status === 'Active').length,
    paused: this.campaigns().filter(campaign => campaign.status === 'Paused').length
  }));
  readonly totals = computed(() => this.campaigns().reduce((total, campaign) => ({ campaigns: total.campaigns + 1, adSets: total.adSets + campaign.adSets, ads: total.ads + campaign.ads, spend: total.spend + campaign.spend }), { campaigns: 0, adSets: 0, ads: 0, spend: 0 }));

  create(name: string): void {
    const now = Date.now();
    this.source.update(items => [{ id: crypto.randomUUID(), name: name.trim(), owner: this.user().handle, image: '', adSets: 0, ads: 0, impressions: 0, clicks: 0, votes: 0, spend: 0, status: 'Draft', updatedAt: now, viewedAt: now }, ...items]);
    this.persist();
  }

  markViewed(id: string): void {
    this.source.update(items => items.map(item => item.id === id ? { ...item, viewedAt: Date.now() } : item));
    this.persist();
  }

  private restore(): Campaign[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('last-billboard.campaigns') ?? 'null');
      if (Array.isArray(stored) && stored.every(item => item && ['id', 'name', 'owner', 'image'].every(key => typeof item[key] === 'string') && ['adSets', 'ads', 'impressions', 'clicks', 'votes', 'spend', 'updatedAt', 'viewedAt'].every(key => typeof item[key] === 'number' && Number.isFinite(item[key])) && ['Active', 'Paused', 'Draft'].includes(item.status))) return stored;
    } catch { /* Unavailable storage falls back to the demo dataset. */ }
    return DEMO_CAMPAIGNS;
  }

  private persist(): void {
    try { localStorage.setItem('last-billboard.campaigns', JSON.stringify(this.campaigns())); } catch { /* Keep the app usable when storage is unavailable. */ }
  }
}
