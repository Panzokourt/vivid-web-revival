import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LegalLayout } from "@/components/riboli/LegalLayout";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Όροι Χρήσης — RIBALI" },
      { name: "description", content: "Όροι χρήσης της ιστοσελίδας ribali.advize.gr." },
      { property: "og:title", content: "Όροι Χρήσης — RIBALI" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/terms` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/terms` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/terms` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/terms` },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  if (isEn) {
    return (
      <LegalLayout title="Terms of Use" updated="2026-07-27">
        <h2>Scope</h2>
        <p>These terms govern your use of ribali.advize.gr and any interaction with RIBALI online.</p>
        <h2>Content</h2>
        <p>Prices, specs and images on the site are indicative. Final terms are agreed in a written offer prior to any purchase.</p>
        <h2>Intellectual property</h2>
        <p>All content is owned by RIBALI or its licensors. Unauthorized reproduction is prohibited.</p>
        <h2>Liability</h2>
        <p>The site is provided "as is". We are not liable for indirect damages resulting from use of the site.</p>
        <h2>Governing law</h2>
        <p>Greek law. Courts of Piraeus have exclusive jurisdiction.</p>
        <p className="text-xs text-ink/50 mt-8"><em>Placeholder — final legal copy pending client approval.</em></p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Όροι Χρήσης" updated="27/07/2026">
      <h2>Εύρος</h2>
      <p>Οι παρόντες όροι διέπουν τη χρήση του ribali.advize.gr και κάθε online επικοινωνία με τη RIBALI.</p>
      <h2>Περιεχόμενο</h2>
      <p>Τιμές, χαρακτηριστικά και εικόνες στο site είναι ενδεικτικά. Οι τελικοί όροι συμφωνούνται σε γραπτή προσφορά πριν από κάθε αγορά.</p>
      <h2>Πνευματική ιδιοκτησία</h2>
      <p>Όλο το περιεχόμενο ανήκει στη RIBALI ή στους δικαιοπάροχούς της. Απαγορεύεται η μη εξουσιοδοτημένη αναπαραγωγή.</p>
      <h2>Ευθύνη</h2>
      <p>Το site παρέχεται «ως έχει». Δεν φέρουμε ευθύνη για έμμεσες ζημιές από τη χρήση.</p>
      <h2>Εφαρμοστέο δίκαιο</h2>
      <p>Ελληνικό δίκαιο. Αρμόδια τα δικαστήρια Πειραιώς.</p>
      <p className="text-xs text-ink/50 mt-8"><em>Placeholder — το τελικό νομικό κείμενο εκκρεμεί έγκριση.</em></p>
    </LegalLayout>
  );
}
