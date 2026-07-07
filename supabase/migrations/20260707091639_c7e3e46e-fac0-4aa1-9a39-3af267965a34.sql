
-- ============================================================
-- Seed page_blocks with existing site copy (idempotent)
-- ============================================================

INSERT INTO public.page_blocks (page_slug, block_key, content, published) VALUES

-- ============ HOME ============
('home', 'hero', jsonb_build_object(
  'eyebrow', 'Handcrafted',
  'title_lines', jsonb_build_array('Ribali', '680'),
  'top_right_word', 'Rib',
  'mid_left_body', E'Built by hand\non the shores\nof Greece',
  'bottom_right_body', E'Editorial performance craft\nfor open water',
  'bottom_center_label', 'Performance',
  'bottom_center_title', E'Deep-V\nHulls',
  'cta_label', 'Book',
  'cta_href', '#models',
  'image_key', 'hero.jpg',
  'sr_heading', 'RIBALI — Handcrafted RIB Boats from the Aegean'
), true),

('home', 'stats', jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('value', 25, 'suffix', '+', 'label', 'Years of craft'),
    jsonb_build_object('value', 500, 'suffix', '+', 'label', 'Boats delivered'),
    jsonb_build_object('value', 12, 'suffix', '', 'label', 'RIB models'),
    jsonb_build_object('value', 10, 'suffix', 'yr', 'label', 'Hull warranty')
  )
), true),

('home', 'pillars', jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('n', '01', 'title', 'ΠΟΙΟΤΗΤΑ', 'body', 'Χειροποίητη κατασκευή με ORCA Hypalon και υψηλά πρότυπα φινιρίσματος που αντέχουν στο Αιγαίο.'),
    jsonb_build_object('n', '02', 'title', 'ΑΠΟΔΟΣΗ', 'body', 'Σχεδιασμός Deep-V γάστρας για ταχύτητα, σταθερότητα και ασφάλεια σε κάθε κύμα.'),
    jsonb_build_object('n', '03', 'title', 'ΕΞΥΠΗΡΕΤΗΣΗ', 'body', 'Υποστήριξη από εξειδικευμένο δίκτυο αντιπροσώπων σε όλη την Ελλάδα.')
  )
), true),

('home', 'heritage', jsonb_build_object(
  'eyebrow', 'Heritage',
  'title', E'A quarter century\non the water',
  'intro', 'Twenty-five years, five hundred hulls, one obsession — the way a boat behaves at speed in a Force 5.',
  'milestones', jsonb_build_array(
    jsonb_build_object('year', 2000, 'title', 'Founded on the Saronic coast', 'body', 'Two shipwrights, one shed, and a stubborn idea about hull geometry.'),
    jsonb_build_object('year', 2007, 'title', 'First deep-V RIBALI hull', 'body', 'Our signature 22° deadrise enters production. Dry, fast, unmistakable.'),
    jsonb_build_object('year', 2013, 'title', 'ORCA Hypalon partnership', 'body', 'We move to 1670 dtex tubes across the range. Ten-year UV rating, standard.'),
    jsonb_build_object('year', 2019, 'title', '500th boat delivered', 'body', 'Handed over to a family in Spetses. Same shipwrights, bigger shed.'),
    jsonb_build_object('year', 2025, 'title', 'R-950 flagship debuts', 'body', 'Our first 9.5m platform — twin outboards, cabin option, 40+ knot cruise.')
  )
), true),

('home', 'experiences', jsonb_build_object(
  'eyebrow', 'How it''s used',
  'title', 'Experiences',
  'items', jsonb_build_array(
    jsonb_build_object('image_key', 'hero.jpg', 'eyebrow', '01 — Day Charter', 'title', 'Sunrise-to-sunset island runs', 'body', 'Skip the crowds. Hop three coves before lunch, anchor where the ferries can''t reach.'),
    jsonb_build_object('image_key', 'model-r680.jpg', 'eyebrow', '02 — Family Cruise', 'title', 'Shaded, quiet, easy on-board', 'body', 'Bimini top, low freeboard, walk-around deck — designed for kids and grandparents alike.'),
    jsonb_build_object('image_key', 'model-r950.jpg', 'eyebrow', '03 — Dive & Snorkel', 'title', 'A working platform under you', 'body', 'Fold-down ladder, rinse shower, tank stowage. Back on-board without the drama.'),
    jsonb_build_object('image_key', 'model-r520.jpg', 'eyebrow', '04 — Sunset Aperitivo', 'title', 'The best table in the Aegean', 'body', 'Bow sunpad, cooler drawer, ambient deck lights. Cast off at seven, back by ten.')
  )
), true),

('home', 'anatomy', jsonb_build_object(
  'eyebrow', 'Anatomy of a RIB',
  'title', 'Built from four ideas',
  'image_key', 'anatomy-rib.jpg',
  'hotspots', jsonb_build_array(
    jsonb_build_object('id', 'hull', 'title', 'Deep-V hull', 'body', '22° deadrise, hand-laid GRP layup — planted through Aegean chop, dry at speed.', 'x', 45, 'y', 78),
    jsonb_build_object('id', 'tubes', 'title', 'ORCA Hypalon tubes', 'body', '1670 dtex fabric, hot-welded seams, 10-year UV rating. The industry benchmark.', 'x', 22, 'y', 62),
    jsonb_build_object('id', 'console', 'title', 'Driver-forward console', 'body', 'Wraparound windshield, glass helm, leaning-post seat as standard.', 'x', 48, 'y', 48),
    jsonb_build_object('id', 'deck', 'title', 'Modular deck', 'body', 'Bow sunpad, aft bench, stowage bays — reconfigured to how you actually use the boat.', 'x', 70, 'y', 55)
  )
), true),

('home', 'tech_construction', jsonb_build_object(
  'eyebrow_1', 'Technical parameters',
  'eyebrow_2', 'The width of the yacht 5.72 M',
  'headline_word', 'engine',
  'image_key', 'tech-detail.jpg',
  'overlay_number', '1 350',
  'overlay_word', 'berthve',
  'params', jsonb_build_array(
    jsonb_build_object('k', 'Total length', 'v', '19.96'),
    jsonb_build_object('k', 'Width', 'v', '5.72', 'suffix', 'M'),
    jsonb_build_object('k', 'Engine', 'v', 'Volvo IPS'),
    jsonb_build_object('k', 'Power', 'v', '1 350', 'suffix', 'HP'),
    jsonb_build_object('k', 'Berths', 'v', '6'),
    jsonb_build_object('k', 'Layout', 'v', 'three cabins and three latrines')
  )
), true),

('home', 'featured_models', jsonb_build_object(
  'eyebrow', 'The Collection',
  'title', 'Models',
  'items', jsonb_build_array(
    jsonb_build_object('to', '/models/r-680', 'image_key', 'model-r680.jpg', 'number', '680', 'name', 'R-680 Sport', 'length', '6.8 M', 'power', '250 HP', 'pax', '12', 'tag', 'Best Seller'),
    jsonb_build_object('to', '/models/r-950', 'image_key', 'model-r950.jpg', 'number', '950', 'name', 'R-950 Cruise', 'length', '9.5 M', 'power', '600 HP', 'pax', '16', 'tag', 'Flagship'),
    jsonb_build_object('to', '/models/r-520', 'image_key', 'model-r520.jpg', 'number', '520', 'name', 'R-520 Explore', 'length', '5.2 M', 'power', '115 HP', 'pax', '8', 'tag', 'Compact')
  )
), true),

('home', 'dealers_cta', jsonb_build_object(
  'eyebrow', 'Dealers Network',
  'title', E'Step aboard\nthe RIBALI family',
  'body', 'Find your nearest authorised partner and schedule a private sea trial across the Mediterranean and beyond.',
  'cta_label', 'Find a dealer',
  'cta_href', '/dealers',
  'marquee', 'FIND A DEALER · FIND A DEALER ·'
), true),

-- ============ ABOUT ============
('about', 'hero', jsonb_build_object(
  'eyebrow', 'About · Piraeus, Greece',
  'title', 'The boats we build.',
  'lede', 'Since 1998, RIBALI has been building rigid inflatable boats by hand in Piraeus. This is our story, our craft, and the people behind every hull.',
  'image_key', 'hero.jpg'
), true),

('about', 'values', jsonb_build_object(
  'eyebrow', 'What we hold onto',
  'title', 'Four principles that decide every hull.',
  'items', jsonb_build_array(
    jsonb_build_object('index', '01', 'title', 'Craft', 'body', 'Every hull is laid by hand in our Piraeus workshop. No shortcuts, no compromises — only the patience of people who have shaped fiberglass for three decades.'),
    jsonb_build_object('index', '02', 'title', 'Sea', 'body', 'The Aegean is our proving ground. We test in the meltemi, in the swell, in the salt — because a boat is only as honest as the water it has answered to.'),
    jsonb_build_object('index', '03', 'title', 'Precision', 'body', 'Millimeters matter. Deck angles, tube pressure, hull geometry — measured, re-measured, and refined until each detail earns its place on the water.'),
    jsonb_build_object('index', '04', 'title', 'Endurance', 'body', 'A RIBALI is built to outlast trends. We use marine-grade materials, over-engineered fittings, and finishes that age the way good things should.')
  )
), true),

('about', 'team', jsonb_build_object(
  'eyebrow', 'The people in the yard',
  'title', 'Small crew. Long tenure.',
  'items', jsonb_build_array(
    jsonb_build_object('initials', 'AR', 'color', '#0A1628', 'name', 'Andreas Riboli', 'role', 'Founder & Chief Designer', 'bio', 'Third-generation shipwright. Founded RIBALI in 1998 with a sketch and a stubborn belief in Greek craftsmanship.'),
    jsonb_build_object('initials', 'EM', 'color', '#B87A5A', 'name', 'Elena Marinaki', 'role', 'Head of Design', 'bio', 'Naval architect, ex-Ferretti. Leads the studio behind every RIBALI hull silhouette since 2014.'),
    jsonb_build_object('initials', 'NK', 'color', '#4A5D3A', 'name', 'Nikos Kavvadias', 'role', 'Master Craftsman', 'bio', 'Twenty-eight years on the shop floor. Signs off on every hull before it leaves the yard.')
  )
), true),

('about', 'chapters', jsonb_build_object(
  'eyebrow', 'Chapters',
  'title', 'A quarter century, told in three.',
  'items', jsonb_build_array(
    jsonb_build_object('year', '1998', 'title', 'The first hull.', 'body', 'RIBALI begins in a rented garage in Perama. Two brothers, one salvaged mold, and a friend from Aegina who needed a boat. He is still on the water. So is the boat.', 'image_key', 'hero.jpg'),
    jsonb_build_object('year', '2010', 'title', 'Open-sea DNA.', 'body', 'The shipyard doubles. We stop copying and start designing — Deep-V hulls, welded tubes, and a stubborn refusal to hurry. Word travels the way it does in a small industry: slowly, then all at once.', 'image_key', 'model-r680.jpg'),
    jsonb_build_object('year', '2026', 'title', 'The RIBALI line.', 'body', 'R-520, R-680, R-950 — three hulls, one philosophy. Fewer than eighty boats a year, each one carrying the name of the person who finished her deck.', 'image_key', 'model-r950.jpg')
  )
), true),

-- ============ CONTACT ============
('contact', 'hero', jsonb_build_object(
  'eyebrow', 'Contact · Piraeus, Greece',
  'title', 'Say hello.',
  'lede', 'Whether you want to book a sea trial, request a quote, or simply understand what makes a RIBALI hull, we would love to hear from you. Every message is read by a person in the yard.'
), true),

('contact', 'channels', jsonb_build_object(
  'eyebrow', 'Direct channels',
  'title', E'Come by the yard,\nor drop us a line.',
  'items', jsonb_build_array(
    jsonb_build_object('label', 'Shipyard', 'lines', jsonb_build_array('Akti Themistokleous 142', 'Piraeus 18538, Greece')),
    jsonb_build_object('label', 'Phone', 'lines', jsonb_build_array('+30 210 000 0000', 'Mon–Fri · 09:00 – 18:00 EET')),
    jsonb_build_object('label', 'Email', 'lines', jsonb_build_array('hello@ribali.gr', 'press@ribali.gr'))
  )
), true),

('contact', 'confirmation', jsonb_build_object(
  'eyebrow', 'Message received',
  'title', 'Thank you.',
  'body', 'A member of the RIBALI team will reply within one working day. For urgent requests, please call the shipyard directly.'
), true),

-- ============ DEALERS ============
('dealers', 'hero', jsonb_build_object(
  'eyebrow', 'Dealers · Mediterranean & beyond',
  'title', 'Find a dealer.',
  'lede', 'Nine authorised partners across the Mediterranean and the Gulf. Every dealer is a working shipyard — sea trials, deliveries, and after-sales, in the hands of people who know these hulls by touch.'
), true),

-- ============ CONFIGURATOR ============
('configurator', 'hero', jsonb_build_object(
  'eyebrow', 'Configurator',
  'title', 'Configure your RIBALI',
  'lede', 'Choose your hull, engine, tubes and finishes. Every configuration is quoted by hand by the Piraeus yard within one working day.'
), true),

-- ============ MODELS INDEX ============
('models', 'hero', jsonb_build_object(
  'eyebrow', 'The Collection · Three hulls, one philosophy',
  'title', 'The collection.',
  'lede', 'Three deep-V hulls, laid by hand in Piraeus. Fewer than eighty boats a year. Each one signed by the craftsman who finished her deck.'
), true),

('models', 'items', jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('slug', 'r-520', 'index', '01', 'name', 'R-520 Explore', 'length', '5.2 M', 'power', '115 HP', 'pax', '8', 'image_key', 'model-r520.jpg', 'body', 'The nimble one. Built for coves, quick runs, and days you decide on a whim. A short hull with the full RIBALI hand-lay on every layer.'),
    jsonb_build_object('slug', 'r-680', 'index', '02', 'name', 'R-680 Sport', 'length', '6.8 M', 'power', '250 HP', 'pax', '12', 'image_key', 'model-r680.jpg', 'body', 'The one most families come back for. A deep-V open hull with room for twelve, tuned for open Aegean crossings and long lunches at anchor.'),
    jsonb_build_object('slug', 'r-950', 'index', '03', 'name', 'R-950 Cruise', 'length', '9.5 M', 'power', '600 HP', 'pax', '16', 'image_key', 'model-r950.jpg', 'body', 'The flagship. Twin-console, bow cabin, welded ORCA Hypalon tubes. Built for owners who read weather charts before dinner menus.')
  )
), true)

ON CONFLICT (page_slug, block_key) DO NOTHING;

-- ============================================================
-- Seed dealers table if empty
-- ============================================================

INSERT INTO public.dealers (name, city, country, phone, email, website, lat, lng, order_index, active)
SELECT * FROM (VALUES
  ('RIBALI Piraeus — Flagship', 'Piraeus', 'Greece', '+30 210 000 0000', 'hello@ribali.gr', 'https://ribali.gr', 37.9420, 23.6465, 1, true),
  ('RIBALI Mykonos', 'Mykonos', 'Greece', '+30 22890 00000', 'mykonos@ribali.gr', 'https://ribali.gr', 37.4467, 25.3289, 2, true),
  ('RIBALI Rhodes', 'Rhodes', 'Greece', '+30 22410 00000', 'rhodes@ribali.gr', 'https://ribali.gr', 36.4341, 28.2176, 3, true),
  ('RIBALI Portofino', 'Portofino', 'Italy', '+39 0185 000000', 'portofino@ribali.eu', 'https://ribali.gr', 44.3037, 9.2098, 4, true),
  ('RIBALI Sardegna', 'Porto Cervo', 'Italy', '+39 0789 000000', 'sardegna@ribali.eu', 'https://ribali.gr', 41.1372, 9.5320, 5, true),
  ('RIBALI Côte d''Azur', 'Cannes', 'France', '+33 4 93 00 00 00', 'cotedazur@ribali.eu', 'https://ribali.gr', 43.5528, 7.0174, 6, true),
  ('RIBALI Palma', 'Palma de Mallorca', 'Spain', '+34 971 000 000', 'palma@ribali.eu', 'https://ribali.gr', 39.5696, 2.6502, 7, true),
  ('RIBALI Split', 'Split', 'Croatia', '+385 21 000 000', 'split@ribali.eu', 'https://ribali.gr', 43.5081, 16.4402, 8, true),
  ('RIBALI Dubai', 'Dubai', 'UAE', '+971 4 000 0000', 'dubai@ribali.ae', 'https://ribali.gr', 25.0762, 55.1339, 9, true)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM public.dealers LIMIT 1);
