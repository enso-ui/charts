export default {
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
};
