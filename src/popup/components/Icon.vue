<template>
    <svgicon v-bind="$props" v-bind:style="style" />
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
                default: 'empty'
            },
            width: String,
            height: String,
        },
        computed: {
            style() {
                return {
                    fill: this.isLight ? '#ffffff' : '#111111',
                    stroke: this.isLight ? '#111111' : '#ffffff',
                };
            },
            isLight() {
                return this.theme === 'light';
            },
        },
    }
</script>

<style scoped>

</style>
