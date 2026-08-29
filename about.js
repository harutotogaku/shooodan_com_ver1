const ABOUT_API_ENDPOINT = "https://6p2p5n7k7s.microcms.io/api/v1/about";
const API_KEY = "vazE9HdnmvlhzQfPV8wAdd6g32suXSXAdhN1";

const aboutTextNode = document.querySelector("#about-text");
const aboutMailNode = document.querySelector("#about-mail");
const aboutGalleryNode = document.querySelector("#about-gallery");

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

async function fetchAbout() {
  const headers = API_KEY ? { "X-MICROCMS-API-KEY": API_KEY } : {};
  const response = await fetch(ABOUT_API_ENDPOINT, { headers });

  if (!response.ok) {
    throw new Error(`microCMS request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.contents || !Array.isArray(data.contents) || data.contents.length === 0) {
    throw new Error("about contents is empty");
  }

  return data.contents[0];
}

function renderAbout(item) {
  const text = item.about_text || "";
  const mail = item.about_mail || "";
  const imageItems = Array.isArray(item.about_img) ? item.about_img : item.about_img ? [item.about_img] : [];

  aboutGalleryNode.innerHTML = "";

  imageItems.forEach((imageItem) => {
    const img = document.createElement("img");
    const src = buildImageUrl(imageItem, 1600, 900);
    img.src = src;
    img.alt = "集団について";
    img.className = "about-image";
    img.loading = "lazy";
    aboutGalleryNode.appendChild(img);
  });

  if (imageItems.length === 0) {
    aboutGalleryNode.hidden = true;
  } else {
    aboutGalleryNode.hidden = false;
  }

  if (typeof text === "string" && text.trim().startsWith("<")) {
    aboutTextNode.innerHTML = text;
  } else {
    aboutTextNode.textContent = text;
  }

  if (mail) {
    aboutMailNode.innerHTML = `相談はこちらから　mail：<a href="mailto:${mail}">${mail}</a>`;
  } else {
    aboutMailNode.textContent = "";
  }

  if (window.enableCharacterHoverContent) {
    window.enableCharacterHoverContent("#about-text");
  }
}

async function init() {
  try {
    const about = await fetchAbout();
    renderAbout(about);
  } catch (error) {
    console.error(error);
    aboutTextNode.textContent = "集団についてのデータ取得に失敗しました";
    aboutMailNode.textContent = "";
  }
}

init();
