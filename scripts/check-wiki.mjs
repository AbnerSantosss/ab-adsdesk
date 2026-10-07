import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../wiki');
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (extname(path) === '.md') files.push(path);
  }
}
await walk(root);
files.sort();
const pages = await Promise.all(files.map(async (path) => ({
  path, slug: basename(path, '.md'), name: relative(root, path).replaceAll('\\', '/'),
  text: await readFile(path, 'utf8'), incoming: new Set(), outgoing: new Set(),
})));
const bySlug = new Map();
const byPath = new Map(pages.map((page) => [page.path, page]));
const issues = { duplicateSlugs: [], frontmatter: [], brokenLinks: [], brokenAnchors: [], brokenMarkdownLinks: [], orphans: [], unreachable: [] };
const normalizeHeading = (value) => value.replace(/[*_`]/g, '').trim().toLocaleLowerCase('pt-BR');
const headingSlug = (value) => normalizeHeading(value).replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
for (const page of pages) {
  if (bySlug.has(page.slug)) issues.duplicateSlugs.push(page.name);
  bySlug.set(page.slug, page);
  const frontmatter = page.text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!frontmatter || !/^tipo:\s*\S.+$/m.test(frontmatter) || !/^atualizado:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(frontmatter) || !/^tags:\s*\[[^\]\r\n]+\]\s*$/m.test(frontmatter)) {
    issues.frontmatter.push(page.name);
  }
  page.body = page.text.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  page.headings = new Set([...page.body.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)].map((match) => normalizeHeading(match[1])));
}
let links = 0;
let markdownLinks = 0;
for (const page of pages) {
  const linkText = page.body.replace(/`+[^`]*`+/g, '');
  for (const match of linkText.matchAll(/\[\[([^\]\n]+)\]\]/g)) {
    links += 1;
    const [target] = match[1].split('|');
    const hash = target.indexOf('#');
    const slug = hash < 0 ? target : target.slice(0, hash);
    const anchor = hash < 0 ? '' : target.slice(hash + 1);
    const destination = slug ? bySlug.get(slug.replace(/\.md$/, '')) : page;
    if (!destination) { issues.brokenLinks.push(`${page.name}: [[${match[1]}]]`); continue; }
    if (anchor && !destination.headings.has(normalizeHeading(anchor))) issues.brokenAnchors.push(`${page.name}: [[${match[1]}]]`);
    if (page !== destination) { page.outgoing.add(destination.slug); destination.incoming.add(page.slug); }
  }
  // External references are deliberately not fetched: this checks the local documentation graph.
  for (const match of linkText.matchAll(/(?<!!)\[[^\]\n]+\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)) {
    const target = match[1] ?? match[2];
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
    markdownLinks += 1;
    let decoded;
    try { decoded = decodeURIComponent(target); } catch { issues.brokenMarkdownLinks.push(`${page.name}: ${target}`); continue; }
    const [file, anchor = ''] = decoded.split('#', 2);
    const path = file ? resolve(dirname(page.path), file) : page.path;
    const destination = byPath.get(path);
    if (!await stat(path).then((entry) => entry.isFile()).catch(() => false)) {
      issues.brokenMarkdownLinks.push(`${page.name}: ${target}`);
      continue;
    }
    if (destination && anchor && ![...destination.headings].some((heading) => headingSlug(heading) === anchor)) {
      issues.brokenAnchors.push(`${page.name}: ${target}`);
    }
    if (destination && page !== destination) { page.outgoing.add(destination.slug); destination.incoming.add(page.slug); }
  }
}
const reachable = new Set();
function visit(slug) {
  if (reachable.has(slug)) return;
  reachable.add(slug);
  for (const next of bySlug.get(slug)?.outgoing ?? []) visit(next);
}
visit('index');
for (const page of pages) {
  if (page.slug === 'index') continue;
  if (page.incoming.size === 0) issues.orphans.push(page.name);
  if (!reachable.has(page.slug)) issues.unreachable.push(page.name);
}
const errors = Object.values(issues).reduce((total, list) => total + list.length, 0);
console.log(JSON.stringify({ pages: pages.length, links, markdownLinks, ...issues, ok: errors === 0 }, null, 2));
process.exitCode = errors ? 1 : 0;
