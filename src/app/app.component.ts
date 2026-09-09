import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Campaign, CampaignService } from './campaign.service';
import { CampaignCardComponent } from './campaign-card.component';
import { CampaignTableComponent } from './campaign-table.component';
import { HeaderComponent } from './header.component';

@Component({ selector: 'app-root', standalone: true, imports: [CurrencyPipe, DecimalPipe, FormsModule, CampaignCardComponent, CampaignTableComponent, HeaderComponent], templateUrl: './app.component.html', styleUrl: './app.component.css' })
export class AppComponent {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const dashboard = this.element.nativeElement.querySelector<HTMLElement>('.dashboard')!;
      const header = dashboard.querySelector<HTMLElement>('app-header')!;
      const filters = dashboard.querySelector<HTMLElement>('.filter-bar')!;
      const updateOffsets = () => {
        dashboard.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
        dashboard.style.setProperty('--filters-height', `${filters.getBoundingClientRect().height}px`);
      };
      const observer = new ResizeObserver(updateOffsets);
      observer.observe(header);
      observer.observe(filters);
      updateOffsets();
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
  readonly data = inject(CampaignService);
  readonly query = signal('');
  readonly status = signal('All');
  readonly sort = signal('updated');
  readonly tab = signal('recent');
  readonly view = signal('grid');
  readonly theme = signal(this.savedTheme());
  readonly selected = signal<Campaign | null>(null);
  draftName = '';
  readonly visible = computed(() => {
    const items = this.data.campaigns().filter(item => item.name.toLowerCase().includes(this.query().trim().toLowerCase()) && (this.status() === 'All' || item.status === this.status()) && (this.tab() !== 'recent' || item.viewedAt > 0));
    return items.sort((a, b) => this.sort() === 'name' ? a.name.localeCompare(b.name) : this.sort() === 'impressions' ? b.impressions - a.impressions : this.sort() === 'viewed' ? b.viewedAt - a.viewedAt : b.updatedAt - a.updatedAt);
  });
  setTheme(theme: string): void {
    this.theme.set(theme);
    try { localStorage.setItem('last-billboard.theme', theme); } catch { /* Theme remains available in memory. */ }
  }
  setView(view: 'grid' | 'list'): void {
    this.view.set(view);
    document.getElementById(view === 'list' ? 'campaign-table' : 'campaign-grid')?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start'
    });
  }
  openCampaign(campaign: Campaign, dialog: HTMLDialogElement): void { this.selected.set(campaign); this.data.markViewed(campaign.id); dialog.showModal(); }
  createCampaign(dialog: HTMLDialogElement): void {
    if (!this.draftName.trim()) return;
    this.data.create(this.draftName);
    this.query.set(''); this.status.set('All'); this.tab.set('recent'); this.sort.set('updated');
    this.draftName = ''; dialog.close();
  }
  resetFilters(): void { this.query.set(''); this.status.set('All'); }
  private savedTheme(): string { try { return localStorage.getItem('last-billboard.theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } }
}
