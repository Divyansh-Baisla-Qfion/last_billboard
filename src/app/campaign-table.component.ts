import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe, TitleCasePipe } from '@angular/common';
import { Campaign } from './campaign.service';

@Component({
  selector: 'app-campaign-table',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, PercentPipe, TitleCasePipe],
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.css'
})
export class CampaignTableComponent {
  readonly campaigns = input.required<Campaign[]>();
  readonly opened = output<Campaign>();
  readonly filtersCleared = output<void>();
  private readonly number = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
  compact(value: number): string { return this.number.format(value); }
  updated(timestamp: number): string {
    // The original demo used ordinal sort keys (1–6), not real timestamps.
    if (timestamp < 1000000000000) return '—';
    const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
    if (days === 0) return 'Today';
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  updatedTitle(timestamp: number): string {
    return timestamp < 1000000000000 ? 'Update date unavailable for this demo campaign' : new Date(timestamp).toLocaleString();
  }
}
