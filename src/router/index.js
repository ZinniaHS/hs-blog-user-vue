import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // 进入重定向至首页
        {
            path: '/',
            redirect: '/user/home',
        },
        // 404页面
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404',
        },
        {
            path: '/404',
            name: '404',
            meta: {title :'页面未找到'},
            component: ()=>import( '../view/404.vue'),
        },
        {
            path: '/login',
            name: 'login',
            meta: {title :'登录'},
            component: ()=>import( '../view/Login.vue'),
        },
        {
            path: '/register',
            name: 'register',
            meta: { title: '注册' },
            component: () => import('../view/Register.vue')
        },
        {
            path: '/user',
            name: 'user',
            component: ()=>import( '../view/User.vue'),
            children: [
                {
                    // 子路由路径前不用添加'/'
                    path: 'home',
                    name: 'home',
                    meta: {menuIndex: '0', title :'主页'},
                    component: ()=>import( '../view/Home.vue'),
                },
                {
                    path: 'blog',
                    name: 'blog',
                    meta: {menuIndex: '1', title :'博客区'},
                    component: ()=>import( '../view/Blog.vue'),
                },
                {
                    path: 'book',
                    name: 'book',
                    meta: {menuIndex: '2', title :'图书馆'},
                    component: ()=>import( '../view/Book.vue'),
                },
                {
                    path: 'bookDetail',
                    name: 'bookDetail',
                    meta: {menuIndex: '2', title :'图书详情'},
                    component: ()=>import( '../view/BookDetail.vue'),
                },
            ]
        },
    ]
})

export default router