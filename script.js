const API_ENDPOINT = "https://6p2p5n7k7s.microcms.io/api/v1/works";
const API_KEY = "vazE9HdnmvlhzQfPV8wAdd6g32suXSXAdhN1";

const worksGrid = document.querySelector("#works-grid");
const cardTemplate = document.querySelector("#work-card-template");

function buildThumbUrl(value) {
  if (!value) {
    return "";
  }

  const rawUrl = typeof value === "string" ? value : value.url;
  if (!rawUrl) {
    return "";
  }

  const hasQuery = rawUrl.includes("?");
  const joiner = hasQuery ? "&" : "?";
  return `${rawUrl}${joiner}w=1200&h=675&fit=crop`;
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

function renderWorks(items) {
  worksGrid.innerHTML = "";

  items.forEach((item) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".work-card");
    const thumb = fragment.querySelector(".work-thumb");
    const title = fragment.querySelector(".work-title");
    const subtitle = fragment.querySelector(".work-card-subtitle");
    const date = fragment.querySelector(".work-card-date");

    const workTitle = item.works_title || item.title || "Untitled";
    const workSubtitle = item.works_subtitle || "";
    const thumbUrl = buildThumbUrl(item.works_thumbnail || item.thumbnail);
    const workDate = item.works_data || item.date || "";
    const memberAccent = getMemberAccentColor(item.works_member || item.member);

    applyImageTransition(thumb, thumbUrl, workTitle);
    title.textContent = workTitle;
    subtitle.textContent = workSubtitle;
    subtitle.hidden = !workSubtitle;
    date.textContent = workDate;
    card.href = `./work.html?id=${encodeURIComponent(item.id || "")}`;
    card.style.setProperty("--member-accent", memberAccent || "transparent");
    card.classList.toggle("has-member-accent", Boolean(memberAccent));

    worksGrid.appendChild(fragment);
  });
}

async function fetchWorksFromMicroCms() {
  const headers = API_KEY ? { "X-MICROCMS-API-KEY": API_KEY } : {};
  const response = await fetch(API_ENDPOINT, { headers });

  if (!response.ok) {
    throw new Error(`microCMS request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.contents || !Array.isArray(data.contents)) {
    throw new Error("microCMS response does not include contents");
  }

  return data.contents;
}

async function init() {
  try {
    const works = await fetchWorksFromMicroCms();

    renderWorks(works);
  } catch (error) {
    console.error(error);
    worksGrid.innerHTML = "";
  }
}

init();
