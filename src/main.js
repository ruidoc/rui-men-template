import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import request from './utils/request'

import plug from './plugins'
Vue.use(plug)

import Rum from 'rui-men'
import 'rui-men/lib/main.css'
Vue.use(Rum)

Vue.config.productionTip = false

Vue.prototype.$request = request

new Vue({
	el: '#app', 
	router, 
	store,
	render: h => h(App)
})