import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, runInSandbox } from './harness.mjs';

const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'webui', 'data', 'presets.schema.json'), 'utf8'));

/* Minimal validator for the schema subset used in presets.schema.json. */
function validate(value, node, where = '$') {
    const errors = [];
    if (node.$ref) return validate(value, schema.$defs[node.$ref.split('/').pop()], where);
    if ('const' in node && value !== node.const) errors.push(where + ' must be ' + node.const);
    const kind = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (node.type === 'integer' ? !Number.isInteger(value) : node.type && node.type !== kind) {
        return [where + ' must be ' + node.type];
    }
    if (kind === 'number') {
        if (node.minimum !== undefined && value < node.minimum) errors.push(where + ' below minimum');
        if (node.maximum !== undefined && value > node.maximum) errors.push(where + ' above maximum');
    }
    if (kind === 'string') {
        if (node.minLength !== undefined && value.length < node.minLength) errors.push(where + ' too short');
        if (node.maxLength !== undefined && value.length > node.maxLength) errors.push(where + ' too long');
        if (node.pattern && !new RegExp(node.pattern).test(value)) errors.push(where + ' pattern');
    }
    if (kind === 'array') {
        if (node.maxItems !== undefined && value.length > node.maxItems) errors.push(where + ' too many items');
        if (node.items) value.forEach((item, i) => errors.push(...validate(item, node.items, where + '[' + i + ']')));
    }
    if (kind === 'object') {
        const keys = Object.keys(value);
        if (node.maxProperties !== undefined && keys.length > node.maxProperties) errors.push(where + ' too many properties');
        for (const key of node.required || []) if (!(key in value)) errors.push(where + '.' + key + ' missing');
        for (const key of keys) {
            const child = node.properties && node.properties[key];
            if (child) errors.push(...validate(value[key], child, where + '.' + key));
            else if (node.additionalProperties === false) errors.push(where + '.' + key + ' not allowed');
            else if (node.additionalProperties) errors.push(...validate(value[key], node.additionalProperties, where + '.' + key));
        }
    }
    return errors;
}

function labBank() {
    const window = {};
    runInSandbox('js/glyph-tables.js', { window });
    runInSandbox('js/glyph-library.js', { window, console, document: { getElementById: () => null } });
    return window.GlitchMachinePresets;
}

test('all 250 LAB snapshots satisfy the preset schema and exclude Flash/Strobe', () => {
    const bank = labBank();
    assert.equal(bank.length, 250);
    for (const preset of bank) {
        assert.deepEqual(validate(preset, { $ref: '#/$defs/labSnapshot' }), [], preset.id);
        assert.ok(Object.keys(preset.settings.effects).every((n) => n !== 'Flash' && n !== 'Strobe'), preset.id);
    }
});

test('the export file shape accepts valid presets and rejects out-of-range ones', () => {
    const good = { format: 'signal-lab-presets', version: 1, presets: [{ name: 'X', settings: { alphas: { ASCII: 0.5 } } }] };
    assert.deepEqual(validate(good, { $ref: '#/$defs/exportFile' }), []);
    for (const bad of [
        { ...good, version: 2 },
        { ...good, presets: [{ name: '', settings: {} }] },
        { ...good, presets: [{ name: 'X', settings: { alphas: { ASCII: 1.5 } } }] },
        { ...good, presets: [{ name: 'X'.repeat(81), settings: {} }] },
    ]) assert.notDeepEqual(validate(bad, { $ref: '#/$defs/exportFile' }), []);
});
