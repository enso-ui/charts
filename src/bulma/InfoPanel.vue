<template>
    <div class="box info-box is-paddingless stats"
        :style="border">
        <div class="level is-mobile level-is-shrinkable">
            <div class="level-left">
                <div class="level-item">
                    <p class="subtitle is-5 p-2">
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
                    <p class="title is-5 p-3"
                        v-else>
                        <span v-if="shortNumbers">
                            {{ shortNumber(sum) }} / {{ shortNumber(total) }}
                        </span>
                        <span v-else>
                            {{ sum }} / {{ total }}
                        </span>
                    </p>
                </div>
            </div>
            <div class="level-right"
                v-else>
                <div class="level-item">
                    <p class="title is-5 p-3">
                        <span v-if="shortNumbers">
                            {{ shortNumber(sum) }}
                        </span>
                        <span v-else>
                            {{ sum }}
                        </span>
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

    components: { ProgressCircle },

    props: {
        dataset: {
            type: Object,
            required: true,
        },
        shortNumbers: {
            type: Boolean,
            default: false,
        },
        precision: {
            type: Number,
            default: 2,
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
        multiplier() {
            return 10 ** this.precision;
        },
        sum() {
            return this.ready && this.dataset.data
                .reduce((sum, value) => (sum += this.multiplier * value), 0)
                / this.multiplier;
        },
        progress() {
            const progress = this.ready && this.total
                ? this.sum * this.multiplier / (this.total * this.multiplier) * 100
                : 0;

            return progress < 100 ? progress : 100;
        },
        ready() {
            return !!this.dataset.data;
        },
    },

    methods: {
        shortNumber(value) {
            return shortNumber(value);
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
        .level-item {
               min-width: 0;
               overflow: hidden;
           }
        .level-is-shrinkable .level-left {
            min-width: 0;
            flex-shrink: 1;
            overflow: hidden;
            text-overflow: hidden;
        }
    }
</style>
