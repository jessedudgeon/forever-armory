const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + "/playwright")
  : require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const server = require("node:child_process").spawn(process.execPath, [
    "dev-server.mjs",
    "--port",
    "4173",
  ]);
  await new Promise((r) => setTimeout(r, 700));
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {}),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [],
    failed = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) =>
    failed.push({ url: r.url(), error: r.failure().errorText }),
  );
  try {
    // Keep external authentication out of deterministic local UX tests. Cloud behavior is tested separately.
    await page.route("**/firebase-config.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: "export const firebaseConfig={};",
      }),
    );
    await page.route("https://unpkg.com/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          {
            itemId: 2770,
            name: "Copper Ore",
            quality: "Common",
            tooltip: [{ label: "Crafting reagent" }],
            class: "Trade Goods",
          },
          {
            itemId: 6220,
            name: "Meteor Shard",
            quality: "Rare",
            tooltip: [{ label: "Binds when picked up" }, { label: "Dagger" }],
          },
        ]),
      }),
    );
    await page.goto("http://localhost:4173/");
    await page.locator("h1").waitFor();
    assert.match(await page.title(), /Home/);
    await page.goto("http://localhost:4173/#roster");
    await page.locator("#new-game-account").click();
    await page.locator("#game-account-form [name=name]").fill("WoW 2");
    await page.locator("[name=legacyStatus]").fill("Status pending");
    await page.locator("#game-account-form button[type=submit]").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    await page.locator("#add-manual").click();
    await page.locator("[name=mainName]").fill("Asha");
    await page.locator("[name=secondaryName]").fill("Brightvale");
    await page.locator("[name=playStyle]").selectOption("Normal");
    await page.locator("[name=faction]").selectOption("Horde");
    assert.equal(
      await page.locator("[name=race] option[value=Human]").count(),
      0,
    );
    await page.locator("[name=race]").selectOption("Undead");
    await page.locator("[name=class]").selectOption("PALADIN");
    await page.locator("[name=level]").fill("13");
    await page
      .getByRole("button", { name: "Save character", exact: true })
      .click();
    await page.locator(".profile-hero").waitFor();
    const charHash = await page.evaluate(() => location.hash);
    await page.locator("#update-manual").click();
    await page.locator("[name=level]").fill("14");
    await page
      .getByRole("button", { name: "Save character", exact: true })
      .click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    assert.match(await page.locator(".profile-hero").innerText(), /Level 14/);
    await page.locator("#edit-notes").click();
    await page.locator("[name=notes]").fill("Private character story");
    await page.locator("#notes-form button").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    await page.locator("#import").click();
    const character = {
      mainName: "Asha",
      secondaryName: "Brightvale",
      playStyle: "Normal",
      class: "PALADIN",
      faction: "Horde",
      race: "Undead",
      level: 14,
      gear: [{ id: 6220, name: "Meteor Shard", slot: 16, quality: 3 }],
      inventory: [
        {
          id: 2770,
          name: "Copper Ore",
          quantity: 4,
          location: "backpack",
          slot: 1,
          quality: 1,
        },
        {
          id: 2770,
          name: "Copper Ore",
          quantity: 12,
          location: "bank",
          slot: 3,
          quality: 1,
        },
      ],
      storageStatus: { backpack: { captured: true }, bank: { captured: true } },
      professions: [{ name: "Blacksmithing", rank: 20, max: 75 }],
      recipes: [
        {
          id: "1",
          name: "Test craft",
          profession: "Blacksmithing",
          craftedItem: 6220,
          reagents: [{ id: 2770, quantity: 2 }],
        },
      ],
      progress: [
        { id: "onyxia", name: "Onyxia", type: "raid", completed: true },
      ],
    };
    await page
      .locator("#import-text")
      .fill(
        JSON.stringify({ format: "forever-armory", version: 1, character }),
      );
    await page.locator("#import-form button").click();
    assert.equal(
      await page.evaluate(() => localStorage.getItem("forever-inventory-v1")),
      null,
    );
    await page.locator("#save-import").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    assert.match(
      await page.locator("#main").innerText(),
      /Private character story/,
    );
    await page.locator("[data-tab=inventory]").click();
    await page.locator("[data-tab=inventory][aria-pressed=true]").waitFor();
    assert.equal(await page.locator("#inventory-results tbody tr").count(), 3);
    await page.locator("#inventory-duplicates").check();
    assert.equal(await page.locator("#inventory-results tbody tr").count(), 2);
    await page.locator("#inventory-location").selectOption("bank");
    assert.equal(await page.locator("#inventory-results tbody tr").count(), 1);
    await page.locator('[data-item-detail="2770"]').click();
    await page.locator("#item-detail-content h2").waitFor();
    assert.match(
      await page.locator("#item-detail-content").innerText(),
      /Copper Ore/,
    );
    await page.locator(".item-modal-close").click();
    await page.screenshot({
      path: "/tmp/forever-inventory.png",
      fullPage: true,
    });
    await page.locator("[data-tab=professions]").click();
    await page.locator("[data-tab=professions][aria-pressed=true]").waitFor();
    assert.match(await page.locator("#main").innerText(), /Test craft/);
    await page.locator("[data-tab=encounters]").click();
    await page.locator("[data-tab=encounters][aria-pressed=true]").waitFor();
    assert.match(await page.locator("#main").innerText(), /Onyxia/);
    await page.locator("#edit-progress").click();
    await page
      .locator("#progress-form [name=instance]")
      .selectOption("shadowfang-keep");
    await page.locator("#progress-form [name=status]").selectOption("Complete");
    await page.locator("#progress-form button").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    assert.match(await page.locator("#main").innerText(), /Shadowfang Keep/);
    await page.goto("http://localhost:4173/#guilds");
    await page.locator("#new-guild").click();
    await page.locator("#guild-form [name=name]").fill("The Keepers");
    await page
      .locator("#guild-form [name=description]")
      .fill("A friendly adventuring guild");
    await page.locator("#guild-form button").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    const guildHash = await page.evaluate(() => location.hash);
    await page.goto("http://localhost:4173/" + charHash);
    await page.locator("#update-manual").click();
    await page.locator("[name=guildId]").selectOption({ label: "The Keepers" });
    await page.locator("[name=guildRank]").fill("Officer");
    await page
      .getByRole("button", { name: "Save character", exact: true })
      .click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    await page.goto("http://localhost:4173/" + guildHash);
    assert.match(await page.locator("#main").innerText(), /Asha Brightvale/);
    await page.goto("http://localhost:4173/#talents/paladin/14");
    await page.locator(".talent-node").first().waitFor();
    await page
      .locator('[data-key="holy:divine-strength"][data-delta="1"]')
      .click();
    await page.locator('[data-info="holy:divine-strength"]').click();
    assert.match(
      await page.locator("#talent-tooltip").innerText(),
      /Next rank/,
    );
    await page.keyboard.press("Escape");
    await page
      .locator("#build-character")
      .selectOption({ label: "Asha Brightvale" });
    await page.locator("#build-name").fill("Tank plan");
    await page.locator("#talent-save").click();
    await page.waitForFunction(() =>
      document.querySelector("#talent-status")?.textContent.includes("saved"),
    );
    const rects = await page
      .locator(".talent-tree")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    assert.equal(new Set(rects).size, 1);
    await page.screenshot({
      path: "/tmp/forever-talents-verified.png",
      fullPage: true,
    });
    await page.goto("http://localhost:4173/" + charHash);
    await page.locator("[data-tab=profile]").click();
    await page.locator("[data-tab=profile][aria-pressed=true]").waitFor();
    assert.match(await page.locator("#main").innerText(), /Tank plan/);
    await page.screenshot({
      path: "/tmp/forever-armory-verified.png",
      fullPage: true,
    });
    await page.goto("http://localhost:4173/#dungeons");
    await page.locator("#dungeon-filter").selectOption("raids");
    assert.equal(await page.locator(".dungeon-card").count(), 2);
    await page.goto("http://localhost:4173/#dungeons/shadowfang-keep");
    await page.locator('[data-item-detail="6220"]').first().click();
    await page.locator("#item-detail-content h2").waitFor();
    assert.match(
      await page.locator("#item-detail-content").innerText(),
      /Meteor Shard/,
    );
    await page.locator(".item-modal-close").click();
    await page.goto("http://localhost:4173/#pve/hall-of-thanes");
    await page.locator("#loot-rows tr").first().waitFor();
    assert.equal(await page.locator("#loot-rows tr").count(), 17);
    await page.locator('[data-loot-filter="query"]').fill("Spiritwraith Drape");
    assert.equal(await page.locator("#loot-rows tr").count(), 1);
    await page.locator('#loot-rows [data-item-detail="271097"]').click();
    await page.locator("[data-journal-source]").first().click();
    await page.locator("#item-detail-modal").waitFor({ state: "hidden" });
    await page.waitForFunction(()=>document.querySelector("h1")?.textContent==="Faldrim Anvilmar");
    await page.goto("http://localhost:4173/#pve/hall-of-thanes/faldrim-anvilmar");
    await page.waitForFunction(()=>document.querySelector("h1")?.textContent==="Faldrim Anvilmar");
    await page.locator('[data-encounter="faldrim-anvilmar"]').check();
    await page.reload();
    await page.locator('[data-encounter="faldrim-anvilmar"]').waitFor();
    assert.equal(
      await page.locator('[data-encounter="faldrim-anvilmar"]').isChecked(),
      true,
    );
    await page.locator('[data-item-detail="271097"]').click();
    await page.locator("#item-detail-content h2").waitFor();
    assert.match(
      await page.locator("#item-detail-content").innerText(),
      /Spiritwraith Drape/,
    );
    await page.locator(".item-modal-close").click();
    await page.goto(
      "http://localhost:4173/#pve/shadowfang-keep/archmage-arugal",
    );
    assert.equal(await page.locator("h1").innerText(), "Archmage Arugal");
    await page.locator('[data-encounter="archmage-arugal"]').check();
    await page.goto("http://localhost:4173/#pve/missing/no-boss");
    assert.match(await page.locator("h1").innerText(), /not found/);
    await page.goto("http://localhost:4173/#search");
    await page.locator("#global-query").fill("Asha");
    await page.waitForFunction(() =>
      document.querySelector("#global-results").textContent.includes("Asha"),
    );
    await page.locator("#global-query").fill("Divine Strength");
    await page.waitForFunction(() =>
      document
        .querySelector("#global-results")
        .textContent.includes("Divine Strength"),
    );
    await page.goto("http://localhost:4173/#items/2770");
    await page.locator("#item-detail-content h2").waitFor();
    await page.locator(".item-modal-close").click();
    await page.reload();
    await page.locator("#item-detail-content h2").waitFor();
    await page.locator(".item-modal-close").click();
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "home",
        "roster",
        "talents/paladin",
        "guilds",
        "professions",
        "items",
        "dungeons",
        "pve/ruins-of-lordaeron/witherfang",
        "pve/hall-of-thanes",
        charHash.slice(1),
      ]) {
        await page.goto("http://localhost:4173/#" + route);
        await page.locator("h1").waitFor();
        await page.waitForTimeout(80);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `overflow ${route} ${width}`,
        );
        assert.equal(
          await page
            .locator("img")
            .evaluateAll(
              (imgs) =>
                imgs.filter(
                  (i) =>
                    i.hasAttribute("src") && i.complete && i.naturalWidth === 0,
                ).length,
            ),
          0,
          `broken image ${route}`,
        );
      }
      if (width === 390)
        await page.screenshot({
          path: "/tmp/forever-mobile.png",
          fullPage: true,
        });
    }
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          result: "PASS",
          flows: 25,
          viewports: [390, 768, 1280, 1440],
          pageErrors: errors,
          failedRequests: failed,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
