import { describe, it, expect } from "vitest";
import { renderMarkdownToHtml, sanitizeUrl, escapeHtml } from "../../lib/markdown";

describe("Markdown Rendering & XSS Sanitization Unit Tests", () => {
  it("escapes raw HTML tags to prevent XSS script execution", () => {
    const maliciousInput = '<script>alert("XSS Attack")</script>';
    const output = renderMarkdownToHtml(maliciousInput);

    expect(output).not.toContain("<script>");
    expect(output).not.toContain("</script>");
    expect(output).toContain("&lt;script&gt;alert(&quot;XSS Attack&quot;)&lt;/script&gt;");
  });

  it("sanitizes dangerous URL schemes in markdown links", () => {
    const maliciousLink = "[Click Me](javascript:alert(document.cookie))";
    const output = renderMarkdownToHtml(maliciousLink);

    expect(output).not.toContain("javascript:");
    expect(output).toContain("#unsafe-link-blocked");
  });

  it("blocks data: and vbscript: URLs", () => {
    expect(sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe(
      "#unsafe-link-blocked",
    );
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("#unsafe-link-blocked");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("#unsafe-link-blocked");
  });

  it("allows safe http:// and https:// URLs", () => {
    expect(sanitizeUrl("https://nodejs.org/en/docs")).toBe("https://nodejs.org/en/docs");
    expect(sanitizeUrl("http://localhost:3000/workspace")).toBe(
      "http://localhost:3000/workspace",
    );
  });

  it("renders headers, code blocks, lists, and bold formatting properly", () => {
    const markdown = `# Main Title
## Section Header
### Subtopic
- Point 1
- Point 2
**Bold Text** and *Italic Text* and \`const x = 42;\`
\`\`\`typescript
const a: number = 10;
\`\`\``;

    const html = renderMarkdownToHtml(markdown);

    expect(html).toContain("<h1");
    expect(html).toContain("Main Title");
    expect(html).toContain("<h2");
    expect(html).toContain("Section Header");
    expect(html).toContain("<h3");
    expect(html).toContain("Subtopic");
    expect(html).toContain("<ul");
    expect(html).toContain("Point 1");
    expect(html).toContain("<strong");
    expect(html).toContain("Bold Text");
    expect(html).toContain("<code");
    expect(html).toContain("const x = 42;");
    expect(html).toContain("<pre");
    expect(html).toContain("const a: number = 10;");
  });
});
