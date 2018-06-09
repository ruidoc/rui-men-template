
const homeRouter = [
	{
		path: '/test',
		component: re=> require(['&/Test/Index.vue'],re)
	}
]

export default {
	routes: [
		{
			path: '/',
			component: re=> require(['&/Home.vue'], re),
			children: homeRouter,
		},
		{
            path:'/login',
            meta: {
				title: '登录'
			},
            component: re=> require(['&/Login.vue'], re),
        }
	]
}