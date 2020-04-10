<script>
import Chart from 'chart.js';
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
            return {
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
        },
    },

    watch: {
        data: 'update',
    },

    mounted() {
        this.init();
        this.mount();
    },

    beforeDestroy() {
        this.chart.destroy();
    },

    methods: {
        init() {
            Chart.defaults.global.plugins.datalabels
                .formatter = this.formatter;

            this.options.scales.yAxes[0].ticks = {
                callback: v => this.formatter(v),
            };
        },
        mount() {
            this.chart = new Chart(this.$el, {
                type: this.type,
                data: this.data,
                options: this.chartOptions,
            });
        },
        update() {
            if (!this.chart) {
                this.mount();
                return;
            }

            this.updateDatasets();
            this.chart.data.labels = this.data.labels;
            this.chart.update();
        },
        resize() {
            if (!this.chart) {
                return;
            }

            this.chart.resize();
        },
        updateDatasets() {
            if (this.structureChanged()) {
                this.$set(this.chart.data, 'datasets', this.data.datasets);
                return;
            }

            this.chart.data.datasets
                .forEach((dataset, index) => {
                    dataset.data = this.data.datasets[index].data;
                    dataset.backgroundColor = this.data.datasets[index].backgroundColor;
                    dataset.datalabels.backgroundColor = this.data.datasets[index]
                        .datalabels.backgroundColor;
                });
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
