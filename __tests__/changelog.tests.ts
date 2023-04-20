// import { describe, expect, test } from "@jest/globals";
// import { sum } from "./sum";

import { getMainTicket } from "../src/changelog";

describe("getMainTicket tests", () => {
  test("Extracts ticket if it exists", () => {
    const exampleBody = `B2X-123 Example ticket
    and the rest of the body`;
    const result = getMainTicket(exampleBody);
    const expected = {
      id: "B2X-123",
      url: "",
    };
    expect(result).toStrictEqual(expected);
  });
  test("Sets the url if specified", () => {
    const exampleBody = `B2X-123 Example ticket
    and the rest of the body`;
    const result = getMainTicket(exampleBody, "https://example.com/{{id}}");
    const expected = {
      id: "B2X-123",
      url: "https://example.com/B2X-123",
    };
    expect(result).toStrictEqual(expected);
  });
});
