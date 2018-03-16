<template>
    <svgicon v-bind:name="safeName"
             v-bind:width="width"
             v-bind:height="height"
             v-bind:style="style" />
</template>

<script>
    export default {
        name: 'icon',
        props: {
            theme: {
                type: String,
                default: 'light',
            },
            name: {
                type: String,
                default: 'empty',
            },
            width: String,
            height: String,
            fill: String,
            stroke: String,
        },
        computed: {
            style() {
                return {
                    fill: this.fill || this.fillFallback,
                    stroke: this.stroke || this.strokeFallback,
                };
            },
            fillFallback() {
                return this.isLight ? '#111111' : '#ffffff';
            },
            strokeFallback() {
                return this.isLight ? '#ffffff' : '#111111';
            },
            isLight() {
                return this.theme === 'light';
            },
            safeName() {
                return this.name || 'empty';
            },
        },
    }
</script>

<style scoped>

</style>
