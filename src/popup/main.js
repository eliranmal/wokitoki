// todo - add attribution to icon creators, see here: https://support.flaticon.com/hc/en-us/articles/207248209-How-I-must-insert-the-attribution-

import 'bootstrap/dist/css/bootstrap.css';
import 'minireset.css';
import './styles.css';
import './components/icons';

import Promise from 'bluebird';
import Vue from 'vue';
import Vuex from 'vuex'
import store from './store';
import App from './App.vue';
import bTooltipDirective from 'bootstrap-vue/es/directives/tooltip/tooltip';
import svgicon from 'vue-svgicon';


Promise.config({
    longStackTraces: true,
    warnings: true // note, run node with --trace-warnings to see full stack traces for warnings
});

Vue.directive('b-tooltip', bTooltipDirective);

Vue.filter('json', value => JSON.stringify(value, null, 2));

Vue.use(Vuex);

Vue.use(svgicon, {
    defaultWidth: '100%',
    defaultHeight: '100%',
});

new Vue({
    el: '#app',
    store: new Vuex.Store(store),
    render: h => h(App),
});
