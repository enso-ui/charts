<template>
    <chart-card :i18n="__"
        v-bind="$attrs"
        v-on="$listeners"/>
</template>

<script>
import ChartCard from './ChartCard.vue';

export default {
    components: { ChartCard },
};
</script>
