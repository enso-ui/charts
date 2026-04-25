import assert from 'node:assert/strict';
import test from 'node:test';
import { resetSkeletonState } from '../src/utils/loadingState.mjs';

test('resetSkeletonState re-enters skeleton mode for rendered charts', () => {
    const originalClearTimeout = globalThis.clearTimeout;
    let clearedTimer = null;
    globalThis.clearTimeout = timer => {
        clearedTimer = timer;
    };

    const state = {
        contentReady: true,
        contentTimer: 42,
        skeletonShownAt: 1,
    };

    resetSkeletonState(state, 123);

    assert.equal(clearedTimer, 42);
    assert.equal(state.contentTimer, null);
    assert.equal(state.contentReady, false);
    assert.equal(state.skeletonShownAt, 123);

    globalThis.clearTimeout = originalClearTimeout;
});

test('resetSkeletonState keeps initial loading state untouched', () => {
    const state = {
        contentReady: false,
        contentTimer: 42,
        skeletonShownAt: 1,
    };

    resetSkeletonState(state, 123);

    assert.equal(state.contentTimer, 42);
    assert.equal(state.contentReady, false);
    assert.equal(state.skeletonShownAt, 1);
});
