<template>
    <div contenteditable="true"
         v-bind:data-placeholder.once="placeholder"
         v-on:input="input"
         v-on:paste="asPlainText"
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
            input(e) {
                this.$emit('input', e.target.textContent);
            },
            blur(e) {
                this.$emit('blur', e.target.textContent);
            },
            asPlainText(e) {
                // cancel paste
                e.preventDefault();
                // get text representation of clipboard
                const text = e.clipboardData.getData('text/plain');
                // insert text manually
                document.execCommand('insertHTML', false, text);
            }
        },
    }
</script>

<style scoped>

    div[contenteditable="true"]:empty:not(:focus):before {
        content: attr(data-placeholder);
        color: #999;
    }

</style>
