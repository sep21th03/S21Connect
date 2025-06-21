export const extractAllYoutubeEmbedUrls = (text: string): string[] => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  const matches = Array.from(text.matchAll(regex));
  return matches.map((m) => `https://www.youtube.com/embed/${m[1]}`);
};
