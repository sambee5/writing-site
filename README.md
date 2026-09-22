# Writing posts

1. Copy `src/posts/_template.md` to a new Markdown file.
2. Write the post and give it a `# Heading`.
3. Run `npm run build` to rebuild the site.

## Publishing

Push the `main` branch to GitHub. The workflow in `.github/workflows/deploy.yml` builds the posts and publishes the `src` folder with GitHub Pages.
