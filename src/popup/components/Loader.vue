<template>
    <div v-show="isLoading" class="loader flexbox centered-content">
        <icon class="loader-icon spin" v-bind:name="icon" width="66" height="66" fill="currentColor" />
        <p class="loader-text"
           v-for="line in textContent"
           v-text="line"></p>
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
            text: [String, Array],
        },
        data() {
            return {
                icon: icons.random(),
            };
        },
        computed: {
            textContent() {
                if (typeof this.text === 'string') {
                    return [this.text];
                }
                if (Array.isArray(this.text)) {
                    return this.text;
                }
                return [];
            },
        },
        watch: {
            text(newValue) {
                this.randomizeIcon(newValue);
            },
            isLoading(newValue) {
                this.randomizeIcon(newValue);
            },
        },
        methods: {
            randomizeIcon(observable) {
                if (observable) {
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

    .loader > * {
        margin: 0;
    }

    .loader-icon {
        margin-bottom: 1.5rem;
    }

    .loader-text {
        line-height: 1.5;
        text-align: center;
        font-size: .85rem;
    }

</style>
