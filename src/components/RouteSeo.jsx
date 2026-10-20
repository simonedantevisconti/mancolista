import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://mancolista.site";
const DEFAULT_TITLE = "MancoLista | Carte mancanti, doppie e collezioni online";
const DEFAULT_DESCRIPTION =
  "Gestisci le tue collezioni di carte e figurine con MancoLista: segna le possedute, trova le mancanti, conta le doppie e condividi le tue liste.";

const pageMetadata = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, indexable: true },
  "/privacy": {
    title: "Privacy Policy | MancoLista",
    description: "Consulta l'informativa sulla privacy di MancoLista e scopri come vengono trattati i dati personali.",
    indexable: true,
  },
  "/cookie": {
    title: "Cookie Policy | MancoLista",
    description: "Leggi la Cookie Policy di MancoLista e le informazioni sui cookie tecnici e sulle tecnologie utilizzate.",
    indexable: true,
  },
};

function setMeta(selector, attribute, content) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const [nameType, nameValue] = attribute;
    tag.setAttribute(nameType, nameValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const page = pageMetadata[normalizedPath] ?? {
      title: "Area riservata | MancoLista",
      description: "Gestisci le tue collezioni personali su MancoLista.",
      indexable: false,
    };

    document.title = page.title;
    setMeta('meta[name="description"]', ["name", "description"], page.description);
    setMeta('meta[name="robots"]', ["name", "robots"], page.indexable ? "index, follow, max-image-preview:large" : "noindex, nofollow");
    setMeta('meta[name="googlebot"]', ["name", "googlebot"], page.indexable ? "index, follow" : "noindex, nofollow");
    setMeta('meta[property="og:title"]', ["property", "og:title"], page.title);
    setMeta('meta[property="og:description"]', ["property", "og:description"], page.description);
    setMeta('meta[name="twitter:title"]', ["name", "twitter:title"], page.title);
    setMeta('meta[name="twitter:description"]', ["name", "twitter:description"], page.description);

    const url = BASE_URL + normalizedPath;
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (page.indexable) {
      if (canonical) canonical.setAttribute("href", url);
      setMeta('meta[property="og:url"]', ["property", "og:url"], url);
    } else {
      canonical?.remove();
      setMeta('meta[property="og:url"]', ["property", "og:url"], BASE_URL + "/");
    }
  }, [pathname]);

  return null;
}

export default RouteSeo;
