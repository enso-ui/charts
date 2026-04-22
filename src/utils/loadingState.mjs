export const resetSkeletonState = (state, now = Date.now()) => {
    if (!state.contentReady) {
        return;
    }

    clearTimeout(state.contentTimer);
    state.contentTimer = null;
    state.contentReady = false;
    state.skeletonShownAt = now;
};
