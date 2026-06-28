import fs from 'node:fs';
import path from 'node:path';

const siteUrl = (process.env.SITE_URL || 'https://weto-app.netlify.app').replace(/\/+$/, '');
const distDir = path.join(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const ogImageSourcePath = path.join(process.cwd(), 'assets', 'icon.png');
const ogImageTargetPath = path.join(distDir, 'og-image.png');

const siteTitle = 'Weto | L\'app de rencontre qui commence par un dilemme';
const siteDescription = 'Weto est une application de rencontre francaise qui remplace les profils generiques par des dilemmes interactifs pour reveler des reactions reelles, mieux lire la compatibilite et lancer des conversations avec de la matiere.';
const siteKeywords = 'Weto, application de rencontre, dilemmes, compatibilite amoureuse, matchmaking, dating app, reactions, questions relationnelles';
const isoDate = new Date().toISOString();
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim() || '';
const bingSiteVerification = process.env.BING_SITE_VERIFICATION?.trim() || '';

if (!fs.existsSync(distDir) || !fs.existsSync(indexHtmlPath)) {
  throw new Error('dist/index.html is missing. Run the Expo web export before postbuild-web.mjs.');
}

fs.copyFileSync(ogImageSourcePath, ogImageTargetPath);

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Weto',
    url: `${siteUrl}/`,
    inLanguage: 'fr-FR',
    description: siteDescription,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Weto',
    applicationCategory: 'DatingApplication',
    operatingSystem: 'Web, iOS, Android',
    description: siteDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    url: `${siteUrl}/`,
    image: `${siteUrl}/og-image.png`,
  },
];

const headTags = [
  `<title>${siteTitle}</title>`,
  `<meta name="description" content="${siteDescription}">`,
  `<meta name="keywords" content="${siteKeywords}">`,
  '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">',
  '<meta name="theme-color" content="#F7F3EC">',
  `<link rel="canonical" href="${siteUrl}/">`,
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<link rel="alternate" hrefLang="fr-FR" href="https://weto-app.netlify.app/">',
  '<link rel="icon" href="/favicon.ico">',
  ...(googleSiteVerification ? [`<meta name="google-site-verification" content="${googleSiteVerification}">`] : []),
  ...(bingSiteVerification ? [`<meta name="msvalidate.01" content="${bingSiteVerification}">`] : []),
  `<meta property="og:title" content="${siteTitle}">`,
  `<meta property="og:description" content="${siteDescription}">`,
  '<meta property="og:type" content="website">',
  '<meta property="og:locale" content="fr_FR">',
  '<meta property="og:site_name" content="Weto">',
  `<meta property="og:url" content="${siteUrl}/">`,
  `<meta property="og:image" content="${siteUrl}/og-image.png">`,
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:title" content="${siteTitle}">`,
  `<meta name="twitter:description" content="${siteDescription}">`,
  `<meta name="twitter:image" content="${siteUrl}/og-image.png">`,
  `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
].join('\n    ');

const noScriptContent = `
    <noscript>
      <style>
        body { overflow: auto; background: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111111; }
        #root { display: none; }
        #seo-content { max-width: 860px; margin: 0 auto; padding: 48px 24px 72px; }
        #seo-content h1, #seo-content h2 { line-height: 1.15; }
        #seo-content p, #seo-content li { font-size: 16px; line-height: 1.7; }
      </style>
      <section id="seo-content">
        <h1>Weto, l'application de rencontre qui commence par un dilemme</h1>
        <p>Weto est une application de rencontre francaise qui remplace les profils traditionnels par des dilemmes interactifs. L'idee est simple : montrer un vrai signal avant l'inscription, puis utiliser ce signal pour mieux lire la compatibilite et lancer des conversations plus naturelles.</p>
        <h2>Ce que Weto permet</h2>
        <ul>
          <li>Repondre a des dilemmes relationnels, sociaux et absurdes</li>
          <li>Voir apparaitre un signal immediat autour de la clarte, de la stabilite et du risque</li>
          <li>Construire des matchs et des discussions avec plus de matiere que sur un profil classique</li>
        </ul>
        <h2>Pourquoi Weto existe</h2>
        <p>Parce qu'une application de rencontre devrait montrer quelque chose de vrai avant de demander du temps. Weto veut reduire la facade, augmenter le relief relationnel et transformer le premier echange en reaction concrete plutot qu'en small talk vide.</p>
      </section>
    </noscript>`;

let html = fs.readFileSync(indexHtmlPath, 'utf8');

for (const pattern of [
  /<title>[\s\S]*?<\/title>/gi,
  /<meta name="description"[^>]*>/gi,
  /<meta name="keywords"[^>]*>/gi,
  /<meta name="robots"[^>]*>/gi,
  /<meta name="theme-color"[^>]*>/gi,
  /<link rel="canonical"[^>]*>/gi,
  /<link rel="manifest"[^>]*>/gi,
  /<link rel="alternate"[^>]*hrefLang="fr-FR"[^>]*>/gi,
  /<link rel="icon"[^>]*>/gi,
  /<meta name="google-site-verification"[^>]*>/gi,
  /<meta name="msvalidate\.01"[^>]*>/gi,
  /<meta property="og:[^>]*>/gi,
  /<meta name="twitter:[^>]*>/gi,
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,
]) {
  html = html.replace(pattern, '');
}

html = html.replace('<html lang="en">', '<html lang="fr">');
html = html.replace(
  /<meta name="viewport"[^>]*>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
);
html = html.replace('</head>', `    ${headTags}\n  </head>`);
html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, noScriptContent);

fs.writeFileSync(indexHtmlPath, html, 'utf8');

fs.writeFileSync(
  path.join(distDir, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: Claude-Web',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    `Host: ${new URL(siteUrl).host}`,
  ].join('\n'),
  'utf8',
);

fs.writeFileSync(
  path.join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${isoDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
  'utf8',
);

fs.writeFileSync(
  path.join(distDir, 'llms.txt'),
  [
    '# Weto',
    '',
    '> Weto est une application de rencontre francaise qui commence par un dilemme plutot que par un formulaire.',
    '',
    '## URL canonique',
    `${siteUrl}/`,
    '',
    '## Resume produit',
    '- Weto remplace les profils generiques par des dilemmes interactifs.',
    '- L\'objectif est de reveler un signal relationnel reel avant l\'inscription.',
    '- Les matchs et les conversations partent ensuite de ce signal plutot que d\'une vitrine sociale.',
    '',
    '## Faits importants',
    '- L\'experience web desktop montre un micro-dilemme avant l\'inscription.',
    '- Le produit cherche la clarte, la compatibilite et des conversations avec plus de matiere.',
    '- Les surfaces principales du produit sont Feed, Match, Chat et Profil.',
    '',
    '## Description recommandee',
    'Weto est une application de rencontre par dilemmes : tu reagis d\'abord, tu comprends ton signal ensuite, puis tu decouvres des matchs plus coherents.',
  ].join('\n'),
  'utf8',
);

fs.writeFileSync(
  path.join(distDir, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'Weto',
      short_name: 'Weto',
      lang: 'fr-FR',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#F7F3EC',
      theme_color: '#1F6FFF',
      description: siteDescription,
      icons: [
        {
          src: '/og-image.png',
          sizes: '1024x1024',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    null,
    2,
  ),
  'utf8',
);

console.log('Web postbuild complete: SEO and LLM indexing assets generated.');