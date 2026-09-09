# Last Billboard

Angular standalone dashboard implemented from Figma node `2:2` in `gelSWjtLWwoYfNoOw50MMp`.

## Development

Use Node.js 24 LTS, then run:

```sh
npm install
npm start
```

Open http://127.0.0.1:4200. Run `npm run build` for the production build in `dist/last-billboard/browser`.

## Data and interactions

`src/app/campaign.service.ts` owns the demo user, campaign records, derived totals and browser persistence. Replace this source with your API when available. Campaigns and new drafts are local demo data, not connected to an advertising platform. Clear the `last-billboard.campaigns` localStorage key to reset the demo.

The dashboard includes name/status filtering, sorting, recently viewed tracking, grid/list views, persistent theme selection, campaign detail dialogs and local draft creation. Native dialogs support keyboard focus management and Escape dismissal.

The dashboard cards and campaign table (Figma node `41:3`) appear together on one scrollable page, with one shared `HeaderComponent` at the top. The grid/list buttons scroll to the respective sections. Both sections share campaign data, filters, sorting, and dialogs. Reuse `app-header` for future pages. The table calculates CTR from service data; legacy demo records without update dates display a dash. On small screens, the table scrolls horizontally within its panel.

With `npm start` running, use `npm test` for browser checks (requires installed Google Chrome). Screenshots are written to `test-results`.

The desktop design uses 24px page padding, 16px grid gaps and 384px-wide cards. At smaller widths, the grid adapts to three fluid columns, two columns and one column; controls wrap and overview tiles become two columns. Mobile layout is inferred from the desktop reference.

Figma image/icon assets and fonts are stored under `public/assets` so the app does not depend on expiring Figma URLs.
