<template>
    <div contenteditable="true"
         v-bind:data-placeholder.once="placeholder"
         v-on:input="input"
         v-on:blur="blur">
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
            input: function (event) {
                this.$emit('input', event.target.textContent);
            },
            blur: function (event) {
                this.$emit('blur', event.target.textContent);
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
