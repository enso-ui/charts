<template>
    <div class="box info-box is-paddingless stats"
        :style="border">
        <div class="level is-mobile">
            <div class="level-left">
                <div class="level-item">
                    <p class="subtitle is-5 has-padding-medium">
                        {{ dataset.label }}
                    </p>
                </div>
            </div>
            <div class="level-right is-clickable"
                :class="{ 'has-background-light': !svg }"
                @mouseover="svg = false"
                @mouseleave="svg = true"
                v-click-outside="() => svg = true"
                v-if="total !== null">
                <div class="level-item">
                    <progress-circle :progress="progress"
                        :width="75"
                        :progress-stroke="dataset.borderColor"
                        v-if="svg"/>
                    <p class="title is-5 has-padding-large"
                        v-else>
                        {{ sum | shortNumber }} / {{ total | shortNumber }}
                    </p>
                </div>
            </div>
            <div class="level-right"
                v-else>
                <div class="level-item">
                    <p class="title is-5 has-padding-large">
                        {{ sum | shortNumber }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ProgressCircle from '@enso-ui/progress-circle';
import { clickOutside } from '@enso-ui/directives';
import { shortNumber } from '@enso-ui/mixins';

export default {
    name: 'InfoPanel',

    directives: { clickOutside },

    filters: { shortNumber },

    components: { ProgressCircle },

    props: {
        dataset: {
            type: Object,
            required: true,
        },
        total: {
            type: Number,
            default: null,
        },
    },

    data: () => ({
        svg: true,
    }),

    computed: {
        border() {
            return {
                borderTop: `2px solid ${this.dataset.borderColor}`,
            };
        },
        sum() {
            return this.dataset.data && this.dataset.data.reduce((sum, value) => (sum += 1 * value), 0);
        },
        progress() {
            const progress = this.dataset.data && this.total
                ? this.dataset.data
                    .reduce((sum, value) => (sum += 1 * value)) / this.total * 100
                : 0;

            return progress < 100
                ? progress
                : 100;
        },
    },
};
</script>

<style lang="scss">
    .info-box.stats {
        height: 75px;

        .level {
            height: 100%;
            border-top-right-radius: inherit;
            border-bottom-right-radius: inherit;
            .level-right {
                height: 100%;
                border-top-right-radius: inherit;
                border-bottom-right-radius: inherit;
            }
        }
    }
</style>
