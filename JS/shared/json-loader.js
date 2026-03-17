// ─────────────────────────────────────────────────────────────────────────────
// json-loader.js — Loader unico per i JSON (cache + hook decrypt/transform)
//
// Uso:
//   JsonData.load("palette")  -> Promise<palette[]>
//   JsonData.load("footer")   -> Promise<footerObject>
//   JsonData.load("progetti") -> Promise<{ Prodotti: [...] }>
//
// Dipende da: json-config.js (JsonConfig), json-paths.js (JsonPaths)
// ─────────────────────────────────────────────────────────────────────────────

const JsonData = (() => {
  /** @type {Record<string, Promise<any>>} */
  const _promiseCache = {};

  // Hook “decrypt/transform”: per ora è identity.
  // Se in futuro cifri i JSON, modifichi SOLO qui.
  function _decryptOrTransform(payload, keyOrFilename) {
    return payload;
  }

  function _normalizeKey(keyOrFilename) {
    if (!keyOrFilename) throw new Error("JsonData.load: chiave mancante");

    // Se passi una chiave nota (palette/footer/progetti)
    if (JsonConfig.files[keyOrFilename]) return keyOrFilename;

    // Se passi direttamente "qualcosa.json", proviamo a mapparlo alle chiavi note
    const keys = Object.keys(JsonConfig.files);
    const found = keys.find((k) => JsonConfig.files[k] === keyOrFilename);
    if (found) return found;

    // Altrimenti lo trattiamo come filename libero
    return keyOrFilename;
  }

  function _resolvePath(keyOrFilename) {
    const normalized = _normalizeKey(keyOrFilename);

    // Chiave nota -> usa JsonConfig.paths.<key>
    if (JsonConfig.paths[normalized] !== undefined) {
      return JsonConfig.paths[normalized];
    }

    // Filename libero
    return JsonPaths.get(normalized);
  }

  async function load(keyOrFilename) {
    const cacheKey = String(_normalizeKey(keyOrFilename));
    if (_promiseCache[cacheKey]) return _promiseCache[cacheKey];

    const path = _resolvePath(keyOrFilename);
    _promiseCache[cacheKey] = fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} su ${path}`);
        return res.json();
      })
      .then((payload) => _decryptOrTransform(payload, cacheKey));

    return _promiseCache[cacheKey];
  }

  function clearCache(keyOrFilename) {
    if (!keyOrFilename) {
      Object.keys(_promiseCache).forEach((k) => delete _promiseCache[k]);
      return;
    }
    const cacheKey = String(_normalizeKey(keyOrFilename));
    delete _promiseCache[cacheKey];
  }

  return { load, clearCache };
})();

