<template>
    <chart-card :i18n="i18n"
        :error-handler="errorHandler"
        v-bind="$attrs"
        v-on="$listeners"/>
</template>

<script>
import ChartCard from './ChartCard.vue';

export default {
    name: 'EnsoChartCard',

    inject: ['errorHandler', 'i18n'],

    components: { ChartCard },
};
</script>
