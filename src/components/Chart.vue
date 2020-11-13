<script>
import Chart from 'chart.js';
import { shortNumber } from '@enso-ui/mixins';
import 'chartjs-plugin-datalabels';
import defaultOptions from './options';

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
        shortNumbers: {
            type: Boolean,
            default: false,
        },
        formatter: {
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

    data: () => ({
        chart: null,
    }),

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
            const options = { ...this.defaultOptions(), ...this.options };

            if (this.type !== 'bubble') {
                options.plugins.datalabels.formatter = this.shortNumbers
                    ? shortNumber
                    : this.formatter;
            }

            if (options.scales) {
                const callback = v => (this.shortNumbers ? shortNumber(v) : this.formatter(v));

                options.scales.yAxes
                    .forEach(yAxis => (yAxis.ticks = { callback, ...yAxis.ticks }));
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

            if (this.structureChanged()) {
                this.$set(this.chart.data, 'datasets', this.data.datasets);
            } else {
                this.updateDatasets();
                this.$set(this.chart.data, 'labels', this.data.labels);
                this.chart.update();
            }
        },
        updateDatasets() {
            this.chart.data.datasets.forEach((dataset, index) => {
                dataset.data = this.data.datasets[index].data;
                dataset.backgroundColor = this.data.datasets[index].backgroundColor;
                dataset.datalabels.backgroundColor = this.data.datasets[index]
                    .datalabels.backgroundColor;
            });
        },
        defaultOptions() {
            return JSON.parse(JSON.stringify(defaultOptions));
        },
    },

    render(createEl) {
        return createEl('canvas', {
            style: { maxWidth: '100%' },
        });
    },
};
</script>
