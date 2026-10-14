FOLLOW XP — WORDPRESS / GENESIS INLINE HTML
=========================================

REPLACEMENT PACKAGE — PLEASE REPLACE THE OLD BLOCK, DO NOT APPEND TO IT.

The previous screenshot showed a style-attribute fragment printed as text.
That indicates lost or altered markup, not merely different colors or fonts.
This replacement uses complete, readable markup and a conservative stacked
layout: no flexbox, grids, CSS functions, external fonts or scripts.

Four main-content snippets:
  received.html        — He heard you. You are His.
  rededicated.html     — Welcome back. He never left.
  believer.html        — You already belong to Him.
  did-not-pray.html    — You do not have to decide today.

Each .txt file contains exactly the same code as its matching .html file.
Use the .txt files if your computer opens HTML as a rendered page instead of code.

EASIEST WAY TO COPY WITHOUT LOSING THE START OF THE CODE
------------------------------------------------------
Open copy/believer.html in your browser (or the matching other page).
Click INSIDE its code box, Select All, then Copy. Paste into the WordPress
page Code editor after removing the old XP block. The whole snippet,
including its wrapper and title, is already inside that one code box.
These copy-helper pages are not the page snippets; copy the text IN the box.

WHAT THESE FILES ARE
-------------------
Plain HTML with all styling in inline style attributes.
No React, Tailwind, JavaScript, style blocks, external stylesheets, SVGs,
plugins, site header, navigation or footer are included or required.
The existing WordPress / Genesis theme supplies the surrounding page shell.
No Genesis Blocks-specific dependency is required: use its Custom HTML block.

BEFORE PASTING: UPLOAD THE COVER ONCE
------------------------------------
1. In WordPress, open Media > Add New and upload the included guide-cover.png.
2. Copy that uploaded image's full File URL.
3. In received, rededicated and believer, replace:

   REPLACE_WITH_WORDPRESS_GUIDE_COVER_URL

   with the actual Media Library File URL.
   The did-not-pray page intentionally has no guide cover or guide card.
   Do not replace the placeholder with a local computer file path.

PASTE INTO THE WORDPRESS PAGE CODE EDITOR
----------------------------------------
1. Open the appropriate WordPress page.
2. If your Genesis setup offers a per-page layout setting, choose Full Width
   Content for the closest result. Leave the site's header/footer alone.
3. Remove the entire old XP content block, including any stray CSS text.
   Keep unrelated page content and the site's theme header/footer.
4. In the page editor's options menu, switch to Code editor.
5. Open the matching .txt file in a PLAIN-TEXT editor, such as Notepad or
   TextEdit in plain-text mode. Select All and Copy. Do not copy from a
   rendered HTML preview, a rich-text document, or only part of a line.
6. Paste the COMPLETE file, including the opening <!-- wp:html --> and
   closing <!-- /wp:html --> lines. The opening data-follow-xp wrapper,
   title, intro and guide must all be present, not just the questions.
7. Preview on desktop and mobile, save/update, then reload the live page.

Alternative, including Genesis Blocks: insert ONE Custom HTML block and paste just the inner code,
omitting the opening and closing wp:html comment lines. Do not paste into
a Paragraph or Code block: a Code block displays code rather than rendering it.

If the page already contains other blocks, replace only its intended main
content or insert this block where you want it. Do not edit the theme files.
The snippet includes its own content title. If WordPress also prints a page
title, use your theme's per-page title setting, where available, or change
the snippet's first h1 to h2. Do not hide the whole site header.

LINKS AND SHARING
-----------------
Article, guide, video and contact links preserve their original Follow paths
on the user-supplied domain https://follow.jesusonline.com.
The destination pages and message service are NOT copied into WordPress.
Confirm that domain and those destinations remain publicly accessible before
using the pages. If you move them, update the href URLs in the snippets.
Question links retain the original journey parameters.

Because you requested HTML/CSS only, "Save or Send this page" is an email
sharing link, not a JavaScript clipboard or native-share button. It opens
the visitor's configured email app with the original Follow XP URL.
If you want it to share the WordPress copy instead, update the URL in that
mailto link's URL-encoded body to the final WordPress page URL.

The main content uses one readable column with full-width stacked cards.
The guide cover is centered above the guide text. This deliberately trades
the Replit two-column layout for a simpler layout on the WordPress theme.
Card/page colors match the warm Follow palette. The outer page background
is inherited from your WordPress theme.
Fonts use Arial and Georgia; no remote font stylesheets are needed.

WORDPRESS NOTES
---------------
WordPress may sanitize markup or styles according to your role, security
plugins, and WordPress version. Preview after saving as well as before.
Use a trusted editor account with appropriate HTML permissions; do not
disable site security to paste these pages.
Theme rules marked !important can override inline styles. If that happens,
adjust the page's existing theme settings rather than pasting global CSS.

If raw CSS still appears after a complete clean paste, do not keep making
random styling changes. Share the page URL and the saved Code editor HTML
so the exact editor transformation or theme override can be inspected.

Main source copy is retained for all four pages. The contact invitation is
main content, not the site's footer. The did-not-pray differences are intentional.
