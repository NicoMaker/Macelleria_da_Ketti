// ─────────────────────────────────────────────────────────────────────────────
// json-config.js — Config centrale dei JSON usati dal sito
//
// Obiettivo: negli altri file NON si scrive più `JsonPaths.get("footer.json")`
// o ternari simili. Si usa invece:
//   JsonConfig.paths.footer
//   JsonConfig.paths.progetti
//   JsonConfig.paths.palette
//
// Dipende da: json-paths.js (JsonPaths globale)
// ─────────────────────────────────────────────────────────────────────────────

const JsonConfig = (() => {
  // Qui cambi SOLO i nomi dei file JSON (se un domani li rinomini/sposti).
  const files = {
    progetti: "progetti.json",
    footer: "footer.json",
    palette: "palette.json",
  };

  const paths = {
    get progetti() {
      return JsonPaths.get(files.progetti);
    },
    get footer() {
      return JsonPaths.get(files.footer);
    },
    get palette() {
      return JsonPaths.get(files.palette);
    },
  };

  return { files, paths };
})();
