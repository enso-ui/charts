<template>
    <card :class="$attrs.class"
        collapsible
        :collapsed="collapsed"
        :loading="showOverlay">
        <card-header>
            <template #title>
                <skeleton icon
                    type="label"
                    v-if="!this.contentReady"/>
                <template v-else>
                    <span class="icon is-small mr-1">
                        <fa :icon="icon"/>
                    </span>
                    {{ title }}
                </template>
            </template>
            <template #controls>
                <slot name="controls"/>
                <card-control>
                    <span class="icon is-small download"
                        @click="download">
                        <fa :icon="faDownload"/>
                    </span>
                </card-control>
                <card-refresh :loading="showOverlay"
                    @refresh="fetch"/>
                <card-collapse/>
            </template>
        </card-header>
        <card-content class="p-2">
            <skeleton type="chart"
                :aspect-ratio="aspectRatio"
                :variant="type"
                v-if="!this.contentReady"/>
            <template v-else>
                <slot :config="config"/>
                <chart v-bind="$attrs"
                    :data="data"
                    :options="config.options"
                    :type="config.type"
                    ref="chart"/>
            </template>
        </card-content>
    </card>
</template>

<script>
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import {
    faChartBar, faChartPie, faChartLine, faChartArea, faCircleNotch, faCircle, faDownload,
} from '@fortawesome/free-solid-svg-icons';
import {
    Card, CardHeader, CardContent, CardControl, CardRefresh, CardCollapse,
} from '@enso-ui/card/bulma';
import { Skeleton } from '@enso-ui/loader/bulma';

import Chart from '../components/Chart.vue';

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
        Skeleton,
    },

    inject: ['http'],

    inheritAttrs: false,

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
        aspectRatio: {
            type: Number,
            default: 4,
        },
        skeletonMinVisible: {
            type: Number,
            default: 250,
        },
        type: {
            type: String,
            default: 'generic',
        },
    },

    emits: ['fetching', 'fetched'],

    data: () => ({
        faDownload,
        loading: true,
        config: null,
        contentReady: false,
        ongoingRequest: null,
        skeletonShownAt: Date.now(),
        contentTimer: null,
        icons,
    }),

    computed: {
        showOverlay() {
            return this.loading && this.contentReady && !!this.config;
        },
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

    beforeUnmount() {
        clearTimeout(this.contentTimer);
        this.contentTimer = null;
        this.ongoingRequest?.cancel();
    },

    methods: {
        fetch() {
            this.$emit('fetching');
            this.loading = true;
            this.ongoingRequest?.cancel();
            const request = this.http.CancelToken.source();
            this.ongoingRequest = request;

            this.http.get(this.source, {
                params: this.params,
                cancelToken: request.token,
            }).then(({ data }) => {
                this.config = data;
                this.finishLoading();
                this.$emit('fetched', data);
            }).catch(error => {
                this.finishLoading();
                this.errorHandler(error);
            });
        },
        finishLoading() {
            if (this.contentReady || !this.config) {
                this.loading = false;
            } else {
                this.hideSkeleton();
            }
        },
        hideSkeleton() {
            const elapsed = Date.now() - this.skeletonShownAt;
            const delay = Math.max(this.skeletonMinVisible - elapsed, 0);
    
            this.contentTimer = setTimeout(() => {
                this.contentReady = true;
                this.loading = false;
                this.skeletonShownAt = null;
                this.contentTimer = null;
            }, delay);
        },
        resize() {
            this.chart.resize();
        },
        download() {
            this.$refs.chart.$el.toBlob(blob => {
                if (!blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${this.config.title}.png`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(url);
                }
            });
        },
    },
};
</script>
