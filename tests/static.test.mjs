import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
async function walk(dir) {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) result.push(...(await walk(p)));
    else result.push(p);
  }
  return result;
}
test("declared local modules, styles, images and reference links exist", async () => {
  for (const file of await walk("site")) {
    if (!/\.(js|css|html)$/.test(file)) continue;
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(
      /["'(](\.\/[\w./-]+\.(?:js|css|svg|png|jpg|json|md))["')]/g,
    )) {
      const target = resolve(dirname(file), match[1]);
      await assert.doesNotReject(
        access(target),
        `${file}: missing ${match[1]}`,
      );
    }
  }
});
