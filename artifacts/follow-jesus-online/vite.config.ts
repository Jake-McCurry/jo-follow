import path from 'path';
import fs from 'fs';
import os from 'os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'child_process';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import importedDeeperArticles from './src/data/imported-deeper-articles.json';
import articleCatalog from './src/data/article-library.json';
import { GO_FURTHER_BOOKS } from './src/data/go-further-library';
import linkedArticles from './src/data/linked-articles.json';

// Vite needs a port for dev/preview, but static production builds do not
// receive one from CI providers such as Cloudflare Pages.
const rawPort = process.env.PORT ?? '25342';

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

const ARTICLE_MODULE_ID = 'virtual:article-content';
const RESOLVED_ARTICLE_MODULE_ID = `\0${ARTICLE_MODULE_ID}`;

const APPROVED_ARTICLE_TEXT_REPLACEMENTS: Record<string, Record<string, string>> = {
  'deeper-the-gift-of-eternal-life': {
    '(Revelation 10:9)': '(Romans 10:9)',
  },
};

type ArticleBlock = {
  kind: 'heading' | 'paragraph' | 'question' | 'list' | 'image';
  text: string;
  src?: string;
  links?: { label: string; href: string }[];
};

type ArticleRecord = {
  route: string;
  title: string;
  category: string;
  blocks: ArticleBlock[];
};

const ADVENTURE_GUIDE_SOURCE_FILE =
  'Adventure-Guide-Updated-Visible-Links_1789424679027.pdf';
// Regenerate src/data/adventure-guide-source.txt with:
// pdftotext -layout attached_assets/Adventure-Guide-Updated-Visible-Links_1789424679027.pdf artifacts/follow-jesus-online/src/data/adventure-guide-source.txt
// If the PDF changes, update this digest after checking the new extracted content.
const ADVENTURE_GUIDE_PDF_SHA256 =
  '485804324ef243a0e56fa2f1b168f0d1f6936b036cbcc596517be9dc7310c7bb';

const ADVENTURE_GUIDE_SECTIONS = [
  { route: 'adv-begin-the-adventure', title: 'Begin the Adventure', startPage: 3, endPage: 4 },
  { route: 'adv-citizen-of-heaven', title: 'Citizen of Heaven', startPage: 5, endPage: 7 },
  { route: 'adv-your-new-identity-christ', title: 'Your New Identity in Christ', startPage: 8, endPage: 9 },
  { route: 'adv-the-holy-spirit', title: 'The Holy Spirit — Your Constant Companion', startPage: 10, endPage: 14 },
  { route: 'adv-walking-by-faith', title: 'Walking by Faith, Not by Feelings', startPage: 15, endPage: 17 },
  { route: 'adv-gods-word', title: 'God’s Word — Your Road Map', startPage: 18, endPage: 21 },
  { route: 'adv-prayer', title: 'Prayer — Your Ongoing Conversation with God', startPage: 22, endPage: 24 },
  { route: 'adv-belonging-to-gods-family', title: 'Belonging to God’s Family', startPage: 25, endPage: 27 },
  { route: 'adv-living-a-life-of-purpose', title: 'Living a Life of Purpose', startPage: 28, endPage: 31 },
  { route: 'adv-continuing-with-jesus', title: 'Continuing with Jesus', startPage: 32, endPage: 33 },
] as const;

const ADVENTURE_GUIDE_HEADINGS = new Set([
  'My Heart, Christ’s Home',
  'Walking the Path Ahead',
  'What You Will Discover',
  'How to Walk This Path',
  'God’s Free Gift',
  'If You Are Not Yet Sure You Have Received Him',
  'Where Are You Going After You Die?',
  'Your Faithful Friend',
  'Growth Is God’s Plan for You',
  'Your Inheritance in Christ',
  'A New You',
  'More like Christ',
  'Ready in Heart, but Not Yet Empowered',
  'The Indwelling Holy Spirit',
  'Who Is the Holy Spirit?',
  'The Battle Within',
  'The Filling of the Holy Spirit',
  'A Simple Step of Surrender',
  'Restoring Fellowship',
  'Spiritual Breathing',
  'Bearing Fruit',
  'Your Daily Power',
  'Overcoming Doubt',
  'Victorious Faith',
  'Examining Your Trust',
  'Before You Begin',
  'God’s Road Map for Your Life',
  'Forming a New Habit',
  'God’s Viewpoint',
  'What Fills Your Mind',
  'Five Ways to Take in God’s Word',
  'The Power of God’s Word to Transform',
  'Relationship, Not Rules',
  'Knowing Your Father',
  'Praying with Confidence and Humility',
  'Growing in the Practice of Prayer',
  'Christ’s Local Body',
  'The Example of the Early Church',
  'Why Connection Matters',
  'Baptism and the Lord’s Table',
  'Unique Gifts for the Common Good',
  'Taking Steps to Belong',
  'Personal Holiness',
  'Love for Others',
  'Ambassadors for Christ',
  'Investing Your Life',
  'Expanding Your “Territory”',
  'Accountability and Reward',
  'Continuing the Journey',
  'Keep Taking the Next Step',
  'A Closing Prayer',
]);

function parseAdventureGuideSection(
  pages: string[],
  section: (typeof ADVENTURE_GUIDE_SECTIONS)[number],
): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  let currentKind: ArticleBlock['kind'] | undefined;
  let currentText = '';

  const flush = () => {
    const text = currentText
      .replace(/_{5,}/g, '')
      .replace(/\s+/g, ' ')
      .replace(/https:\/\/follow\.jesusonline\.com\/\s+/g, 'https://follow.jesusonline.com/')
      .trim();
    if (currentKind && text) blocks.push({ kind: currentKind, text });
    currentKind = undefined;
    currentText = '';
  };

  for (const page of pages.slice(section.startPage - 1, section.endPage)) {
    for (const rawLine of page.split('\n')) {
      const line = rawLine.trim();
      if (!line) {
        flush();
        continue;
      }
      if (/^JesusOnline Ministries\s+·\s+Page \d+$/.test(line)) {
        flush();
        continue;
      }
      if (
        line === section.title ||
        line.replace(/^\d+\.\s*/, '') === section.title
      ) {
        flush();
        continue;
      }
      if (line.startsWith('Keep walking. If you want more')) {
        flush();
        return blocks;
      }
      if (/^_+$/.test(line)) continue;
      if (ADVENTURE_GUIDE_HEADINGS.has(line)) {
        flush();
        blocks.push({ kind: 'heading', text: line });
        continue;
      }
      if (line.startsWith('•')) {
        flush();
        currentKind = 'list';
        currentText = line.replace(/^•\s*/, '');
        continue;
      }
      if (/^(?:Q:|Your thoughts:)/i.test(line)) {
        flush();
        currentKind = 'question';
        currentText = line;
        continue;
      }
      if (!currentKind) currentKind = 'paragraph';
      currentText += `${currentText ? ' ' : ''}${line}`;
    }
    flush();
  }

  return blocks;
}

function readAdventureGuideSource(pdfPath: string): ArticleRecord[] {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`The Adventure guide PDF is required to build: ${pdfPath}`);
  }

  const pdfHash = createHash('sha256').update(fs.readFileSync(pdfPath)).digest('hex');
  if (pdfHash !== ADVENTURE_GUIDE_PDF_SHA256) {
    throw new Error(
      'The Adventure guide PDF changed. Regenerate src/data/adventure-guide-source.txt and update its PDF digest before building.',
    );
  }

  const sourcePath = path.join(import.meta.dirname, 'src/data/adventure-guide-source.txt');
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`The extracted Adventure guide text is required to build: ${sourcePath}`);
  }
  const pdfText = fs.readFileSync(sourcePath, 'utf8');
  const pages = pdfText.split('\f');
  if (pages.length < 34) {
    throw new Error(
      `The Adventure guide PDF must contain 34 pages; found ${pages.length}.`,
    );
  }

  return ADVENTURE_GUIDE_SECTIONS.map((section) => {
    const blocks = parseAdventureGuideSection(pages, section);
    if (blocks.length === 0) {
      throw new Error(`No content was extracted for ${section.route}.`);
    }
    return {
      route: `/${section.route}`,
      title: section.title,
      category: 'Adventure Guide',
      blocks,
    };
  });
}

function decodeXml(text: string) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseDocxBlocks(
  documentXml: string,
  images?: Map<string, string>,
  hyperlinks?: Map<string, string>,
): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const paragraphPattern = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  let match: RegExpExecArray | null;
  let paragraphIndex = 0;

  while ((match = paragraphPattern.exec(documentXml))) {
    const paragraphXml = match[1];
    const text = decodeXml(
      (paragraphXml.match(/<w:t\b[^>]*>[\s\S]*?<\/w:t>/g) ?? [])
        .map((run) => run.replace(/^<w:t\b[^>]*>/, '').replace(/<\/w:t>$/, ''))
        .join(''),
    )
      .replace(/\s+/g, ' ')
      .trim();

    const embeddedIds = images
      ? [...paragraphXml.matchAll(/<a:blip\b[^>]*r:embed="([^"]+)"/g)].map((match) => match[1])
      : [];
    if (!text && embeddedIds.length === 0) continue;

    const cleanedText = (
      paragraphIndex === 0
        ? text.replace(/^\d+(?:\.\d+)+\s*/, '').replace(/^\d+\.\s*/, '')
        : text.replace(/^\d+(?:\.\d+)+\s*/, '')
    );
    const style = paragraphXml.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1] ?? '';
    const links = hyperlinks
      ? [...paragraphXml.matchAll(/<w:hyperlink\b[^>]*r:id="([^"]+)"[^>]*>([\s\S]*?)<\/w:hyperlink>/g)]
        .map((match) => ({
          label: decodeXml((match[2].match(/<w:t\b[^>]*>[\s\S]*?<\/w:t>/g) ?? [])
            .map((run) => run.replace(/^<w:t\b[^>]*>/, '').replace(/<\/w:t>$/, '')).join(''))
            .replace(/\s+/g, ' ').trim(),
          href: hyperlinks.get(match[1]),
        }))
        .filter((link): link is { label: string; href: string } => Boolean(link.label && link.href))
      : [];

    if (text) {
      blocks.push({
        kind: style.toLowerCase().startsWith('heading')
          ? 'heading'
          : style.toLowerCase() === 'listparagraph'
            ? 'list'
            : 'paragraph',
        text: cleanedText,
        ...(links.length ? { links } : {}),
      });
      paragraphIndex += 1;
    }
    for (const id of embeddedIds) {
      const src = images?.get(id);
      if (!src) throw new Error(`Missing image relationship ${id} in article document`);
      blocks.push({ kind: 'image', text: '', src });
    }
  }

  return blocks;
}

function readDocxFileBlocks(docxPath: string): ArticleBlock[] {
  const documentXml = execFileSync(
    'unzip',
    ['-p', docxPath, 'word/document.xml'],
    { encoding: 'utf8' },
  );
  return parseDocxBlocks(documentXml);
}

function applyApprovedArticleTextReplacements(slug: string, blocks: ArticleBlock[]) {
  const replacements = APPROVED_ARTICLE_TEXT_REPLACEMENTS[slug];
  if (!replacements) return blocks;

  return blocks.map((block) => ({
    ...block,
    text: Object.entries(replacements).reduce(
      (text, [source, replacement]) => text.replaceAll(source, replacement),
      block.text,
    ),
  }));
}

function readDocxBlocks(archivePath: string, entryName: string, tempDir: string): ArticleBlock[] {
  const docxPath = path.join(tempDir, `${slugify(path.basename(entryName))}.docx`);
  fs.writeFileSync(docxPath, execFileSync('unzip', ['-p', archivePath, entryName]));
  return readDocxFileBlocks(docxPath);
}

const FOLLOW_ARCHIVE = 'Follow_Articles_1790629240431.zip';
const followImages = new Map<string, { source: Buffer; type: string }>();
const FOLLOW_DOCX_MAX_BUFFER = 32 * 1024 * 1024;

const FOLLOW_EXISTING_GROUPS = [
  { group: 'adventure', directory: '/1.1 The Adventure of Living with Jesus/', prefix: '1.1.', first: 0, step: 1 },
  { group: 'deeper', directory: '/1.1.01 Go Deeper/', prefix: '1.1.01.', first: 0, step: 1 },
  { group: 'received', directory: '/1.3.10 New Believers FAQs/', prefix: '1.3.10.', first: 10, step: 10 },
  { group: 'rededicated', directory: '/1.3.20 Rededicated FAQs/', prefix: '1.3.20.', first: 10, step: 10 },
  { group: 'believer', directory: '/1.3.30 Already FAQs/', prefix: '1.3.30.', first: 1, step: 1 },
  { group: 'no-decision', directory: '/1.3.40 No Decision FAQs/', prefix: '1.3.40.', first: 1, step: 1 },
] as const;

function readFollowArticle(
  archivePath: string,
  entryName: string,
  tempDir: string,
): ArticleBlock[] {
  const docxPath = path.join(tempDir, `${slugify(entryName)}.docx`);
  fs.writeFileSync(docxPath, execFileSync('unzip', ['-p', archivePath, entryName], { maxBuffer: FOLLOW_DOCX_MAX_BUFFER }));
  const documentXml = execFileSync('unzip', ['-p', docxPath, 'word/document.xml'], { encoding: 'utf8', maxBuffer: FOLLOW_DOCX_MAX_BUFFER });
  let relationships = '';
  try {
    relationships = execFileSync('unzip', ['-p', docxPath, 'word/_rels/document.xml.rels'], { encoding: 'utf8', maxBuffer: FOLLOW_DOCX_MAX_BUFFER });
  } catch {
    // Word documents without images may omit this file.
  }
  const imageRelationships = new Map<string, string>();
  const hyperlinkRelationships = new Map<string, string>();
  for (const match of relationships.matchAll(/<Relationship\b[^>]*\/>/g)) {
    const id = match[0].match(/\bId="([^"]+)"/)?.[1];
    const target = match[0].match(/\bTarget="([^"]+)"/)?.[1];
    if (!id || !target) continue;
    if (/^https?:\/\//i.test(target) && match[0].includes('TargetMode="External"')) {
      const href = decodeXml(target);
      const url = new URL(href);
      hyperlinkRelationships.set(id, url.hostname === 'follow.jesusonline.com'
        ? `${url.pathname}${url.search}${url.hash}` : href);
      continue;
    }
    if (!/^media\/[^/]+\.(?:png|jpe?g|webp)$/i.test(target)) continue;
    const extension = target.split('.').at(-1)!.toLowerCase();
    const name = `${createHash('sha256').update(`${entryName}:${target}`).digest('hex').slice(0, 16)}.${extension}`;
    followImages.set(name, {
      source: execFileSync('unzip', ['-p', docxPath, `word/${target}`], { maxBuffer: FOLLOW_DOCX_MAX_BUFFER }),
      type: extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg',
    });
    imageRelationships.set(id, name);
  }
  return parseDocxBlocks(documentXml, imageRelationships, hyperlinkRelationships);
}

function readNewFollowArticles(attachedAssetsDir: string, tempDir: string): ArticleRecord[] {
  const archivePath = path.join(attachedAssetsDir, FOLLOW_ARCHIVE);
  if (!fs.existsSync(archivePath)) throw new Error(`Required Follow articles ZIP is missing: ${archivePath}`);
  followImages.clear();
  const entries = execFileSync('unzip', ['-Z1', archivePath], { encoding: 'utf8' })
    .split('\n')
    .filter((entry) => entry.toLowerCase().endsWith('.docx'));
  const records: ArticleRecord[] = [];

  for (const [bookIndex, book] of GO_FURTHER_BOOKS.entries()) {
    const prefix = `1.2.${String(bookIndex + 1).padStart(2, '0')}.`;
    const bookEntries = entries.filter((entry) =>
      entry.includes('/1.2 Go Further/') && path.basename(entry).startsWith(prefix),
    ).sort();
    if (bookEntries.length !== book.readings.length) {
      throw new Error(`${book.title}: ZIP has ${bookEntries.length} readings but site lists ${book.readings.length}`);
    }
    for (const [index, reading] of book.readings.entries()) {
      const expectedPrefix = `${prefix}${String(index + 1).padStart(3, '0')} `;
      if (!path.basename(bookEntries[index]).startsWith(expectedPrefix)) {
        throw new Error(`${book.title}: expected ${expectedPrefix} but found ${bookEntries[index]}`);
      }
      const blocks = readFollowArticle(archivePath, bookEntries[index], tempDir);
      if (!blocks.some((block) => block.kind === 'paragraph')) {
        throw new Error(`${book.title}: ${reading.title} has no readable body text`);
      }
      records.push({
        route: `/gf/${book.slug}/${reading.slug}`,
        title: reading.title.replace(/^\d+\.\s*/, ''),
        category: 'Go Further',
        blocks,
      });
    }
  }

  for (const item of linkedArticles) {
    const entry = entries.find((name) =>
      name.includes('/Linked articles not to be shown in any menu/') && path.basename(name).startsWith(item.prefix),
    );
    if (!entry) throw new Error(`Required linked-only article missing: ${item.prefix}`);
    const blocks = readFollowArticle(archivePath, entry, tempDir);
    if (!blocks.some((block) => block.kind === 'paragraph')) {
      throw new Error(`Linked-only article ${item.title} has no readable body text`);
    }
    records.push({
      route: `/${item.slug}`,
      title: item.title,
      category: 'Linked only',
      blocks,
    });
  }

  for (const config of FOLLOW_EXISTING_GROUPS) {
    const existing = config.group === 'deeper'
      ? importedDeeperArticles
      : articleCatalog.articles.filter((article) => article.group === config.group)
        .sort((a, b) => a.order - b.order);
    const matching = entries.filter((entry) =>
      entry.includes(config.directory)
      && new RegExp(`^${config.prefix.replaceAll('.', '\\.')}\\d{3} `).test(path.basename(entry)),
    ).sort();
    if (matching.length !== existing.length) {
      throw new Error(`${config.group}: expected ${existing.length} ZIP documents; found ${matching.length}`);
    }
    for (const [index, article] of existing.entries()) {
      const expectedPrefix = `${config.prefix}${String(config.first + index * config.step).padStart(3, '0')} `;
      if (!path.basename(matching[index]).startsWith(expectedPrefix)) {
        throw new Error(`${config.group}: expected ${expectedPrefix}; found ${matching[index]}`);
      }
      const blocks = readFollowArticle(archivePath, matching[index], tempDir);
      const title = blocks.find((block) => block.kind === 'heading')?.text;
      if (!title || !blocks.some((block) => block.kind === 'paragraph')) {
        throw new Error(`${config.group}: missing title or body in ${matching[index]}`);
      }
      records.push({
        route: `/${article.slug}`,
        title,
        category: 'ZIP Updated',
        blocks,
      });
    }
  }
  if (records.length !== 90) {
    throw new Error(`Expected 42 Go Further, 4 linked-only and 44 existing articles; found ${records.length}`);
  }
  return records;
}

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugify(title: string) {
  return normalizeTitle(title).replace(/\s+/g, '-');
}

function titleFromEntry(entryName: string) {
  return (path.basename(entryName, '.docx').replace(/^\d+(?:\.\d+)+\s*/, '') || 'Article')
    .replace(/\s+/g, ' ')
    .trim();
}

function routeForArticle(entryName: string, title: string) {
  const normalizedTitle = normalizeTitle(title);
  const entry = entryName.toLowerCase();

  if (entry.includes('1.10 the adventure')) {
    const routes: Record<string, string> = {
      'begin the adventure': 'adv-begin-the-adventure',
      'citizen of heaven': 'adv-citizen-of-heaven',
      'your identity in christ': 'adv-your-new-identity-christ',
      'the holy spirit your constant companion': 'adv-the-holy-spirit',
      'walking by faith not by feelings': 'adv-walking-by-faith',
      'gods word your road map': 'adv-gods-word',
      'prayer your ongoing conversation with god': 'adv-prayer',
      'belonging to gods family': 'adv-belonging-to-gods-family',
      'living a life of purpose': 'adv-living-a-life-of-purpose',
      'continuing with jesus': 'adv-continuing-with-jesus',
    };
    return routes[normalizedTitle] ?? `adv-${slugify(title)}`;
  }

  if (entry.includes('1.20 go deepr')) {
    const routes: Record<string, string> = {
      'assurance of your salvation': 'deeper-assurance-of-your-salvation',
      'faith knowing whom you can trust': 'deeper-faith-knowing-who-you-can-trust',
    };
    return routes[normalizedTitle] ?? `deeper-${slugify(title)}`;
  }

  if (entry.includes('received faqs')) return `more-received-${slugify(title)}`;
  if (entry.includes('rededicated faqs')) return `more-rededicated-${slugify(title)}`;
  if (entry.includes('1.5 already faqs')) return `more-believer-${slugify(title)}`;
  if (entry.includes('1.6 no decision faqs')) return `more-no-decision-${slugify(title)}`;
  return `more-${slugify(title)}`;
}

function buildArticleLibrary(): ArticleRecord[] {
  const workspaceRoot = path.resolve(import.meta.dirname, '..', '..');
  const attachedAssetsDir = path.join(workspaceRoot, 'attached_assets');
  const availableArchives = fs
    .readdirSync(attachedAssetsDir)
    .filter((name) => name.toLowerCase().endsWith('.zip'));
  const archiveName = availableArchives.find((name) => name.startsWith('JOLF_'));

  if (!archiveName) {
    throw new Error(
      'The JOLF article archive is required to build Follow Jesus Online. Add the supplied JOLF_*.zip file to attached_assets.',
    );
  }

  const supplementalArchivePatterns = [
    /^(?:alreeady|already)_believer_.*\.zip$/i,
    /^no_decision_.*\.zip$/i,
  ];
  const supplementalArchives = supplementalArchivePatterns.map((pattern) => {
    const match = availableArchives.filter((name) => pattern.test(name)).sort().at(-1);
    if (!match) {
      throw new Error(`A required FAQ archive matching ${pattern} is missing from attached_assets.`);
    }
    return match;
  });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jolf-docx-'));
  try {
    const archivedArticles = [archiveName, ...supplementalArchives].flatMap((currentArchiveName) => {
      const archivePath = path.join(attachedAssetsDir, currentArchiveName);
      const entries = execFileSync('unzip', ['-Z1', archivePath], { encoding: 'utf8' })
        .split('\n')
        .filter((entry) => entry.toLowerCase().endsWith('.docx'))
        .filter((entry) => !entry.toLowerCase().includes('magazine edition'))
        .sort();

      return entries.map((entryName) => {
        const title = titleFromEntry(entryName);
        return {
          route: `/${routeForArticle(entryName, title)}`,
          title,
          category: entryName.includes('1.10 The Adventure')
            ? 'Adventure Guide'
            : entryName.includes('1.20 Go Deepr')
              ? 'Go Deeper'
              : entryName.includes('FAQs')
                ? 'Questions & Answers'
                : 'Additional Resource',
          blocks: readDocxBlocks(archivePath, entryName, tempDir),
        };
      });
    });
    const followArticles = readNewFollowArticles(attachedAssetsDir, tempDir);
    const updatedRoutes = new Set(followArticles.map((article) => article.route));
    return [
      ...archivedArticles.filter((article) => !updatedRoutes.has(article.route)),
      ...followArticles,
    ];
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function articleContentPlugin(): Plugin {
  return {
    name: 'jolf-article-content',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = decodeURIComponent((request.url ?? '').split('?')[0]);
        const prefix = `${basePath.replace(/\/?$/, '/')}article-images/`;
        if (!pathname.startsWith(prefix)) return next();
        const name = pathname.slice(prefix.length);
        const image = followImages.get(name);
        if (!image) {
          // Uploaded article illustrations live in public; let Vite serve them
          // rather than treating every non-archive image as missing.
          const publicImage = path.join(import.meta.dirname, 'public/article-images', name);
          if (
            name === path.basename(name) &&
            fs.existsSync(publicImage) &&
            fs.statSync(publicImage).isFile()
          ) return next();
          response.statusCode = 404;
          response.end('Image not found');
          return;
        }
        response.setHeader('Content-Type', image.type);
        response.setHeader('Cache-Control', 'public, max-age=3600');
        response.end(image.source);
      });
    },
    resolveId(id) {
      return id === ARTICLE_MODULE_ID ? RESOLVED_ARTICLE_MODULE_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ARTICLE_MODULE_ID) return undefined;
      return `export default ${JSON.stringify(buildArticleLibrary())};`;
    },
    generateBundle() {
      for (const [name, image] of followImages) {
        this.emitFile({ type: 'asset', fileName: `article-images/${name}`, source: image.source });
      }
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    articleContentPlugin(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
      // Never expose backend code, database modules, or private workspace files.
      allow: [
        import.meta.dirname,
        path.resolve(import.meta.dirname, '../../node_modules'),
        path.resolve(import.meta.dirname, '../../lib/api-client-react'),
        path.resolve(import.meta.dirname, '../../lib/api-zod'),
        path.resolve(import.meta.dirname, '../../attached_assets'),
      ],
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
