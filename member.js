const MEMBER_API_ENDPOINT = "https://6p2p5n7k7s.microcms.io/api/v1/member";
const API_KEY = "vazE9HdnmvlhzQfPV8wAdd6g32suXSXAdhN1";

const memberGrid = document.querySelector("#member-grid");
const memberTemplate = document.querySelector("#member-card-template");

function buildImageUrl(value, width = 900, height = 1125) {
  if (!value) {
    return "";
  }

  const rawUrl = typeof value === "string" ? value : value.url;
  if (!rawUrl) {
    return "";
  }

  const joiner = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${joiner}w=${width}&h=${height}&fit=crop`;
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

async function fetchMembers() {
  const headers = API_KEY ? { "X-MICROCMS-API-KEY": API_KEY } : {};
  const response = await fetch(`${MEMBER_API_ENDPOINT}?limit=100`, { headers });

  if (!response.ok) {
    throw new Error(`microCMS request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.contents || !Array.isArray(data.contents)) {
    throw new Error("member contents is invalid");
  }

  return data.contents;
}

function renderMembers(items) {
  memberGrid.innerHTML = "";

  items.forEach((item) => {
    const fragment = memberTemplate.content.cloneNode(true);
    const image = fragment.querySelector(".member-image");
    const nameJp = fragment.querySelector(".member-name-jp");
    const nameEn = fragment.querySelector(".member-name-en");
    const profile = fragment.querySelector(".member-profile");

    const jp = item.member_jp || "";
    const en = item.member_en || "";
    const profileText = item.member_profile || "";
    const imageUrl = buildImageUrl(item.member_img);

    applyImageTransition(image, imageUrl, jp || en || "member");
    nameJp.textContent = jp;
    nameEn.textContent = en;
    profile.textContent = profileText;

    memberGrid.appendChild(fragment);
  });

  if (window.enableCharacterHoverContent) {
    window.enableCharacterHoverContent(".member-profile");
  }
}

async function init() {
  try {
    const members = await fetchMembers();
    renderMembers(members);
  } catch (error) {
    console.error(error);
    memberGrid.innerHTML = "仲間データの取得に失敗しました";
  }
}

init();
