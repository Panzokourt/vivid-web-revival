import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LegalLayout } from "@/components/riboli/LegalLayout";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Πολιτική Cookies — RIBALI" },
      { name: "description", content: "Ποια cookies χρησιμοποιεί το ribali.advize.gr και πώς να τα διαχειριστείτε." },
      { property: "og:title", content: "Πολιτική Cookies — RIBALI" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/cookies` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/cookies` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/cookies` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/cookies` },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  if (isEn) {
    return (
      <LegalLayout title="Cookies Policy" updated="2026-07-27">
        <p>Cookies are small text files stored on your device. We use them to make the site work and to understand how it is used.</p>
        <h2>Categories</h2>
        <ul>
          <li><strong>Essential</strong> — session, language preference. Always on.</li>
          <li><strong>Analytics</strong> — anonymized page views to improve the site.</li>
          <li><strong>Marketing</strong> — none by default.</li>
        </ul>
        <h2>Managing cookies</h2>
        <p>You can clear or block cookies at any time in your browser settings. Blocking essentials may affect site functionality.</p>
        <p className="text-xs text-ink/50 mt-8"><em>Placeholder — final legal copy pending client approval.</em></p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Πολιτική Cookies" updated="27/07/2026">
      <p>Τα cookies είναι μικρά αρχεία κειμένου που αποθηκεύονται στη συσκευή σας. Τα χρησιμοποιούμε για να λειτουργεί το site και για να καταλαβαίνουμε πώς χρησιμοποιείται.</p>
      <h2>Κατηγορίες</h2>
      <ul>
        <li><strong>Απαραίτητα</strong> — session, προτίμηση γλώσσας. Πάντα ενεργά.</li>
        <li><strong>Analytics</strong> — ανώνυμα page views για βελτίωση του site.</li>
        <li><strong>Marketing</strong> — κανένα εξ ορισμού.</li>
      </ul>
      <h2>Διαχείριση cookies</h2>
      <p>Μπορείτε να διαγράψετε ή να αποκλείσετε cookies οποτεδήποτε από τις ρυθμίσεις του browser σας. Ο αποκλεισμός των απαραίτητων μπορεί να επηρεάσει τη λειτουργικότητα.</p>
      <p className="text-xs text-ink/50 mt-8"><em>Placeholder — το τελικό νομικό κείμενο εκκρεμεί έγκριση.</em></p>
    </LegalLayout>
  );
}
