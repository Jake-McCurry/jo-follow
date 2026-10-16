import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  clearRecentPage,
  getRecentPage,
  isSamePage,
  isTrackablePage,
  saveRecentPage,
  takeSessionResumePage,
} from "../src/hooks/use-recent-page.ts";

const originalStorage = globalThis.localStorage;
const originalSessionStorage = globalThis.sessionStorage;
const stored = new Map<string, string>();
const session = new Map<string, string>();

before(() => {
  globalThis.localStorage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => { stored.set(key, value); },
    removeItem: (key: string) => { stored.delete(key); },
  } as Storage;
  globalThis.sessionStorage = {
    getItem: (key: string) => session.get(key) ?? null,
    setItem: (key: string, value: string) => { session.set(key, value); },
    removeItem: (key: string) => { session.delete(key); },
  } as Storage;
});

after(() => {
  globalThis.localStorage = originalStorage;
  globalThis.sessionStorage = originalSessionStorage;
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

test("resume is offered at session start, not on later navigation or reload", () => {
  session.clear();
  saveRecentPage("/gf/a-heart-after-god");
  assert.equal(takeSessionResumePage(), "/gf/a-heart-after-god");
  saveRecentPage("/bible/John/3");
  assert.equal(takeSessionResumePage(), null);
  assert.equal(takeSessionResumePage(), null);
  session.clear(); // New tab session; the saved reading position remains.
  assert.equal(takeSessionResumePage(), "/bible/John/3");
});

test("an empty first session does not begin offering a banner mid-session", () => {
  session.clear();
  clearRecentPage();
  assert.equal(takeSessionResumePage(), null);
  saveRecentPage("/prayer");
  assert.equal(takeSessionResumePage(), null);
});