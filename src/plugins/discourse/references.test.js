// @flow

import {parseLinks, linksToReferences} from "./references";

describe("plugins/discourse/references", () => {
  describe("parseLinks", () => {
    it("does not error on empty string", () => {
      expect(parseLinks("")).toEqual([]);
    });
    it("does not error on non-html", () => {
      expect(parseLinks("foo bar")).toEqual([]);
    });
    it("does not pick up raw urls", () => {
      expect(parseLinks("https://www.google.com")).toEqual([]);
    });
    it("picks up a (https://) hyperlink in href", () => {
      expect(parseLinks(`<a href="https://www.google.com">A Link</a>`)).toEqual(
        ["https://www.google.com"]
      );
    });
    it("picks up a (http://) hyperlink in href", () => {
      expect(parseLinks(`<a href="http://www.google.com">A Link</a>`)).toEqual([
        "http://www.google.com",
      ]);
    });
    it("doesn't pick up anchor hrefs", () => {
      expect(parseLinks(`<a href="#foo">A Link</a>`)).toEqual([]);
    });
  });

  describe("linksToReferences", () => {
    it("works for topics", () => {
      const hyperlinks = [
        "https://sourcecred-test.discourse.group/t/123-a-post-with-numbers-in-slug/20",
        "https://sourcecred-test.discourse.group/t/123-a-post-with-numbers-in-slug/20/",
        "https://sourcecred-test.discourse.group/t/123-a-post-with-numbers-in-slug/20?u=d11",
      ];
      const reference = {
        type: "TOPIC",
        topicId: 20,
        serverUrl: "https://sourcecred-test.discourse.group",
      };
      expect(linksToReferences(hyperlinks)).toEqual([
        reference,
        reference,
        reference,
      ]);
    });
    it("works for posts", () => {
      const hyperlinks = [
        "https://sourcecred-test.discourse.group/t/my-first-test-post/11/2?u=d11",
        "https://sourcecred-test.discourse.group/t/my-first-test-post/11/2/",
        "https://sourcecred-test.discourse.group/t/my-first-test-post/11/2",
      ];
      const reference = {
        type: "POST",
        topicId: 11,
        postIndex: 2,
        serverUrl: "https://sourcecred-test.discourse.group",
      };
      expect(linksToReferences(hyperlinks)).toEqual([
        reference,
        reference,
        reference,
      ]);
    });
    it("works for mentions", () => {
      const hyperlinks = ["https://sourcecred-test.discourse.group/u/d11"];
      const reference = {
        type: "USER",
        username: "d11",
        serverUrl: "https://sourcecred-test.discourse.group",
      };
      expect(linksToReferences(hyperlinks)).toEqual([reference]);
    });
    it("doesn't find bad or malformed references", () => {
      const hyperlinks = [
        // Not a reference to anything in particular.
        "https://sourcecred-test.discourse.group",
        // No https == no go. We can be more permissive if needed.
        "sourcecred-test.discourse.group/t/foo/120",
        // There's a space at the front.
        " https://sourcecred-test.discourse.group/t/foo/120",
        // unexpected trailing stuff
        "https://sourcecred-test.discourse.group/t/foo/120$$",
      ];
      expect(linksToReferences(hyperlinks)).toEqual([]);
    });
  });
});
