const beholdURL = "https://feeds.behold.so/VZspO7Dn2cl4gSoMPopd";
const publicationsGrid = document.querySelector("#publications-grid");
const publicationsStatus = document.querySelector("#publications-status");

const formatDate = (timestamp) => {
  if (!timestamp) return "Publicación reciente";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(timestamp));
};

const truncateText = (text, maxLength = 140) => {
  if (!text) return "Descubre esta publicación en nuestro Instagram.";
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength).trim()}...`;
};

const getMediaLabel = (post) => {
  if (post.mediaType === "VIDEO") {
    return post.isReel ? "Reel" : "Video";
  }

  if (post.mediaType === "CAROUSEL_ALBUM") {
    return "Carrusel";
  }

  return "Foto";
};

const getMediaSource = (post) => {
  if (post.mediaType === "VIDEO") {
    return post.thumbnailUrl || post.sizes?.medium?.mediaUrl || post.sizes?.small?.mediaUrl || post.mediaUrl;
  }

  if (post.mediaType === "CAROUSEL_ALBUM") {
    const firstChild = post.children?.[0];
    return (
      firstChild?.sizes?.medium?.mediaUrl ||
      firstChild?.sizes?.small?.mediaUrl ||
      firstChild?.mediaUrl ||
      post.sizes?.medium?.mediaUrl ||
      post.mediaUrl
    );
  }

  return post.sizes?.medium?.mediaUrl || post.sizes?.small?.mediaUrl || post.mediaUrl;
};

const createPublicationCard = (post) => {
  const article = document.createElement("article");
  article.className = "publication-card";

  const imageUrl = getMediaSource(post);
  const caption = truncateText(post.prunedCaption || post.caption);
  const likes = typeof post.likeCount === "number" ? post.likeCount : null;
  const comments = typeof post.commentsCount === "number" ? post.commentsCount : null;

  article.innerHTML = `
    <a class="publication-media" href="${post.permalink}" target="_blank" rel="noreferrer">
      <img src="${imageUrl}" alt="" loading="lazy">
      <span class="publication-badge">${getMediaLabel(post)}</span>
    </a>
    <div class="publication-content">
      <div class="publication-meta">
        <span>${formatDate(post.timestamp)}</span>
        <span>@${post.username || "aeternamomentos"}</span>
      </div>
      <p class="publication-caption">${caption}</p>
      <div class="publication-footer">
        <div class="publication-stats">
          ${likes !== null ? `<span><span class="material-symbols-outlined filled">favorite</span>${likes}</span>` : ""}
          ${comments !== null ? `<span><span class="material-symbols-outlined">chat_bubble</span>${comments}</span>` : ""}
        </div>
        <a class="publication-link" href="${post.permalink}" target="_blank" rel="noreferrer">
          Ver en Instagram
          <span class="material-symbols-outlined">arrow_outward</span>
        </a>
      </div>
    </div>
  `;

  return article;
};

const renderPublications = (posts = [], username = "") => {
  publicationsGrid.innerHTML = "";

  if (!posts.length) {
    publicationsStatus.textContent = "No hay publicaciones disponibles en este momento.";
    publicationsStatus.hidden = false;
    return;
  }

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    fragment.appendChild(
      createPublicationCard({
        ...post,
        username,
      })
    );
  });

  publicationsGrid.appendChild(fragment);
  publicationsStatus.hidden = true;
};

const getDATA = async () => {
  try {
    publicationsStatus.hidden = false;
    publicationsStatus.textContent = "Cargando publicaciones...";

    const response = await fetch(beholdURL);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];

    renderPublications(posts, data.username);
  } catch (error) {
    console.error("No fue posible cargar las publicaciones:", error);
    publicationsGrid.innerHTML = "";
    publicationsStatus.hidden = false;
    publicationsStatus.textContent =
      "No fue posible cargar las publicaciones. Intenta de nuevo en unos minutos.";
  }
};

getDATA();
