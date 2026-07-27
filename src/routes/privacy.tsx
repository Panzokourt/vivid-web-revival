import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LegalLayout } from "@/components/riboli/LegalLayout";

const SITE = "https://ribali.advize.gr";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Πολιτική Απορρήτου — RIBALI" },
      { name: "description", content: "Πολιτική απορρήτου και προστασίας προσωπικών δεδομένων της RIBALI (GDPR)." },
      { property: "og:title", content: "Πολιτική Απορρήτου — RIBALI" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/privacy` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/privacy` },
      { rel: "alternate", hrefLang: "el", href: `${SITE}/privacy` },
      { rel: "alternate", hrefLang: "en", href: `${SITE}/en/privacy` },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  if (isEn) {
    return (
      <LegalLayout title="Privacy Policy" updated="2026-07-27">
        <p>RIBALI ("we", "us") respects your privacy and processes your personal data in accordance with the EU General Data Protection Regulation (GDPR 2016/679) and Greek Law 4624/2019.</p>
        <h2>Data we collect</h2>
        <p>Contact details you submit through forms (name, email, phone), configuration details from the configurator, and anonymized usage analytics.</p>
        <h2>How we use it</h2>
        <p>To respond to quote requests, arrange test drives, deliver ordered boats, and improve the site.</p>
        <h2>Your rights</h2>
        <p>Access, rectification, deletion, restriction, portability, objection. Contact <a href="mailto:hello@ribali.gr">hello@ribali.gr</a>.</p>
        <h2>Retention</h2>
        <p>Lead data is kept for 24 months; purchase records for the legal period required by Greek tax law.</p>
        <p className="text-xs text-ink/50 mt-8"><em>Placeholder — final legal copy pending client approval.</em></p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Πολιτική Απορρήτου" updated="27/07/2026">
      <p>Η RIBALI («εμείς») σέβεται την ιδιωτικότητά σας και επεξεργάζεται τα προσωπικά σας δεδομένα σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων της ΕΕ (GDPR 2016/679) και τον Ν. 4624/2019.</p>
      <h2>Ποια δεδομένα συλλέγουμε</h2>
      <p>Στοιχεία επικοινωνίας από φόρμες (όνομα, email, τηλέφωνο), λεπτομέρειες παραμετροποίησης από τον configurator και ανωνυμοποιημένα analytics χρήσης.</p>
      <h2>Πώς τα χρησιμοποιούμε</h2>
      <p>Για να απαντήσουμε σε αιτήματα προσφοράς, να οργανώσουμε test drives, να παραδώσουμε σκάφη και να βελτιώνουμε το site.</p>
      <h2>Τα δικαιώματά σας</h2>
      <p>Πρόσβαση, διόρθωση, διαγραφή, περιορισμός, φορητότητα, εναντίωση. Επικοινωνία: <a href="mailto:hello@ribali.gr">hello@ribali.gr</a>.</p>
      <h2>Διατήρηση</h2>
      <p>Στοιχεία leads διατηρούνται 24 μήνες· στοιχεία αγορών σύμφωνα με τη φορολογική νομοθεσία.</p>
      <p className="text-xs text-ink/50 mt-8"><em>Placeholder — το τελικό νομικό κείμενο εκκρεμεί έγκριση.</em></p>
    </LegalLayout>
  );
}
