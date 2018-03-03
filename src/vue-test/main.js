import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'minireset.css';
import './styles.css';

import Vue from 'vue';
import Vuex from 'vuex'
import store from './store';
import App from './App.vue';
import bTooltipDirective from 'bootstrap-vue/es/directives/tooltip/tooltip';

import Promise from 'bluebird';

Promise.config({
    longStackTraces: true,
    warnings: true // note, run node with --trace-warnings to see full stack traces for warnings
});

Vue.directive('b-tooltip', bTooltipDirective);

Vue.filter('json', value => JSON.stringify(value, null, 2));

Vue.use(Vuex);

new Vue({
    el: '#app',
    store: new Vuex.Store(store),
    render: h => h(App),
});
