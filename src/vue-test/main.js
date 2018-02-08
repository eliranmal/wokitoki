import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'minireset.css';
import './styles.css';

import Vue from 'vue';
import App from './App.vue';
import bTooltipDirective from 'bootstrap-vue/es/directives/tooltip/tooltip';


Vue.directive('b-tooltip', bTooltipDirective);

new Vue({
    el: '#app',
    render: h => h(App),
});
