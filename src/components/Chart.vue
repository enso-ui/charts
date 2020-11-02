<script>
import Chart from 'chart.js';
import { shortNumber } from '@enso-ui/mixins';
import 'chartjs-plugin-datalabels';

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

    computed: {
        chartOptions() {
            const options = {
                tooltips: false,
                plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        borderRadius: 3,
                        padding: 2,
                        color: 'white',
                        font: {
                            style: 'bold',
                        },
                        display({ chart, datasetIndex }) {
                            const meta = chart.getDatasetMeta(datasetIndex);
                            return !meta.hidden;
                        },
                    },
                },
                ...this.options,
            };

            if (this.type !== 'bubble') {
                options.plugins.datalabels.formatter = this.shortNumbers
                    ? shortNumber
                    : this.formatter;
            }

            if (options.scales) {
                options.scales.yAxes.filter(({ ticks }) => !ticks)
                    .forEach(yAxis => yAxis.ticks = {
                        min: 0,
                        callback: v => (this.shortNumbers ? shortNumber(v) : this.formatter(v)),
                    });
            }

            return options;
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
                options: this.chartOptions,
            });
        },
        update() {
            if (this.chart) {
                this.$set(this.chart, 'options', this.chartOptions);
                this.$set(this.chart, 'labels', this.data.labels);

                if (this.sameDatasets()) {
                    this.updateDatasets();
                } else {
                    this.$set(this.chart.data, 'datasets', this.data.datasets);
                }

                this.chart.update();
            }
        },
        resize() {
            if (!this.chart) {
                return;
            }

            this.chart.resize();
        },
        updateDatasets() {
            this.chart.data.datasets
                .forEach((dataset, index) => {
                    dataset.data = this.data.datasets[index].data;
                    dataset.backgroundColor = this.data.datasets[index].backgroundColor;
                    dataset.datalabels.backgroundColor = this.data.datasets[index]
                        .datalabels.backgroundColor;
                });
        },
        sameDatasets() {
            return this.chart.data.datasets.length === this.data.datasets.length
                && this.chart.data.datasets
                    .every(({ label }) => this.data.datasets
                        .findIndex(dataset => dataset.label === label) > -1);
        },
        svg() {
            return this.$el.toDataURL('image/jpg');
        },
    },

    render(createEl) {
        return createEl('canvas', {
            style: {
                maxWidth: '100%',
            },
        });
    },
};
</script>
