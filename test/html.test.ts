import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { html, raw } from "../src/html.ts";

describe("html", () => {
  it("escapes interpolated strings", () => {
    assert.equal(
      html`<p title="${`"x"`}">${"<b>&</b>"}</p>`.value,
      '<p title="&quot;x&quot;">&lt;b&gt;&amp;&lt;/b&gt;</p>',
    );
  });

  it("does not escape trusted or nested markup", () => {
    assert.equal(html`<div>${raw("<b>a</b>")}${html`<i>${"<"}</i>`}</div>`.value, "<div><b>a</b><i>&lt;</i></div>");
  });

  it("joins arrays and drops empty values", () => {
    assert.equal(html`${["a", html`<br>`, "b"]}${null}${undefined}${false}${0}`.value, "a<br>b0");
  });
});
