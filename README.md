# Writing posts

1. Copy `src/posts/_template.md` to a new file such as `src/posts/2026-09-21-my-post.md`.
2. Put the post title in the first `# Heading`, then write the post in Markdown.
3. Run `npm install` once. Run `npm run build` whenever you add or edit a post.

The build creates an HTML page next to each Markdown file and adds links to `src/index.html`. Edit the `.md` files, not the generated `.html` files. Publish the `src` folder after building.
