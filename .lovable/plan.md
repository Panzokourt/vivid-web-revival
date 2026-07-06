## Auto-invert για μεγάλα κείμενα (mix-blend difference)

Θα προσθέσουμε ένα utility που κάνει τα μεγάλα display texts να αντιστρέφονται αυτόματα ανάλογα με το τι είναι από πίσω τους — σκούρα γράμματα σε ανοιχτό φαίνονται σκούρα, σε σκούρο image γίνονται φωτεινά. Καμία χειροκίνητη ρύθμιση, δουλεύει και όταν αλλάξει η εικόνα.

### Πώς δουλεύει

`mix-blend-mode: difference` + `color: white` δίνει "photographic negative" εφέ: το κείμενο πάντα γίνεται το αντίθετο του pixel από κάτω. Πάνω σε ανοιχτό paper background → σχεδόν μαύρο. Πάνω σε σκούρη θάλασσα/hero → λευκό. Οι μεταβάσεις (μισό γράμμα σε ένα, μισό στο άλλο) διαβάζονται πάντα.

### Πού εφαρμόζεται

Μόνο στα τεράστια display numerals/wordmarks που "κόβονται" πάνω από εικόνες:

1. **FeaturedModels slides** — τα νούμερα 680 / 950 / 520 πάνω από τις hero εικόνες των μοντέλων.
2. **ModelHero** — το μεγάλο νούμερο μοντέλου στο hero της σελίδας μοντέλου.
3. **Footer** — το τεράστιο RIBALI wordmark στο κάτω μέρος (πέφτει πάνω στο ink background — θα το αφήσουμε ως έχει αν είναι ήδη ενιαίο, αλλιώς θα μπει και εκεί).
4. **Hero** (αρχική) — το κύριο display headline εφόσον υπερβαίνει την εικόνα.

Δεν αγγίζουμε: nav logo, body copy, small labels, buttons, eyebrow text, specs — αυτά έχουν ήδη σταθερό contrast.

### Τεχνικά

**`src/styles.css`** — νέο utility class:

```css
@utility text-invert-blend {
  color: #fff;
  mix-blend-mode: difference;
  isolation: isolate;
}
```

`isolation: isolate` στο κοντινότερο container ώστε το blend να "βλέπει" μόνο το section πίσω του, όχι όλη τη σελίδα (αποφεύγει παράξενα χρώματα από overlays/gradients πιο πάνω).

**Αλλαγές στα components** — αντικατάσταση του υπάρχοντος `text-outline text-paper` (ή σκούρου fill) με `text-invert-blend` στα σημεία της λίστας. Παράλληλα:
- αφαιρούμε το `bg-gradient-to-t from-ink/50` overlay από πάνω από τους αριθμούς στα FeaturedModels slides γιατί το difference blend το χρειάζεται καθαρό για σωστή αντιστροφή (ή το κρατάμε μόνο κάτω από τα labels, όχι κάτω από τον αριθμό).
- ορίζουμε `isolation: isolate` στο `.model-slide` και στο `ModelHero` wrapper.

### Fallback / edge cases

- `prefers-reduced-transparency` / παλιοί browsers: το `mix-blend-mode` έχει άριστη υποστήριξη· δεν χρειάζεται fallback.
- Δεν επηρεάζει accessibility tools (screen readers βλέπουν κανονικό κείμενο).
- Δεν αλλάζει το layout, μόνο το χρώμα rendering.

### Out of scope

- Δεν αλλάζουμε typography, μεγέθη, ή layout.
- Δεν εφαρμόζουμε το εφέ σε mικρά κείμενα ή paragraph text — εκεί το difference φαίνεται "νευρικό".
- Αν αργότερα θέλεις outline stroke ή glow σε άλλα σημεία, το βλέπουμε ξεχωριστά.
