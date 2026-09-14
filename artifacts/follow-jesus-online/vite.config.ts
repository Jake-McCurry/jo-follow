import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFileSync } from 'child_process';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import importedDeeperArticles from './src/data/imported-deeper-articles.json';

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
  kind: 'heading' | 'paragraph' | 'list';
  text: string;
};

type ArticleRecord = {
  route: string;
  title: string;
  category: string;
  blocks: ArticleBlock[];
};

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

function parseDocxBlocks(documentXml: string): ArticleBlock[] {
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

    if (!text) continue;

    const cleanedText = (
      paragraphIndex === 0
        ? text.replace(/^\d+(?:\.\d+)+\s*/, '').replace(/^\d+\.\s*/, '')
        : text.replace(/^\d+(?:\.\d+)+\s*/, '')
    ).replace(/\s*>{3}\s*$/, '');
    const style = paragraphXml.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1] ?? '';

    blocks.push({
      kind: style.toLowerCase().startsWith('heading')
        ? 'heading'
        : style.toLowerCase() === 'listparagraph'
          ? 'list'
          : 'paragraph',
      text: cleanedText,
    });
    paragraphIndex += 1;
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
    const standaloneDeeperArticles = importedDeeperArticles.map((article) => {
      const docxPath = path.join(attachedAssetsDir, article.file);
      if (!fs.existsSync(docxPath)) {
        throw new Error(`Required Go Deeper article is missing: ${article.file}`);
      }
      return {
        route: `/${article.slug}`,
        title: article.title,
        category: 'Go Deeper',
        blocks: applyApprovedArticleTextReplacements(
          article.slug,
          readDocxFileBlocks(docxPath),
        ),
      };
    });
    return [...archivedArticles, ...standaloneDeeperArticles];
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function articleContentPlugin(): Plugin {
  return {
    name: 'jolf-article-content',
    resolveId(id) {
      return id === ARTICLE_MODULE_ID ? RESOLVED_ARTICLE_MODULE_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ARTICLE_MODULE_ID) return undefined;
      return `export default ${JSON.stringify(buildArticleLibrary())};`;
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
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
