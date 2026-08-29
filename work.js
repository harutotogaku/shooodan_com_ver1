const API_ENDPOINT = "https://6p2p5n7k7s.microcms.io/api/v1/works";
const API_KEY = "vazE9HdnmvlhzQfPV8wAdd6g32suXSXAdhN1";

const titleNode = document.querySelector("#work-title");
const subtitleNode = document.querySelector("#work-subtitle");
const dateNode = document.querySelector("#work-date");
const thumbNode = document.querySelector("#work-thumbnail");
const textNode = document.querySelector("#work-text");
const galleryNode = document.querySelector("#work-gallery");
const membersNode = document.querySelector("#work-members");
const tagsNode = document.querySelector("#work-tags");

function buildImageUrl(value, width = 1400, height = 788) {
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

function renderList(node, items) {
  node.innerHTML = "";
  if (items.length === 0) {
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
  });
}

function renderGallery(items) {
  galleryNode.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  items.forEach((item, index) => {
    const img = document.createElement("img");
    const src = buildImageUrl(item, 1200, 675);
    const altText = `${titleNode.textContent || "作品"} 画像 ${index + 1}`;
    img.loading = "lazy";
    img.className = "work-gallery-item";
    applyImageTransition(img, src, altText);
    galleryNode.appendChild(img);
  });
}

async function fetchWorkById(id) {
  const headers = API_KEY ? { "X-MICROCMS-API-KEY": API_KEY } : {};
  const response = await fetch(`${API_ENDPOINT}/${encodeURIComponent(id)}`, { headers });

  if (!response.ok) {
    throw new Error(`microCMS request failed: ${response.status}`);
  }

  return response.json();
}

function getMemberAccentColor(memberValue) {
  const candidates = Array.isArray(memberValue) ? memberValue : [memberValue];

  for (const candidate of candidates) {
    const value =
      typeof candidate === "string"
        ? candidate
        : candidate && typeof candidate === "object"
          ? candidate.member_jp || candidate.member_en || candidate.name || candidate.title || ""
          : "";

    if (!value) {
      continue;
    }

    const text = String(value);

    if (text.includes("井川")) {
      return "#d62828";
    }

    if (text.includes("高橋")) {
      return "#c9a200";
    }

    if (text.includes("徳保")) {
      return "#0000ff";
    }
  }

  return "";
}

function renderWork(work) {
  const title = work.works_title || "Untitled";
  const subtitle = work.works_subtitle || "";
  const thumbUrl = buildImageUrl(work.works_thumbnail, 1600, 900);
  const memberAccent = getMemberAccentColor(work.works_member);

  document.title = `集団 | ${title}`;
  titleNode.textContent = title;
  subtitleNode.textContent = subtitle;
  subtitleNode.hidden = !subtitle;
  dateNode.textContent = work.works_data || "";

  document.body.style.setProperty("--work-detail-accent", memberAccent || "transparent");

  applyImageTransition(thumbNode, thumbUrl, title);

  if (typeof work.works_text === "string" && work.works_text.trim().startsWith("<")) {
    textNode.innerHTML = work.works_text;
  } else {
    textNode.textContent = work.works_text || "";
  }

  renderGallery(work.works_img);
  renderList(membersNode, normalizeListField(work.works_member));
  renderList(tagsNode, normalizeListField(work.works_tag));

  if (window.enableCharacterHoverContent) {
    window.enableCharacterHoverContent("#work-text, #work-members, #work-tags");
  }
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    titleNode.textContent = "IDがありません";
    return;
  }

  try {
    const work = await fetchWorkById(id);
    renderWork(work);
  } catch (error) {
    console.error(error);
    titleNode.textContent = "作品データの取得に失敗しました";
  }
}

init();
