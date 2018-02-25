<template>
    <div v-show="isLoading" class="loader centered-content">
        <i class="fa fa-cog fa-spin fa-2x"></i>
    </div>
</template>

<script>
    export default {
        name: 'loader',
        props: {
            isLoading: Boolean,
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
        background-color: #f6f6f6;
    }

</style>
