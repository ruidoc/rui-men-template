
import Vue from 'vue'
import vueRouter from 'vue-router'
import routerConf from './router'

Vue.use(vueRouter)

const router = new vueRouter(routerConf)

router.beforeEach((to, from, next) => {
    // if (!localStorage.token && to.path !== '/login') {
    //     next('/login');
    // } else if (localStorage.token && to.path === '/login') {  
    //     next('/');
    // } else {
    // 	if (to.matched.length == 0) {
    // 		next('/')
    // 	} else {
    //         next()
    // 	}
	// }
	next()
});

export default router