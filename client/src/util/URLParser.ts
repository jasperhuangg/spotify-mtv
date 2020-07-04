/**
 * Parses ```key``` value from query in ```url```.
 */
export default function URLParser(url: string, key: string) {
  if (url.indexOf(key) === -1) return "";
  else return url.substring(url.indexOf(key) + key.length, url.length);
}
