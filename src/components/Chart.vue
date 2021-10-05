<script>
import { Chart, registerables } from 'chart.js';
import { shortNumber } from '@enso-ui/mixins';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(...registerables, ChartDataLabels, annotationPlugin);

const types = [
    'line', 'bar', 'horizontalBar', 'radar', 'polarArea', 'pie', 'doughnut', 'bubble',
];

export default {
    name: 'Chart',

    props: {
        data: {
            type: Object,
            required: true,
        },
        display: {
            type: Function,
            default: ({ chart, datasetIndex }) => !chart
                .getDatasetMeta(datasetIndex).hidden
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
        data: 'update',
    },

    mounted() {
        this.mount();
    },

    beforeDestroy() {
        this.chart.destroy();
    },

    methods: {
        mount() {
            this.chart = new Chart(this.$el, {
                type: this.type,
                data: this.data,
                options: this.processedOptions(),
            });
        },
        processedOptions() {
            if (this.type !== 'bubble') {
                this.options.plugins.datalabels.formatter = this.shortNumbers
                    ? shortNumber
                    : this.valueFormatter;
            }

            this.options.plugins.datalabels.display = this.display;

            if (this.options.scales) {
                if (this.shortNumbers) {
                    const { y } = this.options.scales; 
                    y.ticks = { shortNumber, ...y.ticks };
                }

                this.scaleFormatter(this.options.scales);
            }

            return this.options;
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

            this.$set(this.chart, 'options', this.processedOptions());

            if (this.structureChanged()) {
                this.$set(this.chart.data, 'datasets', this.data.datasets);
            } else {
                this.updateDatasets();
            }

            this.$set(this.chart.data, 'labels', this.data.labels);

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

    render(createEl) {
        return createEl('canvas', {
            style: { maxWidth: '100%' },
        });
    },
};
</script>
