import Vue from 'vue'
import App from './App.vue'
import './cube-ui'
import './register'
import router from './router'
import store from './store'
// import 'common/mixins/getCode'
import Request from './common/mixins/request'
import eruda from 'eruda'
import 'common/stylus/index.styl'
import myCharts from './common/mixins/myCharts.js'
Vue.use(myCharts)
eruda.init()
Vue.config.productionTip = false
Vue.prototype.request = Request
router.beforeEach((to, from, next) => {
  if (to.path === '/' && from.path === '/') {
    let code = to.query.code
    localStorage.setItem('userCode', code)
  }
  let _token = localStorage.getItem('userToken')
  if (_token !== null && _token !== '') {
    if (to.path === '/UserLogin') {
      // 登录状态下 访问登录页面 会跳到index.vue
      next({ path: '/index' })
    } else if (to.path === '/') {
      next({ path: '/index' })
    } else {
      next()
    }
  } else {
    if (to.path === '/UserLogin') { // 如果是登录页面的话，直接next() -->解决注销后的循环执行bug
      next()
    } else if (to.path === '/UserRegister') {
      next()
    } else if (to.path === '/userRest') {
      next()
    } else { // 否则 跳转到登录页面
      next({ path: '/UserLogin' })
    }
  }
})
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g
  const isChunkLoadFailed = error.message.match(pattern)
  const targetPath = router.history.pending.fullPath
  if (isChunkLoadFailed) {
    router.replace(targetPath)
  }
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
