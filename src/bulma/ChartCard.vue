<template>
    <card collapsible
        :collapsed="collapsed"
        :loading="loading"
        v-if="config">
        <card-header class="has-background-light">
            <template #title>
                <span class="icon is-small mr-1">
                    <fa :icon="icon"/>
                </span>
                {{ title }}
            </template>
            <template #controls>
                <slot name="controls"/>
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
        <card-content class="p-2">
            <slot :config="config"/>
            <chart v-bind="$attrs"
                :data="data"
                :options="config.options"
                :type="config.type"
                ref="chart"/>
        </card-content>
    </card>
</template>

<script>
import { saveAs } from 'file-saver';
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
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
        Fa,
        Card,
        CardHeader,
        CardRefresh,
        CardCollapse,
        CardControl,
        Chart,
        CardContent,
    },

    inject: ['http'],

    props: {
        collapsed: {
            type: Boolean,
            default: false,
        },
        errorHandler: {
            type: Function,
            default: error => {
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

    emits: ['fetching', 'fetched'],

    data: () => ({
        loading: false,
        config: null,
        ongoingRequest: null,
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
            const { data, type } = this.config;

            switch (type) {
            case 'bubble':
                return {
                    datasets: data.datasets.map(dataset => {
                        dataset.label = this.i18n(dataset.label);
                        return dataset;
                    }),
                };
            case 'line':
            case 'bar':
                return {
                    datasets: data.datasets.map(dataset => {
                        dataset.label = this.i18n(dataset.label);
                        return dataset;
                    }),
                    labels: data.labels.map(label => this.i18n(label)),
                };
            default:
                return {
                    datasets: data.datasets,
                    labels: data.labels.map(label => this.i18n(label)),
                };
            }
        },
    },

    watch: {
        params: {
            handler: 'fetch',
            deep: true,
        },
        source: 'fetch',
    },

    mounted() {
        this.fetch();
    },

    methods: {
        fetch() {
            this.$emit('fetching');
            this.loading = true;
            this.ongoingRequest?.cancel();
            this.ongoingRequest = this.http.CancelToken.source();

            this.http.get(this.source, {
                params: this.params,
                cancelToken: this.ongoingRequest.token,
            }).then(({ data }) => {
                this.config = data;
                this.loading = false;
                this.$emit('fetched', data);
            }).catch(error => {
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
