export function decolorizeText(str: string): string {
  return str.replace(/\^\d/g, '');
}
