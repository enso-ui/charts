<template>
    <chart-card v-bind="$attrs"
        :i18n="i18n"
        :error-handler="errorHandler"
        v-on="$listeners"
        @fetched="ready = true"
        ref="chart">
        <template v-slot:controls>
            <slot name="controls"/>
        </template>
        <template v-slot:default="props">
            <slot v-bind="props"/>
        </template>
    </chart-card>
</template>

<script>
import ChartCard from './ChartCard.vue';

export default {
    name: 'EnsoChartCard',

    components: { ChartCard },

    inject: ['errorHandler', 'i18n'],

    data: () => ({
        ready: false,
    }),

    computed: {
        config() {
            return this.ready && this.$refs.chart.config;
        },
    },

    methods: {
        fetch() {
            if (this.chart) {
                this.chart.fetch();
            }
        },
        resize() {
            if (!this.chart) {
                this.chart.resize();
            }
        },
    },
};
</script>
