export const formatXmlLikeString = (html: string): string => html.replace(/>\s+</g, '><').trim();
