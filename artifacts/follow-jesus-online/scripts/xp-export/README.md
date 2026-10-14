# Follow XP — main-content transfer package

## Included pages

| Type | Original route | Main heading |
| --- | --- | --- |
| `received` | `/xp/received` | He heard you. You are His. |
| `rededicated` | `/xp/rededicated` | Welcome back. He never left. |
| `believer` | `/xp/believer` | You already belong to Him. |
| `did-not-pray` | `/xp/did-not-pray` | You do not have to decide today. |

This package includes only each page’s main content: title, introduction, guide
card where present, question/next-step cards, and the contact invitation.
It does **not** contain the site header, logo, menus, navigation, footer,
resume-reading banner, analytics, authentication, or backend.
The page title/introduction remains: it is content, not the site header.

## Files

- `react/XPContent.tsx`: reusable React + TypeScript component.
- `react/xp-content.css`: scoped styles; no Tailwind, icon library or router needed.
- `content/xp-content.json`: all four pages’ structured text and resource paths.
- `content/*.md`: readable text copies, one per page.
- `assets/guide-cover.png`: original guide cover used by the three guide cards.
- `previews/*.html`: ready-to-open main-content previews, one per page.
- `TRANSFER-PROMPT.md`: instructions to give the Agent in the destination project.
- `manifest.json`: source route, export date, integrity hashes and scope.

## Add to another React / Vite project

Copy `react`, `content` and `assets` together into a folder such as
`src/features/follow-xp`. Keep their relative folder structure.
React is the only runtime dependency. The destination TypeScript configuration
must support JSON imports (`resolveJsonModule: true`) and its normal React JSX
setting. Vite projects should include their usual `vite/client` types.

```tsx
import { XPContent } from "./features/follow-xp/react/XPContent";
import guideCoverUrl from "./features/follow-xp/assets/guide-cover.png";

export function ReceivedPage() {
  return (
    <XPContent
      type="received"
      resourceBaseUrl=""
      guideCoverSrc={guideCoverUrl}
      messageHref="/message"
    />
  );
}
```

Render the other three types the same way, using the receiving project’s router.
Keep its existing shell; the component does not add any site navigation or footer.
It uses a `div` root so you may place it inside the host’s existing `main`.

### Important: configure linked destinations

**The linked articles, guide, video and contact backend are not included.**
This is a four-page main-content package, not a copy of the full Follow app.

- `resourceBaseUrl=""`: guide, video and question links stay on the destination
  project. Use this only when it has the corresponding routes/content.
- To keep those links on the existing Follow site, set `resourceBaseUrl` to its
  verified public origin, without a trailing slash.
- `messageHref` may point to the destination project’s contact page, an external
  contact URL, or a `mailto:` address. If omitted, it uses the resource base plus
  `/message`. Do not imply messages are delivered without a working destination.
- Question links retain the original `journey`, `entry`, `from` and `step` query
  values. `entry` defaults to `"direct"`; pass the host’s inbound value if needed.
- Share uses the native share sheet, clipboard, or a visible copyable URL. Supply
  `shareUrl` when you need a canonical URL instead of the browser’s current URL.
  Clipboard/native share depend on browser support and a secure origin.

## Styling and typography

All styles are scoped under `.follow-xp`. Card colors, spacing, responsive columns,
and source artwork follow the original XP pages. No styles target the host’s
`body`, header, navigation or footer. Entrance animations are omitted to avoid
dependencies and content flashing during transfer.

The component inherits the host’s page background. The source uses a light warm
page (`#FFFDFB`) and cream cards (`#FFFAF6`). Fonts prefer **Source Sans 3** and
**Playfair Display**, with Arial/Georgia fallbacks. Load those fonts in the host
if you want the same typography; this package makes no remote font requests.

## Preview without React

Open any `previews/*.html` after unzipping. Images and CSS load from adjacent
folders. These are content previews, not a backend or a complete website.
Each preview has `RESOURCE_BASE_URL` and `MESSAGE_HREF` settings near the bottom
for configuring links. Their defaults are same-project routes, not claims that
the linked destinations have been copied.

## Editing

Edit text in `content/xp-content.json`; React reads it directly. The Markdown and
HTML files are snapshots and do not update themselves after hand edits.
`did-not-pray` intentionally has no guide card or listen/share controls, matching
the source. All original copy, question labels and link paths are preserved.
