import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const WEBUI = path.join(ROOT, 'webui');

export function readWeb(relative) {
    return fs.readFileSync(path.join(WEBUI, relative), 'utf8');
}

export function webScripts() {
    return fs.readdirSync(path.join(WEBUI, 'js'))
        .filter((name) => name.endsWith('.js'))
        .map((name) => ({ name, source: readWeb(path.join('js', name)) }));
}

/* Runs a classic browser script inside an isolated context with the given globals. */
export function runInSandbox(relative, globals) {
    const context = vm.createContext({ ...globals });
    vm.runInContext(readWeb(relative), context, { filename: relative });
    return context;
}

/* Loads r4-policy.js into this realm so typed arrays and errors compare normally. */
export function loadPolicy() {
    if (!globalThis.R4Policy) {
        new vm.Script(readWeb('js/r4-policy.js'), { filename: 'js/r4-policy.js' }).runInThisContext();
    }
    if (!globalThis.R4Policy) throw new Error('r4-policy.js did not define R4Policy');
    return globalThis.R4Policy;
}
