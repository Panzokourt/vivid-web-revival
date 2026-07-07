// CMS block schemas — drives the native (non-JSON) admin form.
// Any block not listed here falls back to raw JSON editing.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "url"
  | "image"
  | "list";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  rows?: number;
  help?: string;
  itemSchema?: Field[]; // for type="list"
  itemLabel?: (item: Record<string, unknown>, i: number) => string;
};

export type BlockSchema = {
  title: string; // Human-friendly title, e.g. "Hero (Home)"
  fields: Field[];
};

const eyebrow: Field = { key: "eyebrow", label: "Επικεφαλίδα (eyebrow)", type: "text" };
const title: Field = { key: "title", label: "Τίτλος", type: "textarea", rows: 2 };
const lede: Field = { key: "lede", label: "Εισαγωγή", type: "textarea", rows: 3 };

export const SCHEMAS: Record<string, BlockSchema> = {
  // ─── HOME ────────────────────────────────────────────────────────────────
  "home/hero": {
    title: "Home · Hero",
    fields: [
      { key: "sr_heading", label: "SEO H1 (μη ορατό)", type: "text" },
      eyebrow,
      { key: "title_lines", label: "Γραμμές τίτλου (μία ανά γραμμή)", type: "textarea", rows: 3 },
      { key: "top_right_word", label: "Λέξη επάνω δεξιά", type: "text" },
      { key: "mid_left_body", label: "Κείμενο κέντρο-αριστερά", type: "textarea", rows: 3 },
      { key: "bottom_right_body", label: "Κείμενο κάτω δεξιά", type: "textarea", rows: 2 },
      { key: "bottom_center_label", label: "Ετικέτα κάτω κέντρο", type: "text" },
      { key: "bottom_center_title", label: "Τίτλος κάτω κέντρο", type: "text" },
      { key: "cta_label", label: "Ετικέτα κουμπιού", type: "text" },
      { key: "cta_href", label: "Σύνδεσμος κουμπιού", type: "url" },
      { key: "image_key", label: "Εικόνα φόντου", type: "image" },
    ],
  },
  "home/stats": {
    title: "Home · Stats",
    fields: [
      {
        key: "items", label: "Στατιστικά", type: "list",
        itemLabel: (it) => (it.label as string) || (it.value as string) || "Στατιστικό",
        itemSchema: [
          { key: "value", label: "Τιμή", type: "text" },
          { key: "label", label: "Ετικέτα", type: "text" },
        ],
      },
    ],
  },
  "home/pillars": {
    title: "Home · Pillars",
    fields: [
      {
        key: "items", label: "Πυλώνες", type: "list",
        itemLabel: (it) => (it.title as string) || "Πυλώνας",
        itemSchema: [
          { key: "title", label: "Τίτλος", type: "text" },
          { key: "body", label: "Κείμενο", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  "home/heritage": {
    title: "Home · Heritage",
    fields: [
      eyebrow,
      title,
      { key: "intro", label: "Εισαγωγή", type: "textarea", rows: 3 },
      {
        key: "milestones", label: "Ορόσημα", type: "list",
        itemLabel: (it) => `${it.year ?? ""} — ${it.title ?? ""}`,
        itemSchema: [
          { key: "year", label: "Έτος", type: "number" },
          { key: "title", label: "Τίτλος", type: "text" },
          { key: "body", label: "Κείμενο", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  "home/experiences": {
    title: "Home · Experiences",
    fields: [
      eyebrow,
      title,
      {
        key: "items", label: "Εμπειρίες", type: "list",
        itemLabel: (it) => (it.title as string) || "Εμπειρία",
        itemSchema: [
          { key: "title", label: "Τίτλος", type: "text" },
          { key: "body", label: "Κείμενο", type: "textarea", rows: 3 },
          { key: "image_key", label: "Εικόνα", type: "image" },
        ],
      },
    ],
  },
  "home/featured_models": {
    title: "Home · Featured Models",
    fields: [
      eyebrow,
      title,
      {
        key: "items", label: "Μοντέλα", type: "list",
        itemLabel: (it) => (it.name as string) || "Μοντέλο",
        itemSchema: [
          { key: "slug", label: "Slug (π.χ. r-680)", type: "text" },
          { key: "name", label: "Όνομα", type: "text" },
          { key: "number", label: "Νούμερο", type: "text" },
          { key: "tagline", label: "Tagline", type: "text" },
          { key: "image_key", label: "Εικόνα", type: "image" },
        ],
      },
    ],
  },
  "home/anatomy": {
    title: "Home · Anatomy",
    fields: [
      eyebrow,
      title,
      { key: "image_key", label: "Εικόνα", type: "image" },
      {
        key: "hotspots", label: "Hotspots", type: "list",
        itemLabel: (it) => (it.label as string) || "Hotspot",
        itemSchema: [
          { key: "label", label: "Ετικέτα", type: "text" },
          { key: "body", label: "Κείμενο", type: "textarea", rows: 2 },
          { key: "x", label: "X (%)", type: "number" },
          { key: "y", label: "Y (%)", type: "number" },
        ],
      },
    ],
  },
  "home/tech_construction": {
    title: "Home · Tech & Construction",
    fields: [
      { key: "eyebrow_1", label: "Eyebrow 1", type: "text" },
      { key: "eyebrow_2", label: "Eyebrow 2", type: "text" },
      { key: "headline_word", label: "Λέξη τίτλου", type: "text" },
      { key: "overlay_word", label: "Λέξη overlay", type: "text" },
      { key: "overlay_number", label: "Αριθμός overlay", type: "text" },
      { key: "image_key", label: "Εικόνα", type: "image" },
      {
        key: "params", label: "Παράμετροι", type: "list",
        itemLabel: (it) => (it.label as string) || "Παράμετρος",
        itemSchema: [
          { key: "label", label: "Ετικέτα", type: "text" },
          { key: "value", label: "Τιμή", type: "text" },
        ],
      },
    ],
  },
  "home/dealers_cta": {
    title: "Home · Dealers CTA",
    fields: [
      eyebrow,
      title,
      { key: "body", label: "Κείμενο", type: "textarea", rows: 3 },
      { key: "cta_label", label: "Ετικέτα κουμπιού", type: "text" },
      { key: "cta_href", label: "Σύνδεσμος κουμπιού", type: "url" },
      { key: "marquee", label: "Marquee (φόντο)", type: "text" },
    ],
  },

  // ─── ABOUT ───────────────────────────────────────────────────────────────
  "about/hero": {
    title: "About · Hero",
    fields: [eyebrow, title, lede, { key: "image_key", label: "Εικόνα", type: "image" }],
  },
  "about/chapters": {
    title: "About · Chapters",
    fields: [
      eyebrow,
      title,
      {
        key: "items", label: "Κεφάλαια", type: "list",
        itemLabel: (it) => `${it.year ?? ""} — ${it.title ?? ""}`,
        itemSchema: [
          { key: "year", label: "Έτος", type: "text" },
          { key: "title", label: "Τίτλος", type: "text" },
          { key: "body", label: "Κείμενο", type: "textarea", rows: 4 },
          { key: "image_key", label: "Εικόνα", type: "image" },
        ],
      },
    ],
  },
  "about/values": {
    title: "About · Values",
    fields: [
      eyebrow,
      title,
      {
        key: "items", label: "Αξίες", type: "list",
        itemLabel: (it) => (it.title as string) || "Αξία",
        itemSchema: [
          { key: "index", label: "Δείκτης (π.χ. 01)", type: "text" },
          { key: "title", label: "Τίτλος", type: "text" },
          { key: "body", label: "Κείμενο", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  "about/team": {
    title: "About · Team",
    fields: [
      eyebrow,
      title,
      {
        key: "items", label: "Μέλη ομάδας", type: "list",
        itemLabel: (it) => (it.name as string) || "Μέλος",
        itemSchema: [
          { key: "name", label: "Όνομα", type: "text" },
          { key: "role", label: "Ρόλος", type: "text" },
          { key: "bio", label: "Βιογραφικό", type: "textarea", rows: 3 },
          { key: "initials", label: "Αρχικά", type: "text" },
          { key: "color", label: "Χρώμα (hex)", type: "text" },
        ],
      },
    ],
  },

  // ─── CONTACT ─────────────────────────────────────────────────────────────
  "contact/hero": { title: "Contact · Hero", fields: [eyebrow, title, lede] },
  "contact/channels": {
    title: "Contact · Channels",
    fields: [
      eyebrow,
      title,
      {
        key: "items", label: "Κανάλια", type: "list",
        itemLabel: (it) => (it.label as string) || "Κανάλι",
        itemSchema: [
          { key: "label", label: "Ετικέτα", type: "text" },
          { key: "lines", label: "Γραμμές (μία ανά γραμμή)", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  "contact/confirmation": {
    title: "Contact · Confirmation",
    fields: [
      eyebrow,
      title,
      { key: "body", label: "Κείμενο", type: "textarea", rows: 3 },
    ],
  },

  // ─── DEALERS ─────────────────────────────────────────────────────────────
  "dealers/hero": { title: "Dealers · Hero", fields: [eyebrow, title, lede] },

  // ─── CONFIGURATOR ────────────────────────────────────────────────────────
  "configurator/hero": { title: "Configurator · Hero", fields: [eyebrow, title, lede] },

  // ─── MODELS ──────────────────────────────────────────────────────────────
  "models/hero": { title: "Models · Hero", fields: [eyebrow, title, lede] },
  "models/items": {
    title: "Models · Grid",
    fields: [
      {
        key: "items", label: "Μοντέλα", type: "list",
        itemLabel: (it) => (it.name as string) || "Μοντέλο",
        itemSchema: [
          { key: "slug", label: "Slug", type: "text" },
          { key: "name", label: "Όνομα", type: "text" },
          { key: "number", label: "Νούμερο", type: "text" },
          { key: "tagline", label: "Tagline", type: "text" },
          { key: "image_key", label: "Εικόνα", type: "image" },
        ],
      },
    ],
  },
};

export function getSchema(page: string, key: string): BlockSchema | null {
  return SCHEMAS[`${page}/${key}`] ?? null;
}

// Default empty value per field type — used when adding a new list item.
export function emptyValue(field: Field): unknown {
  if (field.type === "list") return [];
  if (field.type === "number") return 0;
  return "";
}

export function emptyItem(itemSchema: Field[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const f of itemSchema) obj[f.key] = emptyValue(f);
  return obj;
}

// Options for the "New block" dialog.
export const SCHEMA_OPTIONS = Object.entries(SCHEMAS).map(([id, s]) => {
  const [page_slug, block_key] = id.split("/");
  return { id, page_slug, block_key, title: s.title };
});
