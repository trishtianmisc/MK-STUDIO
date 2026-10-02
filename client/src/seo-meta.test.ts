import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("static SEO metadata", () => {
  it("uses the client-mandated page title and description", () => {
    expect(html).toContain(`<title>${SITE_TITLE}</title>`);
    expect(html).toContain(`name="description" content="${SITE_DESCRIPTION}"`);
  });

  it("mirrors the title and description into the social preview tags", () => {
    expect(html).toContain(`property="og:title" content="${SITE_TITLE}"`);
    expect(html).toContain(`property="og:description" content="${SITE_DESCRIPTION}"`);
    expect(html).toContain(`name="twitter:title" content="${SITE_TITLE}"`);
    expect(html).toContain(`name="twitter:description" content="${SITE_DESCRIPTION}"`);
    expect(html).toContain(`property="og:site_name" content="MK Studio Collective"`);
  });

  it("points the share image at a file that exists", () => {
    expect(html).toContain("/images/BG1.png");
    expect(html).not.toContain("BG1.webp");
  });
});
