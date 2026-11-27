import type { Actions, PageServerLoad } from "./$types";

const demoBody = `## A live, editable preview

This is the exact editor experience you get inside LightCMS, loaded with a sample post. Type, format, and explore — the demo is all yours.

> Select some text to use the formatting bubble menu, or drag the handle beside a block to rearrange the page.

### What you can try

- **Rich text** with headings, lists, and links
- **Raw markdown** using the toggle in the top bar
- **Frontmatter** editing for structured metadata
- Grammar and spelling checks powered by Harper

1. Click anywhere in the content
2. Make a change
3. Press **Save** to see the status update

| Feature | Available |
| --- | --- |
| Rich text | Yes |
| Markdown | Yes |
| Frontmatter | Yes |

\`\`\`ts
const post = {
  title: "Hello, LightCMS",
  draft: false,
};
\`\`\`

- [x] Explore the editor
- [ ] Publish your first post
`;

export const load: PageServerLoad = () => {
  return {
    file: {
      path: "posts/hello-lightcms.md",
      filename: "hello-lightcms.md",
      extension: "md",
      sha: "d3a0c0f7e1b2a3c4d5e6f708192a3b4c5d6e7f80",
      isMarkdown: true,
      frontMatter: {
        title: "Hello, LightCMS",
        description: "A sample post for trying the LightCMS editor.",
        date: "2026-10-22",
        author: "LightCMS Team",
        tags: ["demo", "editor"],
        draft: false,
      },
      body: demoBody,
      rawContent: demoBody,
    },
    repository: "lightcms/demo",
    branch: "main",
  };
};

export const actions: Actions = {
  save: async () => {
    return { success: true, savedAt: new Date().toISOString() };
  },
};
