<template>
    <chart-card :i18n="__"
        :error-handler="handleError"
        v-bind="$attrs"
        v-on="$listeners"/>
</template>

<script>
import ChartCard from './ChartCard.vue';

export default {
    name: 'EnsoChartCard',

    components: { ChartCard },
};
</script>
