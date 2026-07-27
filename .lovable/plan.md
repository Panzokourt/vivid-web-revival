## Remove the scroll-built 3D boat background

The homepage currently mounts `ThreeBackground` (a fixed-position Three.js scene that assembles a RIB as you scroll). Remove it so the page returns to its clean paper background.

### Changes
- `src/routes/index.tsx`
  - Remove the `ThreeBackground` import.
  - Remove the `mounted` state + `useEffect` (only used to gate `<ThreeBackground />`).
  - Remove `{mounted && <ThreeBackground />}` from the JSX.
- `src/components/riboli/ThreeBackground.tsx` — delete the file (no other importers).
- Leave `three` in `package.json` untouched (used elsewhere / low risk); no other components change.

### Verification
- Typecheck.
- Confirm `/` renders with the paper background and no canvas behind sections.
