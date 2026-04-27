import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/bulma/ChartCard.vue', import.meta.url), 'utf8');

test('ChartCard keeps rendered content visible while refetching', () => {
    assert.doesNotMatch(source, /resetSkeletonState/);
    assert.match(source, /showOverlay\(\)\s*\{[\s\S]*this\.loading && this\.contentReady && !!this\.config/);
    assert.match(source, /fetch\(\)\s*\{[\s\S]*this\.\$emit\('fetching'\);[\s\S]*this\.loading = true;/);
});
