import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { marked } from 'marked';

// Where the homepage and posts live
const root = fileURLToPath(new URL('..', import.meta.url));
const postsDir = join(root, 'src', 'posts');
const indexPath = join(root, 'src', 'index.html');
const startMarker = '<!-- posts:start -->';
const endMarker = '<!-- posts:end -->';
const generatedMarker = '<!-- Generated from Markdown. Edit the .md file instead. -->';

function escapeHtml(text) {
    const characters = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, (character) => characters[character]);
}

await mkdir(postsDir, { recursive: true });
const filenames = (await readdir(postsDir))
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .sort()
    .reverse();
const posts = [];

// Turn each Markdown file into a page.
for (const filename of filenames) {
    const postName = filename.slice(0, -3);
    const validName = /^[a-z0-9-]+$/.test(postName);
    if (!validName) {
        throw new Error(`Use lowercase letters, numbers, and hyphens in post filename: ${filename}`);
    }

    const markdown = await readFile(join(postsDir, filename), 'utf8');
    const heading = marked.lexer(markdown).find(
        (part) => part.type === 'heading' && part.depth === 1
    );
    if (!heading) {
        throw new Error(`Add a # Heading to ${filename}`);
    }

    const title = heading.text;
    const content = marked.parse(markdown).trimEnd();
    const articleLines = content.split('\n');
    const article = articleLines.map((line) => `            ${line}`).join('\n');
    const page = `${generatedMarker}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} — sambee5</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <main class="wrap">
        <p><a href="../index.html">← Home</a></p>
        <button class="theme-toggle" type="button">light</button>
        <article>
${article}
        </article>
    </main>
    <script src="../theme.js" defer></script>
</body>
</html>
`;
    await writeFile(join(postsDir, `${postName}.html`), page);
    posts.push({ name: postName, title });
}

// Remove old HTML pages when their Markdown files have been deleted.
const currentPages = new Set(posts.map((post) => `${post.name}.html`));
for (const filename of await readdir(postsDir)) {
    if (!filename.endsWith('.html') || currentPages.has(filename)) {
        continue;
    }

    const pagePath = join(postsDir, filename);
    const page = await readFile(pagePath, 'utf8');
    if (page.startsWith(generatedMarker)) {
        await unlink(pagePath);
    }
}

// Replace only the posts section on the homepage.
const homePage = await readFile(indexPath, 'utf8');
const start = homePage.indexOf(startMarker);
const end = homePage.indexOf(endMarker);
if (start < 0 || end < start) {
    throw new Error('Post markers are missing from src/index.html');
}

let section = '\n        ';
if (posts.length > 0) {
    const links = posts.map((post) => {
        return `                <li><a href="posts/${post.name}.html">${escapeHtml(post.title)}</a></li>`;
    }).join('\n');

    section = `
        <section aria-label="Posts">
            <h2>Posts</h2>
            <ul>
${links}
            </ul>
        </section>
        `;
}

const beforePosts = homePage.slice(0, start + startMarker.length);
const afterPosts = homePage.slice(end);
await writeFile(indexPath, beforePosts + section + afterPosts);

console.log('Posts built:', posts.length);
