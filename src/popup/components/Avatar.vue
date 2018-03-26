<template>
    <div class="avatar icon round"
         v-on:click="toggleAvatarSpin"
         v-bind:class="isAvatarSpinning ? 'spin' : ''"
         v-bind:style="avatarStyle">
        <icon v-bind="avatarIcon"/>
    </div>
</template>

<script>
    import colors from '../../lib/colors';
    import Icon from './Icon';

    export default {
        name: 'avatar',
        components: {
            Icon,
        },
        props: {
            icon: String,
            color: String,
        },
        data() {
            return {
                isAvatarSpinning: false,
            };
        },
        computed: {
            isDark() {
                return colors.isDark(this.color);
            },
            avatarStyle() {
                return {
                    borderColor: this.color,
                    backgroundColor: this.color,
                };
            },
            avatarIcon() {
                return {
                    theme: this.isDark ? 'dark' : 'light',
                    name: this.icon
                };
            },
        },
        methods: {
            toggleAvatarSpin() {
                this.isAvatarSpinning = !this.isAvatarSpinning;
            },
        },
    }
</script>

<style scoped>

</style>
