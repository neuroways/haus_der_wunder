// ES-Modul-Einstieg. Nutzt standardmäßig das manifest.json im selben Ordner wie diese Datei.
import './media-loader.js';

const base = globalThis.EMFDMedia;
const HERE_MANIFEST = new URL('manifest.json', import.meta.url).href;
const create = (config = {}) => base.create(Object.assign({ manifestUrl: HERE_MANIFEST }, config));
let shared = null;
const init = (config, opts) => { if (!shared) shared = create(config); return shared.init(opts); };
const EMFDMedia = Object.freeze(Object.assign({}, base, { create, init, MANIFEST_URL: HERE_MANIFEST, get default() { return shared; } }));
export default EMFDMedia;
export { create, init, HERE_MANIFEST as MANIFEST_URL };
