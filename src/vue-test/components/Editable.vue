<template>
    <div contenteditable="true"
         v-bind:data-placeholder.once="placeholder"
         v-on:input="onInput"
         v-on:paste="onPaste"
         v-on:blur="onBlur"
         v-on:keypress="onKeyPress">
    </div>
</template>

<script>
    export default {
        name: 'editable',
        model: {
            prop: 'textContent',
            event: 'input',
        },
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
            if (this.content) {
                this.$el.textContent = this.content;
            }
        },
        methods: {
            onInput(e) {
                this.$emit('input', e.target.textContent);
            },
            onBlur(e) {
                this.$emit('blur', e.target.textContent);
            },
            onPaste(e) {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertHTML', false, text);
            },
            onKeyPress(e) {
                if (e.charCode === 13) {
                    e.preventDefault();
                    e.target.blur();
                }
            },
        },
        watch: {
            content(newValue, oldValue) {
                if (newValue !== oldValue) {
                    this.$el.textContent = newValue;
                }
            },
        },
    }
</script>

<style scoped>

    div[contenteditable="true"] {
        min-width: 15em;
    }

    div[contenteditable="true"]:empty:not(:focus):before {
        content: attr(data-placeholder);
        color: #999;
    }

</style>
