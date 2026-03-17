// ─────────────────────────────────────────────────────────────────────────────
// json-paths.js — Utility unica per calcolare i path dei JSON
// Uso:
//   JsonPaths.get("progetti.json")  -> "JSON/progetti.json" oppure "../JSON/progetti.json"
//   JsonPaths.get("footer.json")    -> "JSON/footer.json"   oppure "../JSON/footer.json"
//   JsonPaths.get("palette.json")   -> "JSON/palette.json"  oppure "../JSON/palette.json"
// ─────────────────────────────────────────────────────────────────────────────

const JsonPaths = (() => {
  function isInProjectsSubfolder() {
    return window.location.pathname.includes("/Projects/");
  }

  function get(jsonFilename) {
    if (!jsonFilename) throw new Error("JsonPaths.get: filename mancante");
    const prefix = isInProjectsSubfolder() ? "../JSON/" : "JSON/";
    return `${prefix}${jsonFilename}`;
  }

  return { get, isInProjectsSubfolder };
})();

