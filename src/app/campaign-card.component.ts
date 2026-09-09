import { Component, input, output } from '@angular/core';
import { Campaign } from './campaign.service';

@Component({
  selector: 'app-campaign-card', standalone: true,
  template: `
    <button class="campaign-card" (click)="opened.emit(campaign())" [attr.aria-label]="'Open ' + campaign().name">
      @if (campaign().image) { <img class="thumbnail" [src]="'assets/' + campaign().image" alt="" width="346" height="120"> }
      @else { <div class="thumbnail draft-thumbnail">YOUR NEXT BIG IDEA.</div> }
      <div class="campaign-meta"><h2>{{ campaign().name }}</h2><p>Campaign • &#64;{{ campaign().owner }}</p><p class="ad-count">{{ campaign().adSets }} Ad Sets • {{ campaign().ads }} Ads</p></div>
      <dl class="metrics">
        <div><dt>Impressions</dt><dd>{{ compact(campaign().impressions) }}</dd></div>
        <div><dt>Clicks</dt><dd>{{ compact(campaign().clicks) }}</dd></div>
        <div><dt>Votes</dt><dd>{{ compact(campaign().votes) }}</dd></div>
      </dl>
    </button>`,
  styleUrl: './campaign-card.component.css'
})
export class CampaignCardComponent {
  readonly campaign = input.required<Campaign>();
  readonly opened = output<Campaign>();
  compact(value: number): string { return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value); }
}
