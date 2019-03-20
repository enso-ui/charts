<template>
    <card collapsible
        :collapsed="collapsed"
        :loading="loading"
        v-if="config">
        <card-header class="has-background-light">
            <template v-slot:title>
                <span class="icon is-small has-margin-right-small">
                    <fa :icon="icon"/>
                </span>
                {{ title }}
            </template>
            <template v-slot:controls>
                <card-control>
                    <span class="icon is-small download"
                        @click="download">
                        <fa icon="download"/>
                    </span>
                </card-control>
                <card-refresh @refresh="fetch"/>
                <card-collapse/>
            </template>
        </card-header>
        <card-content class="has-padding-medium">
            <slot/>
            <chart :data="data"
                :options="config.options"
                :type="config.type"
                v-bind="$attrs"
                ref="chart"/>
        </card-content>
    </card>
</template>

<script>
import { saveAs } from 'file-saver';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faChartBar, faChartPie, faChartLine, faChartArea, faCircleNotch, faCircle, faDownload,
} from '@fortawesome/free-solid-svg-icons';
import {
    Card, CardHeader, CardContent, CardControl, CardRefresh, CardCollapse,
} from '@enso-ui/card/bulma';

import Chart from '../components/Chart.vue';

library.add(
    faChartBar, faChartPie, faChartLine, faChartArea, faCircleNotch, faCircle, faDownload,
);

const icons = {
    bar: faChartBar,
    horizontalBar: faChartBar,
    pie: faChartPie,
    line: faChartLine,
    radar: faChartArea,
    polarArea: faCircleNotch,
    doughnut: faChartPie,
    bubble: faCircle,
};

export default {
    name: 'ChartCard',

    components: {
        Card, CardHeader, CardRefresh, CardCollapse, CardControl, Chart, CardContent,
    },

    props: {
        collapsed: {
            type: Boolean,
            default: false,
        },
        errorHandler: {
            type: Function,
            default: (error) => {
                throw error;
            },
        },
        i18n: {
            type: Function,
            default: v => v,
        },
        params: {
            type: Object,
            default: null,
        },
        source: {
            type: String,
            required: true,
        },
    },

    data: () => ({
        loading: false,
        config: null,
        icons,
    }),

    computed: {
        icon() {
            return this.icons[this.config.type];
        },
        title() {
            return this.i18n(this.config.title);
        },
        data() {
            switch (this.config.type) {
            case 'bubble':
                return {
                    datasets: this.config.data.datasets.map((dataset) => {
                        dataset.label = this.i18n(dataset.label);
                        return dataset;
                    }),
                };
            case 'line':
            case 'bar':
                return {
                    datasets: this.config.data.datasets.map((dataset) => {
                        dataset.label = this.i18n(dataset.label);
                        return dataset;
                    }),
                    labels: this.config.data.labels.map(label => this.i18n(label)),
                };
            default:
                return {
                    datasets: this.config.data.datasets,
                    labels: this.config.data.labels.map(label => this.i18n(label)),
                };
            }
        },
    },

    watch: {
        params: {
            handler() {
                this.fetch();
            },
            deep: true,
        },
    },

    mounted() {
        this.fetch();
    },

    methods: {
        fetch() {
            this.loading = true;

            axios.get(this.source, { params: this.params })
                .then(({ data }) => {
                    this.config = data;
                    this.loading = false;
                    this.$emit('fetched');
                }).catch((error) => {
                    this.loading = false;
                    this.errorHandler(error);
                });
        },
        resize() {
            if (!this.chart) {
                return;
            }

            this.chart.resize();
        },
        download() {
            this.$refs.chart.$el
                .toBlob(blob => saveAs(blob, `${this.config.title}.png`));
        },
    },
};
</script>
