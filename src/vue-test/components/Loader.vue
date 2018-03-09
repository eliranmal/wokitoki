<template>
    <div v-show="isLoading" class="loader centered-content">
        <svgicon class="spin" v-bind:name="icon" width="60" height="60" />
    </div>
</template>

<script>
    import icons from '../../lib/icons';

    export default {
        name: 'loader',
        props: {
            isLoading: Boolean,
        },
        data() {
            return {
                iconName: 'empty',
            };
        },
        computed: {
            icon() {
                if (this.isLoading) {
                    this.iconName = icons.random();
                }
                return this.iconName;
            },
        },
    }
</script>

<style scoped>

    .loader {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;
        margin: 0;
        padding: 0;
        background-color: #f6f6f6;
    }

</style>
