import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () =>
        import(/* webpackChunkName: "layout" */ './index/index')
    },
    {
      path: '/UserLogin',
      name: 'login',
      meta: {
        title: '用户登录'
      },
      component: () =>
        import(/* webpackChunkName: "User" */ './views/User/login')
    },
    {
      path: '/UserRegister',
      name: 'register',
      meta: {
        title: '用户注册'
      },
      component: () =>
        import(/* webpackChunkName: "User" */ './views/User/register')
    },
    {
      path: '/userRest',
      name: 'reset',
      meta: {
        title: '重设密码'
      },
      component: () =>
        import(/* webpackChunkName: "User" */ './views/User/reset')
    },
    {
      path: '/index',
      name: 'index',
      component: () =>
        import(/* webpackChunkName: "Index" */ './index/index')
    },
    {
      path: '/perInfo',
      name: 'perInfo',
      component: () =>
        import(/* webpackChunkName: "manger" */ './views/PersonInfo/personIndex')
    },
    {
      path: '/flyQualification',
      name: 'flyQualification',
      component: () =>
        import(/* webpackChunkName: "manger" */ './views/PersonInfo/flyerQualification')
    },
    {
      path: '/EppoMain',
      name: 'eppoMain',
      component: () =>
            import(/* webpackChunkName: "Eppo" */ './views/Eppo/eppoMain')
    },
    {
      path: '/EppoDetail',
      name: 'eppoDetail',
      component: () =>
        import(/* webpackChunkName: "Eppo" */ './views/Eppo/eppoDetail')
    },
    {
      path: '/EppoIndex',
      name: 'eppoIndex',
      component: () =>
            import(/* webpackChunkName: "Eppo" */ './views/Eppo/eppoIndex')
    },
    {
      path: '/EppoQrcode',
      name: 'qrcode',
      component: () =>
        import(/* webpackChunkName: "Eppo" */ './views/Eppo/qrcodeInvite')
    },
    {
      path: '/UavList',
      name: 'uavList',
      component: () =>
        import(/* webpackChunkName: "Uav" */ './views/Uav/uavList')
    },
    {
      path: '/UavDetail',
      name: 'uavDetail',
      component: () =>
        import(/* webpackChunkName: "Uav" */ './views/Uav/uavDetails')
    },
    {
      path: '/UavMaintenance',
      name: 'uavMaintenance',
      component: () =>
        import(/* webpackChunkName: "Uav" */ './views/Uav/uavMaintenance')
    },
    {
      path: '/UavRecycleDetail',
      name: 'recycleDetail',
      component: () =>
        import(/* webpackChunkName: "Uav" */ './views/Uav/recycleDetail')
    },
    {
      path: '/OrderList',
      name: 'orderList',
      component: () =>
        import(/* webpackChunkName: "Order" */ './views/Order/orderList')
    },
    {
      path: '/CreateOrder',
      name: 'createOrder',
      component: () =>
        import(/* webpackChunkName: "Order" */ './views/Order/createOrder')
    },
    {
      path: '/OrderDetail',
      name: 'orderDetail',
      component: () =>
        import(/* webpackChunkName: "Order" */ './views/Order/orderDetail')
    },
    {
      path: '/ShareOrder',
      name: 'shareOrder',
      component: () =>
        import(/* webpackChunkName: "Order" */ './views/Order/shareOrder')
    },
    {
      path: '/OrderAddTask',
      name: 'addTask',
      component: () =>
        import(/* webpackChunkName: "Order" */ './views/Order/addTask')
    },
    {
      path: '/OrderDelTask',
      name: 'delTask',
      component: () =>
        import(/* webpackChunkName: "Order" */ './views/Order/delTask')
    },
    {
      path: '/OrderDealTask',
      name: 'dealTask',
      component: () =>
        import(/* webpackChunkName: "Order" */ './views/Order/dealTask')
    },
    {
      path: '/QxList',
      name: 'qxList',
      component: () =>
        import(/* webpackChunkName: "Qx" */ './views/Qx/qxList')
    },
    {
      path: '/QxBind',
      name: 'qxBind',
      component: () =>
        import(/* webpackChunkName: "Qx" */ './views/Qx/bindUav')
    },
    {
      path: '/SandTable',
      name: 'SandTable',
      component: () =>
        import(/* webpackChunkName: "Qx" */ './views/SandTable/sandTable')
    },
    {
      path: '/taskDetail',
      name: 'TaskDetail',
      component: () =>
        import(/* webpackChunkName: "task" */ './views/Task/taskDetail')
    },
    {
      path: '/landDetail',
      name: 'LandDetail',
      component: () =>
        import(/* webpackChunkName: "task" */ './views/Task/landDetail')
    },
    {
      path: '/flightList',
      name: 'FlightList',
      component: () =>
        import(/* webpackChunkName: "task" */ './views/Task/flightsList')
    },
    {
      path: '/playBack',
      name: 'PlayBack',
      component: () =>
        import(/* webpackChunkName: "task" */ './views/Task/flightPlayback')
    }
  ]
})
