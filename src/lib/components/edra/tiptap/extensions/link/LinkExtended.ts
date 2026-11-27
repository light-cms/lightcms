import Link, { type LinkOptions } from "@tiptap/extension-link";

export const LinkExtended = Link.extend<LinkOptions>({
  parseMarkdown(token, helpers) {
    const inlineNodes = helpers.parseInline(token.tokens ?? []);
    const containsImage = inlineNodes.some((node) => node.type === "image");

    if (containsImage) {
      return inlineNodes.map((node) => {
        if (node.type === "image") {
          const imageAttrs: Record<string, any> = {
            ...node.attrs,
            href: token.href,
          };
          if (token.title) {
            imageAttrs.linkTitle = token.title;
          }

          const existingMarks = node.marks ?? [];
          return {
            ...node,
            attrs: imageAttrs,
            marks: [
              ...existingMarks,
              {
                type: "link",
                attrs: {
                  href: token.href,
                  title: token.title ?? null,
                },
              },
            ],
          };
        }

        const existingMarks = node.marks ?? [];
        return {
          ...node,
          marks: [
            ...existingMarks,
            {
              type: "link",
              attrs: {
                href: token.href,
                title: token.title ?? null,
              },
            },
          ],
        };
      });
    }

    return helpers.applyMark("link", inlineNodes, {
      href: token.href,
      title: token.title ?? null,
    });
  },
});

export default LinkExtended;
