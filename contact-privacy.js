/**
 * contact-privacy.js
 * Drop this <script> before </body> in your index.html.
 * It scans the page for your email + phone and replaces them
 * with a "click to reveal" chip. No layout changes needed.
 */
(function () {
  const SENSITIVE = [
    {
      pattern: /aali\.abidkhan@gmail\.com/g,
      label: "📧 Reveal email",
      revealed: "aali.abidkhan@gmail.com",
      href: "mailto:aali.abidkhan@gmail.com",
    },
    {
      pattern: /\+33[-\s]?751\s?890\s?606/g,
      label: "📞 Reveal phone",
      revealed: "+33 751 890 606",
      href: "tel:+33751890606",
    },
  ];

  const CHIP_STYLE = `
    display:inline-block;
    cursor:pointer;
    background:#1a1a2e;
    color:#e2b96f;
    border:1px solid #e2b96f;
    border-radius:4px;
    padding:2px 10px;
    font-size:0.85em;
    font-family:inherit;
    letter-spacing:.03em;
    transition:background .2s,color .2s;
    user-select:none;
  `;

  function makeChip(item) {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.setAttribute("style", CHIP_STYLE);
    btn.setAttribute("aria-label", item.label);
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#e2b96f";
      btn.style.color = "#1a1a2e";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "#1a1a2e";
      btn.style.color = "#e2b96f";
    });
    btn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.revealed;
      link.style.cssText = "color:inherit;font-weight:600;";
      btn.replaceWith(link);
    });
    return btn;
  }

  function maskTextNode(node, item) {
    const text = node.nodeValue;
    if (!item.pattern.test(text)) return;
    item.pattern.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    item.pattern.lastIndex = 0;
    while ((m = item.pattern.exec(text)) !== null) {
      if (m.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      }
      frag.appendChild(makeChip(item));
      last = m.index + m[0].length;
    }
    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }
    node.parentNode.replaceChild(frag, node);
  }

  function walkDOM(root, item) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentNode && node.parentNode.tagName;
        // skip script/style/already-processed
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => maskTextNode(n, item));
  }

  // Also mask href attributes (mailto:, tel:)
  function maskHrefAttrs() {
    document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((a) => {
      const isMail = a.href.includes("aali.abidkhan");
      const isPhone = a.href.includes("751890606");
      if (!isMail && !isPhone) return;

      const item = isMail ? SENSITIVE[0] : SENSITIVE[1];
      const chip = makeChip(item);
      // preserve surrounding inline text if anchor is the only child
      a.replaceWith(chip);
    });
  }

  function run() {
    maskHrefAttrs();
    SENSITIVE.forEach((item) => walkDOM(document.body, item));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
