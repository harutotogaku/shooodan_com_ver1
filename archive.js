const ARCHIVE_API_ENDPOINT = "https://6p2p5n7k7s.microcms.io/api/v1/archive";
const API_KEY = "vazE9HdnmvlhzQfPV8wAdd6g32suXSXAdhN1";

const archiveListNode = document.querySelector("#archive-list");
const archiveTemplate = document.querySelector("#archive-item-template");
const viewToggleButton = document.querySelector("#archive-view-toggle");

function buildImageUrl(value, width = 1600, height = 900) {
  if (!value) {
    return "";
  }

  const rawUrl = typeof value === "string" ? value : value.url;
  if (!rawUrl) {
    return "";
  }

  const joiner = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${joiner}w=${width}&h=${height}&fit=max`;
}

function isPortraitImage(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const width = Number(value.width || 0);
  const height = Number(value.height || 0);
  return width > 0 && height > 0 && height > width;
}

function isPortraitGalleryCell(cell) {
  const img = cell.querySelector("img");

  if (!img) {
    return false;
  }

  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    return img.naturalHeight > img.naturalWidth;
  }

  return cell.dataset.portraitHint === "true";
}

function relayoutArchiveGallery(node) {
  const cells = Array.from(node.querySelectorAll(".archive-gallery-cell"));

  if (!cells.length) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const nextCell = cells[index + 1];
    const pairPortraits = nextCell && isPortraitGalleryCell(cell) && isPortraitGalleryCell(nextCell);
    const row = document.createElement("div");

    row.className = pairPortraits ? "archive-gallery-row is-pair" : "archive-gallery-row";
    row.appendChild(cell);

    if (pairPortraits) {
      row.appendChild(nextCell);
      index += 1;
    }

    fragment.appendChild(row);
  }

  node.innerHTML = "";
  node.appendChild(fragment);
}

function applyImageTransition(img, src, altText) {
  img.classList.add("image-fade");
  img.alt = altText || "";

  if (!src) {
    img.classList.add("is-failed");
    return;
  }

  const preloader = new Image();
  preloader.onload = () => {
    img.src = src;
    requestAnimationFrame(() => {
      img.classList.add("is-loaded");
    });
  };

  preloader.onerror = () => {
    img.classList.add("is-failed");
  };

  preloader.src = src;
}

function normalizeListField(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object") {
        return (
          item.member_jp ||
          item.member_en ||
          item.tag ||
          item.name ||
          item.title ||
          item.value ||
          ""
        );
      }

      return "";
    })
    .filter(Boolean);
}

function renderLabelList(node, items, prefix) {
  node.innerHTML = "";

  if (!items.length) {
    node.style.display = "none";
    return;
  }

  node.style.display = "flex";
  const head = document.createElement("li");
  head.className = "archive-meta-head";
  head.textContent = prefix;
  node.appendChild(head);

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
  });
}

function renderArchiveGallery(node, items, title) {
  node.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    node.style.display = "none";
    return;
  }

  node.style.display = "grid";
  items.forEach((item, index) => {
    const cell = document.createElement("div");
    const img = document.createElement("img");
    const portraitHint = isPortraitImage(item);

    cell.className = portraitHint ? "archive-gallery-cell is-portrait" : "archive-gallery-cell";
    cell.dataset.portraitHint = portraitHint ? "true" : "false";
    img.className = "archive-gallery-item";
    img.loading = "lazy";
    img.addEventListener("load", () => {
      cell.classList.toggle("is-portrait", img.naturalHeight > img.naturalWidth);
      relayoutArchiveGallery(node);
    });

    applyImageTransition(img, buildImageUrl(item, 1200, 1600), `${title} 画像 ${index + 1}`);

    cell.appendChild(img);
    node.appendChild(cell);
  });

  relayoutArchiveGallery(node);
}

function renderArchive(items) {
  archiveListNode.innerHTML = "";

  items.forEach((item) => {
    const fragment = archiveTemplate.content.cloneNode(true);
    const articleNode = fragment.querySelector(".archive-item");
    const thumb = fragment.querySelector(".archive-thumb");
    const titleNode = fragment.querySelector(".archive-title");
    const textNode = fragment.querySelector(".archive-text");
    const galleryNode = fragment.querySelector(".archive-gallery");
    const memberNode = fragment.querySelector(".archive-member");
    const tagNode = fragment.querySelector(".archive-tag");

    const title = item.archive_title || "Untitled";
    const text = item.archive_text || "";
    const anchorId = `archive-${item.id || title}`;

    articleNode.id = anchorId;

    applyImageTransition(thumb, buildImageUrl(item.archive_thumbnail, 1600, 900), title);
    titleNode.textContent = title;

    if (typeof text === "string" && text.trim().startsWith("<")) {
      textNode.innerHTML = text;
    } else {
      textNode.textContent = text;
    }

    renderArchiveGallery(galleryNode, item.archive_img, title);
    renderLabelList(memberNode, normalizeListField(item.archive_member), "仲間");
    renderLabelList(tagNode, normalizeListField(item.archive_tag), "タグ");

    articleNode.addEventListener("click", () => {
      if (!archiveListNode.classList.contains("is-card-view")) {
        return;
      }

      setArchiveView("block");
      requestAnimationFrame(() => {
        const target = document.getElementById(anchorId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    archiveListNode.appendChild(fragment);
  });

  if (window.enableCharacterHoverContent) {
    window.enableCharacterHoverContent(".archive-text, .archive-member, .archive-tag");
  }
}

function setArchiveView(mode) {
  const isCard = mode === "card";
  archiveListNode.classList.toggle("is-card-view", isCard);

  if (viewToggleButton) {
    viewToggleButton.textContent = isCard ? "縦で見る" : "カード一覧に戻る";
    viewToggleButton.setAttribute("aria-pressed", String(!isCard));
  }
}

function bindViewToggle() {
  if (!viewToggleButton) {
    return;
  }

  viewToggleButton.addEventListener("click", () => {
    const isCard = archiveListNode.classList.contains("is-card-view");
    setArchiveView(isCard ? "block" : "card");
  });
}

async function fetchArchive() {
  const headers = API_KEY ? { "X-MICROCMS-API-KEY": API_KEY } : {};
  const response = await fetch(`${ARCHIVE_API_ENDPOINT}?limit=100`, { headers });

  if (!response.ok) {
    throw new Error(`microCMS request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.contents || !Array.isArray(data.contents)) {
    throw new Error("archive contents is invalid");
  }

  return data.contents;
}

async function init() {
  try {
    bindViewToggle();
    setArchiveView("card");

    const items = await fetchArchive();
    renderArchive(items);
  } catch (error) {
    console.error(error);
    archiveListNode.textContent = "記録データの取得に失敗しました";
  }
}

init();
