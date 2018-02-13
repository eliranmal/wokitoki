<template>
    <div contenteditable="true"
         v-bind:data-placeholder.once="placeholder"
         v-on:input="update">
    </div>
</template>

<script>
    export default {
        name: 'editable',
        props: {
            'content': {
                type: String,
                default: '',
            },
            'placeholder': {
                type: String,
                default: '',
            },
        },
        mounted: function () {
            this.$el.textContent = this.content;
        },
        methods: {
            update: function (event) {
                this.$emit('update', event.target.textContent);
            },
        },
    }
</script>

<style scoped>

    div[contenteditable="true"]:empty:not(:focus):before {
        content: attr(data-placeholder);
        color: #999;
    }

</style>
