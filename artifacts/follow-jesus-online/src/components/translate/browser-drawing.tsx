import React from "react"

export type BrowserDrawingVariant =
  | "chrome-menu"
  | "chrome-address"
  | "android"
  | "safari"
  | "google-translate"

const C = {
  frame: "#FFFAF6",
  stroke: "#5B9BC4",
  bar: "#FFEBDB",
  text: "#003A66",
  soft: "#8FA9BF",
  line: "#E3ECF3",
  hiFill: "#DCF0FF",
  hiStroke: "#0095FF",
  marker: "#C45100",
  white: "#FFFFFF",
  gBlue: "#1A73E8",
}

const LABELS: Record<BrowserDrawingVariant, string> = {
  "chrome-menu":
    "Drawing of Chrome: right-click the page (1), then choose Translate in the menu (2).",
  "chrome-address":
    "Drawing of Chrome: click the Google Translate icon at the right of the address bar (3) and choose another language such as Español.",
  android:
    "Drawing of Chrome on an Android phone: tap the three-dot menu at the top right (1), then tap Translate (2).",
  safari:
    "Drawing of Safari on an iPhone: tap the aA button in the address bar (1), then tap Translate to your language (2).",
  "google-translate":
    "Drawing of the Google Translate website: open translate.google.com (1), choose the Websites tab (2), paste the site address and click the round arrow button (3).",
}

const VIEWBOX: Record<BrowserDrawingVariant, string> = {
  "chrome-menu": "0 0 320 220",
  "chrome-address": "0 0 320 220",
  android: "0 0 200 360",
  safari: "0 0 200 360",
  "google-translate": "0 0 320 230",
}

function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill={C.marker} stroke={C.white} strokeWidth={2} />
      <text x={x} y={y + 3.6} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.white}>
        {n}
      </text>
    </g>
  )
}

function Lines({ x, y, w, count, gap = 12 }: { x: number; y: number; w: number; count: number; gap?: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <rect key={i} x={x} y={y + i * gap} width={i % 3 === 2 ? w * 0.6 : w} height={5} rx={2.5} fill={C.line} />
      ))}
    </g>
  )
}

function Window({ url }: { url: string }) {
  return (
    <g>
      <rect x={1} y={1} width={318} height={218} rx={10} fill={C.frame} stroke={C.stroke} strokeWidth={1.5} />
      <path d="M1 11a10 10 0 0 1 10-10h298a10 10 0 0 1 10 10v17H1z" fill={C.bar} />
      <circle cx={14} cy={14} r={3.5} fill="#E87722" />
      <circle cx={26} cy={14} r={3.5} fill="#FFC999" />
      <circle cx={38} cy={14} r={3.5} fill="#99D6FF" />
      <rect x={12} y={33} width={296} height={18} rx={9} fill={C.white} stroke={C.line} />
      <text x={24} y={45.5} fontSize={9} fill={C.text}>{url}</text>
    </g>
  )
}

function MenuItem({ x, y, w, label, hi, h = 18, fs = 9.5, icon }: { x: number; y: number; w: number; label: string; hi?: boolean; h?: number; fs?: number; icon?: boolean }) {
  return (
    <g>
      {hi && <rect x={x + 2} y={y + 1} width={w - 4} height={h - 2} rx={4} fill={C.hiFill} stroke={C.hiStroke} strokeWidth={1.5} />}
      {icon && (
        <g>
          <circle cx={x + 13} cy={y + h / 2} r={5.5} fill={C.gBlue} />
          <text x={x + 13} y={y + h / 2 + 3} textAnchor="middle" fontSize={7.5} fontWeight={700} fill={C.white}>G</text>
        </g>
      )}
      <text x={x + (icon ? 24 : 10)} y={y + h / 2 + 3.4} fontSize={fs} fontWeight={hi ? 700 : 400} fill={C.text}>{label}</text>
    </g>
  )
}

function ChromeMenu() {
  const items = ["Back", "Forward", "Reload", "Save as…"]
  const mx = 70, my = 92, mw = 150
  return (
    <g>
      <Window url="follow.jesusonline.com" />
      <Lines x={20} y={64} w={280} count={2} />
      <Lines x={20} y={176} w={280} count={3} />
      <rect x={mx} y={my} width={mw} height={124} rx={6} fill={C.white} stroke={C.stroke} />
      {items.map((t, i) => <MenuItem key={t} x={mx} y={my + 4 + i * 18} w={mw} label={t} />)}
      <line x1={mx + 6} x2={mx + mw - 6} y1={my + 78} y2={my + 78} stroke={C.line} />
      <MenuItem x={mx} y={my + 81} w={mw} label="Translate to …" hi icon />
      <MenuItem x={mx} y={my + 100} w={mw} label="Inspect" />
      {/* cursor */}
      <path d="M58 82 L58 100 L62.5 96 L66 103 L69 101.6 L65.6 94.8 L71 94.4 Z" fill={C.white} stroke={C.text} strokeWidth={1.3} strokeLinejoin="round" />
      <Marker x={44} y={88} n={1} />
      <Marker x={236} y={my + 90} n={2} />
    </g>
  )
}

function ChromeAddress() {
  return (
    <g>
      <Window url="follow.jesusonline.com" />
      <rect x={276} y={35} width={18} height={14} rx={4} fill={C.hiFill} stroke={C.hiStroke} strokeWidth={1.5} />
      <text x={285} y={45.5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={C.gBlue}>G</text>
      <Lines x={20} y={66} w={110} count={10} />
      <rect x={146} y={60} width={160} height={112} rx={8} fill={C.white} stroke={C.stroke} />
      <circle cx={161} cy={76} r={6} fill={C.gBlue} />
      <text x={161} y={79} textAnchor="middle" fontSize={8} fontWeight={700} fill={C.white}>G</text>
      <text x={172} y={79.5} fontSize={10} fontWeight={700} fill={C.text}>Google Translate</text>
      <text x={158} y={103} fontSize={10} fill={C.text}>English</text>
      <rect x={210} y={90} width={66} height={20} rx={4} fill={C.hiFill} stroke={C.hiStroke} strokeWidth={1.5} />
      <text x={243} y={103.5} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.text}>Español</text>
      <line x1={156} x2={296} y1={120} y2={120} stroke={C.line} />
      <text x={158} y={136} fontSize={8.5} fill={C.soft}>Français · Português ·</text>
      <text x={158} y={150} fontSize={8.5} fill={C.soft}>中文 · العربية · हिन्दी …</text>
      <Marker x={285} y={15} n={3} />
    </g>
  )
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <rect x={20} y={4} width={160} height={352} rx={24} fill={C.text} />
      <rect x={27} y={11} width={146} height={338} rx={18} fill={C.frame} />
      <rect x={80} y={16} width={40} height={6} rx={3} fill={C.text} />
      {children}
    </g>
  )
}

function Android() {
  const items = ["New tab", "History", "Downloads", "Bookmarks", "Share…", "Find in page", "Translate…", "Settings"]
  const mx = 74, my = 70, mw = 96
  return (
    <Phone>
      <rect x={32} y={34} width={136} height={24} rx={12} fill={C.white} stroke={C.line} />
      <text x={42} y={49.5} fontSize={8.5} fill={C.text}>jesusonline.com</text>
      <rect x={151} y={36} width={16} height={20} rx={4} fill={C.hiFill} stroke={C.hiStroke} strokeWidth={1.5} />
      {[41, 46, 51].map((cy) => <circle key={cy} cx={159} cy={cy} r={1.6} fill={C.text} />)}
      <Lines x={38} y={74} w={124} count={20} gap={13} />
      <rect x={mx} y={my} width={mw} height={items.length * 20 + 8} rx={6} fill={C.white} stroke={C.stroke} />
      {items.map((t, i) => (
        <MenuItem key={t} x={mx} y={my + 4 + i * 20} w={mw} h={20} fs={9} label={t} hi={t === "Translate…"} />
      ))}
      <Marker x={140} y={24} n={1} />
      <Marker x={58} y={my + 4 + 6 * 20 + 10} n={2} />
    </Phone>
  )
}

function Safari() {
  const mx = 34, my = 180, mw = 118
  const rows = ["Translate to …", "Show Reader", "Hide Toolbar", "Website Settings"]
  return (
    <Phone>
      <Lines x={38} y={34} w={124} count={11} gap={13} />
      <rect x={mx} y={my} width={mw} height={110} rx={8} fill={C.white} stroke={C.stroke} />
      <text x={mx + 12} y={my + 15} fontSize={8} fill={C.text}>A</text>
      <text x={mx + mw / 2} y={my + 15} textAnchor="middle" fontSize={9} fontWeight={700} fill={C.text}>100%</text>
      <text x={mx + mw - 14} y={my + 16} fontSize={12} fill={C.text}>A</text>
      <line x1={mx + 6} x2={mx + mw - 6} y1={my + 22} y2={my + 22} stroke={C.line} />
      {rows.map((t, i) => (
        <MenuItem key={t} x={mx} y={my + 23 + i * 21} w={mw} h={21} fs={9} label={t} hi={i === 0} />
      ))}
      <rect x={32} y={300} width={136} height={26} rx={13} fill={C.white} stroke={C.line} />
      <rect x={36} y={303} width={26} height={20} rx={6} fill={C.hiFill} stroke={C.hiStroke} strokeWidth={1.5} />
      <text x={49} y={317} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.text}>aA</text>
      <text x={116} y={317} textAnchor="middle" fontSize={8.5} fill={C.text}>jesusonline.com</text>
      <Marker x={49} y={337} n={1} />
      <Marker x={164} y={my + 33} n={2} />
    </Phone>
  )
}

function GoogleTranslate() {
  const tabs = [
    { t: "Text", x: 20, w: 40 },
    { t: "Images", x: 66, w: 52 },
    { t: "Documents", x: 124, w: 72 },
    { t: "Websites", x: 202, w: 64 },
  ]
  return (
    <g>
      <rect x={1} y={1} width={318} height={228} rx={10} fill={C.frame} stroke={C.stroke} strokeWidth={1.5} />
      <path d="M1 11a10 10 0 0 1 10-10h298a10 10 0 0 1 10 10v17H1z" fill={C.bar} />
      <rect x={12} y={33} width={296} height={18} rx={9} fill={C.white} stroke={C.line} />
      <text x={24} y={45.5} fontSize={9} fill={C.text}>translate.google.com</text>
      <Marker x={130} y={42} n={1} />
      {tabs.map(({ t, x, w }) => (
        <g key={t}>
          <rect x={x} y={62} width={w} height={20} rx={10} fill={t === "Websites" ? C.hiFill : C.white} stroke={t === "Websites" ? C.hiStroke : C.line} strokeWidth={t === "Websites" ? 1.5 : 1} />
          <text x={x + w / 2} y={75.5} textAnchor="middle" fontSize={9} fontWeight={t === "Websites" ? 700 : 400} fill={C.text}>{t}</text>
        </g>
      ))}
      <Marker x={282} y={72} n={2} />
      <text x={160} y={106} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={C.text}>English  ⇄  Español</text>
      <rect x={20} y={118} width={280} height={34} rx={6} fill={C.white} stroke={C.stroke} />
      <text x={30} y={139} fontSize={9.5} fill={C.text}>https://follow.jesusonline.com</text>
      <circle cx={270} cy={186} r={16} fill={C.gBlue} stroke={C.hiStroke} strokeWidth={2} />
      <path d="M262 186h14m-5-5 5 5-5 5" stroke={C.white} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Marker x={238} y={186} n={3} />
    </g>
  )
}

export function BrowserDrawing({ variant, className }: { variant: BrowserDrawingVariant; className?: string }) {
  return (
    <svg
      role="img"
      aria-label={LABELS[variant]}
      viewBox={VIEWBOX[variant]}
      className={className ?? "h-auto w-full"}
      fontFamily="'Source Sans 3', sans-serif"
      data-testid={`drawing-${variant}`}
    >
      {variant === "chrome-menu" && <ChromeMenu />}
      {variant === "chrome-address" && <ChromeAddress />}
      {variant === "android" && <Android />}
      {variant === "safari" && <Safari />}
      {variant === "google-translate" && <GoogleTranslate />}
    </svg>
  )
}
