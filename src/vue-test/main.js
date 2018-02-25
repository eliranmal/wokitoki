import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'minireset.css';
import './styles.css';

import Vue from 'vue';
import App from './App.vue';
import bTooltipDirective from 'bootstrap-vue/es/directives/tooltip/tooltip';


Vue.directive('b-tooltip', bTooltipDirective);

Vue.filter('json', value => JSON.stringify(value, null, 2));

new Vue({
    el: '#app',
    // bus: new Vue(),
    render: h => h(App),
});
