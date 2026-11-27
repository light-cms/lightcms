import matter from "gray-matter";

export type PostFrontMatter = {
  date: string;
  draft: boolean;
  title: string;
};

export type ParsedPost = {
  body: string;
  frontMatter: PostFrontMatter;
};

export function parsePost(source: string): ParsedPost {
  const parsed = matter(source);

  return {
    body: parsed.content,
    frontMatter: {
      title: parsed.data.title,
      date: parsed.data.date,
      draft: parsed.data.draft === true,
    },
  };
}

export function serializePost(frontMatter: PostFrontMatter, body: string) {
  return matter.stringify(`${body.trimEnd()}\n`, frontMatter);
}
