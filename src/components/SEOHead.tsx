import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
  keywords?: string;
}

const SITE_NAME = "Kurdistan AI";
const DEFAULT_DESC = "Kurdistan AI is the first and largest artificial intelligence community in Kurdistan. Explore AI projects, ask questions, read tutorials, and connect with Kurdish AI developers.";
const DEFAULT_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/7HKgE5HYYOc2kQnwrUNNYt63kLm1/social-images/social-1772745656712-1000104485.webp";
const DEFAULT_KEYWORDS = "Kurdistan AI, Kurd AI, Kurdish AI, artificial intelligence Kurdistan, AI community Kurdistan, KurdistanAI, AI projects Kurdistan, AI Iraq, کوردستان ئەی ئای";

const SEOHead = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd,
  keywords = DEFAULT_KEYWORDS,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — The First AI Community in Kurdistan`;

  // Auto-generate canonical from current path if not provided
  const resolvedCanonical = canonical || `https://kurdistanai.app${window.location.pathname === '/' ? '' : window.location.pathname}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:alt", `${SITE_NAME} — AI Community in Kurdistan`);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:image:alt", `${SITE_NAME} — AI Community in Kurdistan`);

    if (noindex) {
      setMeta("name", "robots", "noindex,nofollow");
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    // Canonical - always set for proper indexing
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = resolvedCanonical;

    // JSON-LD
    const existingLd = document.querySelector('script[data-seo-ld]');
    if (existingLd) existingLd.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-ld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const ld = document.querySelector('script[data-seo-ld]');
      if (ld) ld.remove();
    };
  }, [fullTitle, description, resolvedCanonical, ogImage, ogType, noindex, jsonLd, keywords]);

  return null;
};

export default SEOHead;
