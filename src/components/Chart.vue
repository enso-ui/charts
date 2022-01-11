<script>
import { h } from 'vue';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import shortNumber from '../formatters/shortNumber';
import defaultOptions from './options';

Chart.register(...registerables, ChartDataLabels, annotationPlugin);

const types = [
    'line', 'bar', 'horizontalBar', 'radar', 'polarArea', 'pie', 'doughnut', 'bubble',
];

export default {
    name: 'Chart',

    inheritAttrs: false,

    props: {
        data: {
            type: Object,
            required: true,
        },
        display: {
            type: Function,
            default: ({ chart, datasetIndex }) => !chart
                .getDatasetMeta(datasetIndex).hidden,
        },
        shortNumbers: {
            type: Boolean,
            default: false,
        },
        valueFormatter: {
            type: Function,
            default: v => v,
        },
        scaleFormatter: {
            type: Function,
            default: v => v,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        type: {
            type: String,
            required: true,
            validator: v => types.includes(v),
        },
    },

    watch: {
        data: {
            handler: 'update',
            deep: true,
        },
    },

    mounted() {
        this.mount();
    },

    beforeUnmount() {
        this.chart.destroy();
    },

    methods: {
        defaultOptions() {
            return JSON.parse(JSON.stringify(defaultOptions));
        },
        mount() {
            this.chart = new Chart(this.$el, {
                type: this.type,
                data: this.data,
                options: this.processedOptions(),
            });
        },
        processedOptions() {
            const options = Object.keys(this.options).length
                ? this.options
                : this.defaultOptions();

            if (this.type !== 'bubble') {
                options.plugins.datalabels.formatter = this.shortNumbers || options.shortNumbers
                    ? shortNumber
                    : this.valueFormatter;
            }

            options.plugins.datalabels.display = this.display;

            if (options.scales) {
                if (this.shortNumbers) {
                    const { y } = options.scales;
                    y.ticks = { shortNumber, ...y.ticks };
                }

                this.scaleFormatter(options.scales);
            }

            return options;
        },
        resize() {
            if (this.chart) {
                this.chart.resize();
            }
        },
        structureChanged() {
            return this.chart.data.datasets.length !== this.data.datasets.length
                || this.chart.data.datasets
                    .some(({ label }) => this.data.datasets
                        .findIndex(dataset => dataset.label === label) === -1);
        },
        svg() {
            return this.$el.toDataURL('image/jpg');
        },
        update() {
            if (!this.chart) {
                return;
            }

            this.chart.options = this.processedOptions();

            if (this.structureChanged()) {
                this.chart.data.datasets = this.data.datasets;
            } else {
                this.updateDatasets();
            }

            this.chart.data.labels = this.data.labels;

            this.chart.update();
        },
        updateDatasets() {
            this.chart.data.datasets.forEach((dataset, index) => {
                dataset.data = this.data.datasets[index].data;
                dataset.backgroundColor = this.data.datasets[index].backgroundColor;
                dataset.datalabels.backgroundColor = this.data.datasets[index]
                    .datalabels.backgroundColor;
            });
        },
    },

    render() {
        return h('canvas', {
            style: { maxWidth: '100%' },
        });
    },
};
</script>
