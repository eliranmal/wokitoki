<template>
    <div v-bind:contenteditable.native="isEditable"
         v-bind:data-placeholder.once="placeholder"
         v-on:blur="onBlur"
         v-on:input="onInput"
         v-on:paste.prevent="onPaste"
         v-on:keypress="onKeyPress">
    </div>
</template>

<script>
    export default {
        name: 'editable',
        model: {
            prop: 'content',
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
            'disabled': {
                type: Boolean,
                default: false,
            },
        },
        mounted: function () {
            if (this.content) {
                this.updateText(this.content);
            }
        },
        computed: {
            isEditable() {
                return !this.disabled;
            },
        },
        watch: {
            content(newValue, oldValue) {
                if (newValue !== oldValue) {
                    this.updateText(newValue);
                }
            },
        },
        methods: {
            onInput(e) {
                this.$emit('input', e.target.textContent);
            },
            onBlur(e) {
                this.$emit('blur', e.target.textContent);
            },
            onPaste(e) {
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            },
            onKeyPress(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    e.target.blur();
                }
            },
            updateText(text) {
                this.$el.textContent = text;
                this.$emit('input', text);
            },
        },
    }
</script>

<style scoped>

    div[contenteditable]:read-write:empty:not(:focus):before {
        content: attr(data-placeholder);
        color: #999;
    }

</style>
