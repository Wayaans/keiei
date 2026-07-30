import { describe, expect, test } from "bun:test";

import keiei from "../extensions/index.ts";

describe("extension entry point", () => {
  test("exports a Pi extension factory", () => {
    expect(keiei).toBeFunction();
  });
});
