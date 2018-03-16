<template>
    <div v-show="isLoading" class="loader flexbox centered-content">
        <icon class="spin" v-bind:name="icon" width="66" height="66" fill="currentColor" />
        <p class="text" v-if="text" v-text="text"></p>
    </div>
</template>

<script>
    import Icon from './Icon';
    import icons from '../../lib/icons';

    export default {
        name: 'loader',
        components: {
            Icon,
        },
        props: {
            isLoading: Boolean,
            text: String,
        },
        data() {
            return {
                icon: icons.random(),
            };
        },
        watch: {
            isLoading(newValue, oldValue) {
                if (newValue) {
                    this.icon = icons.random();
                }
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
        color: #bbb;
        background-color: #f6f6f6;
    }

    p {
        font-size: .85rem;
    }

</style>
