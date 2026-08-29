function toHoverSpans(text, className) {
  const fragment = document.createDocumentFragment();

  for (const char of text) {
    const span = document.createElement("span");
    span.className = className;
    span.setAttribute("aria-hidden", "true");
    span.textContent = char === " " ? "\u00a0" : char;
    fragment.appendChild(span);
  }

  return fragment;
}

function enableCharacterHover(selector) {
  const targets = document.querySelectorAll(selector);

  targets.forEach((target) => {
    if (target.dataset.charHoverReady === "1") {
      return;
    }

    const rawText = target.textContent || "";
    if (!rawText) {
      return;
    }

    target.setAttribute("aria-label", rawText.trim());
    target.textContent = "";
    target.appendChild(toHoverSpans(rawText, "char-hover-char"));

    target.classList.add("char-hover-ready");
    target.dataset.charHoverReady = "1";
  });
}

function enableCharacterHoverContent(selector) {
  const roots = document.querySelectorAll(selector);

  roots.forEach((root) => {
    if (root.dataset.charHoverContentReady === "1") {
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue || "";
      const parent = node.parentElement;

      if (!text.trim()) {
        continue;
      }

      if (!parent) {
        continue;
      }

      if (parent.closest("script, style, .char-hover-char, .char-hover-content-char")) {
        continue;
      }

      textNodes.push(node);
    }

    textNodes.forEach((node) => {
      const text = node.nodeValue || "";
      node.replaceWith(toHoverSpans(text, "char-hover-content-char"));
    });

    root.dataset.charHoverContentReady = "1";
  });
}

window.enableCharacterHover = enableCharacterHover;
window.enableCharacterHoverContent = enableCharacterHoverContent;

document.addEventListener("DOMContentLoaded", () => {
  enableCharacterHover("[data-char-hover]");
});
