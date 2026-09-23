import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  clearRecentPage,
  getRecentPage,
  isSamePage,
  isTrackablePage,
  saveRecentPage,
} from "../src/hooks/use-recent-page.ts";

const originalStorage = globalThis.localStorage;
const stored = new Map<string, string>();

before(() => {
  globalThis.localStorage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => { stored.set(key, value); },
    removeItem: (key: string) => { stored.delete(key); },
  } as Storage;
});

after(() => {
  globalThis.localStorage = originalStorage;
});

test("the saved page is available before visiting another page", () => {
  saveRecentPage("/adv/begin-the-adventure");
  assert.equal(getRecentPage(), "/adv/begin-the-adventure");
  saveRecentPage("/explore-articles");
  assert.equal(getRecentPage(), "/explore-articles");
  clearRecentPage();
  assert.equal(getRecentPage(), null);
});

test("the banner does not point to the current page, even with a trailing slash", () => {
  assert.equal(isSamePage("/gf/", "/gf"), true);
  assert.equal(isSamePage("/bible/John/3", "/bible/John/3?highlight=1"), true);
  assert.equal(isSamePage("/gf/one", "/gf/two"), false);
});

test("private or start pages do not replace the saved reading page", () => {
  assert.equal(isTrackablePage("/"), false);
  assert.equal(isTrackablePage("/message"), false);
  assert.equal(isTrackablePage("/admin/reactions"), false);
  assert.equal(isTrackablePage("/adv/begin-the-adventure"), true);
  assert.equal(isTrackablePage("/deeper/the-gift-of-eternal-life"), true);
});