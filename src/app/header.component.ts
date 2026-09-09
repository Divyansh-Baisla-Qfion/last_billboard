import { Component, input, output } from '@angular/core';

/** Shared application header. Keep page-specific content outside this component. */
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  host: { '[class.light]': "theme() === 'light'" }
})
export class HeaderComponent {
  readonly user = input.required<{ handle: string; initials: string }>();
  readonly theme = input.required<string>();
  readonly themeChanged = output<string>();
  readonly settingsOpened = output<void>();
}
