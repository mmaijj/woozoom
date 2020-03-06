<template>
  <div id="order-detail">
    <div id="viewDiv">
    </div>
    <div class="viewList" v-show="isOrder" id="orderList">
        <div class="hideDetail">
          <span></span>
        </div>
        <div class="orderDetail">
          <div class="detailTitle">
            <div class="orderTitle">
              {{orderName}}
            </div>
            <div class="createTime">
              <img src="../../common/img/manger/planPlayer@3x.png">
              <div>
                <p>{{userName}}</p>创建于<p>{{createTime}}</p>
              </div>
            </div>
          </div>
          <div class="detailContent">
            <div class="detailList">
              <div>
                <p>{{landCount}}</p>
                <span>地块数量</span>
              </div>
              <div class="ml3">
                <p>{{orderArea}}</p>
                <span>订单面积（亩）</span>
              </div>
              <div class="ml3">
                <p>{{allDrug}}</p>
                <span>总用药量</span>
              </div>
            </div>
            <div class="detailList">
              <div>
                <p>{{uavCount}}</p>
                <span>作业无人机</span>
              </div>
              <div class="ml3">
                <p>{{flyerCount}}</p>
                <span>作业飞手</span>
              </div>
<!--              <div class="ml3">-->
<!--                <p>{{allDrug}}</p>-->
<!--                <span>总用药量</span>-->
<!--              </div>-->
            </div>
          </div>
          <div class="assocatedTask" @click="showTask()">
            <img src="../../common/img/order/associatedIcon@3x.png">
            <p>已关联的任务</p>
            <span>({{taskCount}})</span>
            <div></div>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import transForm from 'common/mixins/transform'
import { loadModules } from 'esri-loader'
export default {
  name: 'orderDetail',
  mixins: [transForm],
  data () {
    return {
      mapTitle: '',
      type: '1',
      timer: '',
      isOrder: true,
      positions: [],
      landCount: 0, // 地块数量
      flyerCount: 0, // 飞手
      pageNo: 1, // 当前页数
      pageSize: 10, // 每页个数
      isLast: 0, // 是否最后一页0：不是 1：是
      taskCount: 0, // 关联任务
      teamCount: 0, // 参与团队
      uavCount: 0, // 无人机数量
      orderArea: 0, // 总面积
      chArea: 0, // 测绘面积
      allDrug: 0, // 总用药量
      taskList: [],
      orderName: '', // 订单名称
      userName: '', // 用户姓名
      createTime: '', // 创建时间
      orderId: '', // 订单ID
      dealTask: [], // 已关联的任务
      landList: [], // 地块坐标集合
      obstaclesList: [], // 障碍物集合
      circleList: [], // 圆形障碍物
      polygonList: [], // 多边形障碍物
      landLons: [], // 地块坐标
      landPosition: [], // 地块转化坐标
      polygonPosition: [], // 多边形障碍物转化坐标
      setExt: '0', // 是否设置了地图显示范围 0:没有 1:有
      landGraphics: [], // 地块实例list
      zaGraphics: [], // 圆形障碍实例list
      polygonGraphics: [], // 多边形障碍物实例
      lineSymbol: {}, // 在线飞机实例
      flightNum: '', // 飞行架次
      lineSymbol1: {}, // 在线飞机实例
      landLats: [], // 地块坐标
      allLand: [], // 所有地块坐标集合
      // graphicsList: [],
      options: {
        pullDownRefresh: {
          threshold: 60,
          stop: 60,
          txt: '更新成功'
        },
        pullUpLoad: {
          threshold: 60,
          stop: 60,
          txt: '加载成功'
        }
      },
      userId: '', // 用户id
      onLine: navigator.onLine, // 当前网络状况
      teamId: '' // 植保队id
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    let clientH = document.documentElement.clientHeight
    let orderH = document.getElementById('orderList').clientHeight
    let viewH = (clientH - orderH).toString()
    document.getElementById('viewDiv').style.height = viewH + 'px'
    this.userId = localStorage.getItem('userId')
    this.teamId = localStorage.getItem('teamId')
    this.getOrderDetail()
  },
  methods: {
    /* 网络状况 */
    updateOnlineStatus (e) {
      const { type } = e
      this.onLine = type === 'online' // true:网络状况良好 false:当前没有网络
      if (!this.onLine) {
        this.$createDialog({
          type: 'alert',
          content: '请检查当前网络状况',
          icon: 'cubeic-alert'
        }).show()
      }
    },
    set2DMap () {
      let self = this
      this.options = {
        url: 'https://js.arcgis.com/4.7/'
      }
      loadModules(
        ['esri/Map', 'esri/views/MapView', 'esri/layers/WebTileLayer', 'esri/widgets/Zoom'],
        this.options
      ).then(([Map, MapView, WebTileLayer, Zoom, SpatialReference, Extent]) => {
        const titleLayer = new WebTileLayer({
          urlTemplate: 'https://mt.google.cn/vt/lyrs=y@126&hl=zh-CN&gl=CN&src=app&x={col}&y={row}&z={level}&s==Galil'
        })
        const myMap = new Map({
          basemap: 'satellite',
          layers: titleLayer
        })
        // 创建2D实例地图
        this.view = new MapView({
          map: myMap,
          container: 'viewDiv'
        })
        this.lineSymbol = {
          type: 'simple-fill', // autocasts as SimpleLineSymbol()
          color: [67, 136, 255, 0.5],
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 1
          }
        }
        this.lineSymbol1 = {
          type: 'simple-fill', // autocasts as new SimpleFillSymbol()
          color: [51, 51, 204, 0.9],
          style: 'solid',
          outline: { // autocasts as new SimpleLineSymbol()
            color: 'white',
            width: 1

          }
        }
        // var aa = this.positions
        this.view.ui._removeComponents(['zoom'])
        this.view.ui.remove('attribution')
        this.view.popup = null
        this.view.when(function () {
          for (let i = 0; i < self.dealTask.length; i++) {
            self.queryFlyDetailN(self.dealTask[i], i)
            self.queryFlyDetail(self.dealTask[i])
          }
        })
      })
    },
    // sumPosition (sum1, sum2) {
    //   return (Math.round(sum1 * 10000000000) + Math.round(sum2 * 10000000000)) / 10000000000
    // },
    getOrderDetail () {
      let order = JSON.parse(sessionStorage.getItem('orderContent'))
      if (order !== '') {
        this.orderName = order.orderName
        this.userName = order.user.name
        this.createTime = order.createDate
        this.orderId = order.id
        this.queryOrderDetail()
        this.searchDealTask()
      }
    },
    /* 飞行详情 */
    queryFlyDetail (item) {
      let tid = item.id
      let flyParams = new URLSearchParams()
      flyParams.set('tId', tid)
      flyParams.set('recordId', '')
      this.request({
        url: '/crops-platform/api/task_v3/track',
        method: 'get',
        params: flyParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          let result = response.data.data
          if (result.boundaryPoints !== undefined) {
            this.landList = result.boundaryPoints
          } else {
            this.landList = []
          }
          if (result.obstaclePoints2 !== undefined) {
            this.obstaclesList = result.obstaclePoints2
            for (let i = 0; i < this.obstaclesList.length; i++) {
              let type = this.obstaclesList[i][0].type // 0: 多边形障碍物 1：圆形障碍物
              if (type === 0) {
                this.polygonList.push(this.obstaclesList[i])
              } else if (type === 1) {
                this.circleList.push(this.obstaclesList[i])
              }
            }
          } else {
            this.obstaclesList = []
          }
          this.setSymbols()
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    /* 飞行详情 */
    queryFlyDetailN (item, long) {
      let tid = item.id
      let flyParams = new URLSearchParams()
      flyParams.set('tId', tid)
      flyParams.set('recordId', '')
      this.request({
        url: '/crops-platform/api/task_v3/track',
        method: 'get',
        params: flyParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          let result = response.data.data
          let ss = []
          if (result.boundaryPoints !== undefined) {
            ss = result.boundaryPoints
          }
          if (this.allLand.length !== 0) {
            this.allLand = this.allLand.concat(ss)
          } else {
            this.allLand = ss
          }
          if (long === this.dealTask.length - 1) {
            this.setMapExt(this.allLand)
          }
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    /* 添加地图范围 */
    setMapExt (item) {
      loadModules(
        ['esri/Graphic', 'esri/geometry/SpatialReference', 'esri/geometry/Extent'],
        this.options
      ).then(([Graphic, SpatialReference, Extent]) => {
        // for (let i = 0; i < this.dealTask.length; i++) {
        //   this.queryFlyDetailN(this.dealTask[i], i)
        // }
        if (item.length !== 0) {
          for (let i = 0; i < item.length; i++) {
            let trans = this.gcj_encrypt(item[i].lat, this.allLand[i].lon) // 将坐标转码
            this.landLats[i] = trans.lat
            this.landLons[i] = trans.lon
          }
          /* 根据返回的地块坐标点，规划地图显示范围 */
          let maxX = ''
          // 遍历数组，默认arr中的某一个元素为最大值，进行逐一比较
          for (let i = 0; i < this.landLons.length; i++) {
            // 外层循环一次，就拿arr[i] 和 内层循环arr.legend次的 arr[j] 做对比
            for (let j = i; j < this.landLons.length; j++) {
              if (this.landLons[i] < this.landLons[j]) {
                // 如果arr[j]大就把此时的值赋值给最大值变量max
                maxX = this.landLons[j]
                this.landLons[j] = this.landLons[i]
                this.landLons[i] = maxX
              }
            }
          }
          let maxY = ''
          // 遍历数组，默认arr中的某一个元素为最大值，进行逐一比较
          for (let i = 0; i < this.landLats.length; i++) {
            // 外层循环一次，就拿arr[i] 和 内层循环arr.legend次的 arr[j] 做对比
            for (let j = i; j < this.landLats.length; j++) {
              if (this.landLats[i] < this.landLats[j]) {
                // 如果arr[j]大就把此时的值赋值给最大值变量max
                maxY = this.landLats[j]
                this.landLats[j] = this.landLats[i]
                this.landLats[i] = maxY
              }
            }
          }
          if (this.setExt === '0') {
            /* 取x,y轴最大最小值 */
            let xmin = this.landLons[this.landLons.length - 1] - 0.0005
            let xMax = this.landLons[0] + 0.0005
            let yMin = this.landLats[this.landLats.length - 1] - 0.0005
            let yMax = this.landLats[0] + 0.0005
            this.ext = new Extent({
              xmin: xmin,
              ymin: yMin,
              xmax: xMax,
              ymax: yMax,
              spatialReference: new SpatialReference({ wkid: 4326 })
            })
            this.view.extent = this.ext
            this.setExt = '1'
          } else {
            // this.setExt = '1'
          }
          /* 根据返回的地块坐标绘制地块 */
          for (let i = 0; i < this.landList.length; i++) {
            let latPosition = this.landList[i].lat
            let lonPosition = this.landList[i].lon
            let trans = this.gcj_encrypt(latPosition, lonPosition) // 将坐标转码
            let realX = trans.lat
            let realY = trans.lon
            this.landPosition[i] = [realY, realX]
          }
          let polygon = {
            type: 'polygon', // autocasts as new Polyline()
            rings: this.landPosition
          }
          this.pointGraphic = new Graphic({
            geometry: polygon,
            symbol: this.lineSymbol
          })
          this.landGraphics[0] = this.pointGraphic
        }
      })
    },
    /* 添加地图实例 */
    setSymbols () {
      // this.view.graphics.removeMany(this.graphicsList)
      loadModules(
        ['esri/Graphic', 'esri/geometry/SpatialReference', 'esri/geometry/Extent', 'esri/geometry/Point', 'esri/geometry/Circle', 'esri/geometry/support/webMercatorUtils'],
        this.options
      ).then(([Graphic, SpatialReference, Extent, Point, Circle, webMercatorUtils]) => {
        // if (this.allLand.length !== 0) {
        //   this.view.extent = null
        //   /* 根据返回的地块坐标点，规划地图显示范围 */
        //   let maxX = ''
        //   // 遍历数组，默认arr中的某一个元素为最大值，进行逐一比较
        //   for (let i = 0; i < this.landLons.length; i++) {
        //     // 外层循环一次，就拿arr[i] 和 内层循环arr.legend次的 arr[j] 做对比
        //     for (let j = i; j < this.landLons.length; j++) {
        //       if (this.landLons[i] < this.landLons[j]) {
        //         // 如果arr[j]大就把此时的值赋值给最大值变量max
        //         maxX = this.landLons[j]
        //         this.landLons[j] = this.landLons[i]
        //         this.landLons[i] = maxX
        //       }
        //     }
        //   }
        //   let maxY = ''
        //   // 遍历数组，默认arr中的某一个元素为最大值，进行逐一比较
        //   for (let i = 0; i < this.landLats.length; i++) {
        //     // 外层循环一次，就拿arr[i] 和 内层循环arr.legend次的 arr[j] 做对比
        //     for (let j = i; j < this.landLats.length; j++) {
        //       if (this.landLats[i] < this.landLats[j]) {
        //         // 如果arr[j]大就把此时的值赋值给最大值变量max
        //         maxY = this.landLats[j]
        //         this.landLats[j] = this.landLats[i]
        //         this.landLats[i] = maxY
        //       }
        //     }
        //   }
        //   if (this.setExt === '0') {
        //     /* 取x,y轴最大最小值 */
        //     let xmin = this.landLons[this.landLons.length - 1] - 0.0005
        //     let xMax = this.landLons[0] + 0.0005
        //     let yMin = this.landLats[this.landLats.length - 1] - 0.0005
        //     let yMax = this.landLats[0] + 0.0005
        //     this.ext = new Extent({
        //       xmin: xmin,
        //       ymin: yMin,
        //       xmax: xMax,
        //       ymax: yMax,
        //       spatialReference: new SpatialReference({ wkid: 4326 })
        //     })
        //     this.view.extent = this.ext
        //     this.setExt = '1'
        //   } else {
        //     // this.setExt = '1'
        //   }
        /* 根据返回的地块坐标绘制地块 */
        for (let i = 0; i < this.landList.length; i++) {
          let latPosition = this.landList[i].lat
          let lonPosition = this.landList[i].lon
          let trans = this.gcj_encrypt(latPosition, lonPosition) // 将坐标转码
          let realX = trans.lat
          let realY = trans.lon
          this.landPosition[i] = [realY, realX]
        }
        let polygon = {
          type: 'polygon', // autocasts as new Polyline()
          rings: this.landPosition
        }
        this.pointGraphic = new Graphic({
          geometry: polygon,
          symbol: this.lineSymbol
        })
        this.landGraphics[0] = this.pointGraphic
        /* 绘制圆形障碍物 */
        if (this.circleList.length > 0) {
          for (let i = 0; i < this.circleList.length; i++) {
            let lat = this.circleList[i][0].lat
            let lon = this.circleList[i][0].lon
            let radius = this.circleList[i][0].radius
            let trans = this.gcj_encrypt(lat, lon) // 将坐标转码
            let realX = trans.lat
            let realY = trans.lon
            let ss = webMercatorUtils.project(new Point(realY, realX, new SpatialReference({ wkid: 4326 })), new SpatialReference({ wkid: 102100 }))
            let aa = this.getCirclePoints(ss, radius)
            let polygon1 = {
              type: 'polygon', // autocasts as new Polyline()
              rings: aa,
              spatialReference: new SpatialReference({ wkid: 102100 })
            }
            this.zaGraphics[i] = new Graphic({
              geodesic: true,
              geometry: polygon1,
              symbol: this.lineSymbol1
            })
          }
        }
        /* 绘制多边形障碍物 */
        if (this.polygonList.length > 0) {
          for (let j = 0; j < this.polygonList.length; j++) {
            for (let k = 0; k < this.polygonList[j].length; k++) {
              let latPosition = this.polygonList[j][k].lat
              let lonPosition = this.polygonList[j][k].lon
              let trans = this.gcj_encrypt(latPosition, lonPosition) // 将坐标转码
              let realX = trans.lat
              let realY = trans.lon
              this.polygonPosition[k] = [realY, realX]
            }
            let polygon = {
              type: 'polygon', // autocasts as new Polyline()
              rings: this.polygonPosition
            }
            let pointGraphic = new Graphic({
              geometry: polygon,
              symbol: this.lineSymbol1
            })
            this.polygonGraphics[j] = pointGraphic
          }
        }
        this.graphicsList = this.landGraphics.concat(this.zaGraphics)
        this.graphicsList = this.graphicsList.concat(this.polygonGraphics)
        this.view.graphics.addMany(this.graphicsList)
      })
    },
    /* 获取订单详情 */
    queryOrderDetail () {
      let orderParams = new URLSearchParams()
      orderParams.set('orderId', this.orderId)
      this.request({
        url: '/crops-platform/api/order_v3/getOrderDetail',
        method: 'get',
        params: orderParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          let result = response.data.data
          this.landCount = result.landCount
          this.flyerCount = result.flyerCount
          this.taskCount = result.taskCount
          if (result.acre !== undefined) {
            this.orderArea = result.acre
          }
          this.teamCount = result.teamCount
          this.uavCount = result.uavCount
        } else if (code === 5003 || code === 5000) {
          this.$createDialog({
            type: 'alert',
            content: '系统异常，请重新登录',
            icon: 'cubeic-alert',
            onConfirm: () => {
              localStorage.removeItem('userToken')
              this.$router.push({ path: '/UserLogin', query: { 'flag': '1' } })
            }
          }).show()
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    /* 跳转到任务 */
    showTask () {
      if (this.taskCount > 0) {
        this.$router.push({ path: '/OrderDealTask', query: { orderId: this.orderId } })
      } else {
        this.$router.push({ path: '/OrderAddTask', query: { orderId: this.orderId } })
      }
    },
    /* 查询此订单已关联的任务 */
    searchDealTask () {
      let searchParams = new URLSearchParams()
      // searchParams.set('orderId', this.orderId)
      searchParams.set('orderId', this.orderId)
      searchParams.set('taskName', '')
      searchParams.set('userId', '')
      searchParams.set('teamId', '')
      searchParams.set('pageNo', this.pageNo)
      searchParams.set('pageSize', this.pageSize)
      this.request({
        url: '/crops-platform/api/order_v3/getOrderTaskList',
        method: 'get',
        params: searchParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.isLast = response.data.data.lastPageInt
          if (response.data.data.count !== 0) {
            let result = response.data.data
            this.dealTask.push.apply(this.dealTask, result.list)
          } else {
            this.dealTask = []
          }
        }
        this.set2DMap()
      })
    },
    /* 通过中心点和半径计算出圆形的边点集合 */
    getCirclePoints (center, radius) {
      let pointSize = 10000
      let circleList = []
      let sin
      let cos
      let x
      let y
      let tempRadius = radius * 4 / 3
      for (let i = 0; i < pointSize; i++) {
        sin = Math.sin(Math.PI * 2 * i / pointSize)
        cos = Math.cos(Math.PI * 2 * i / pointSize)
        x = center.x + tempRadius * sin
        y = center.y + tempRadius * cos
        circleList.push([x, y])
      }
      return circleList
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import url("https://js.arcgis.com/4.7/esri/themes/light/main.css")
  @import "~common/stylus/variable"
  #order-detail
    height 100%
    width 100%
    background-color $color-background-grey
    #viewDiv
      /*height 7rem*/
    .viewList
      background-color $color-background-white
      border-radius 10px 10px 0 0
      width 100%
      position absolute
      bottom 0
      .hideDetail
        height .4rem
        display flex
        align-items center
        justify-content center
        span
          width 2.7rem
          height .08rem
          display block
          background-color $color-font-disabled-new
      .orderDetail
        .detailTitle
          margin-top .07rem
          padding 0 .3rem
          .orderTitle
            font-size 18px
            color $color-font-black-new
          .createTime
            margin-top .12rem
            display flex
            height .48rem
            align-items center
            img
              height 24px
              width 24px
            div
              display flex
              align-items center
              font-size 12px
              color $color-font-grey
              margin-left .14rem
        .detailContent
          height 2.8rem
          background-color $color-background-grey-new
          border-radius 6px
          padding .3rem .66rem .3rem .66rem
          margin 0.44rem .3rem 0 .3rem
          .detailList
            height 1.4rem
            display flex
            align-items center
            justify-content space-between
            p
              font-size 22px
              color $color-font-grey
              text-align center
            span
              display block
              font-size 10px
              color $color-font-disabled-new
              margin-top: 4px;
              text-align: center;
          /*.ml3*/
          /*  margin-left 1.3rem*/
        .assocatedTask
          height 1.4rem
          background-color $color-background-grey-new
          display flex
          align-items center
          margin-top .4rem
          img
            height 40px
            width 40px
            padding-left .3rem
          p
            font-size 14px
            color $color-font-black-new
            margin-left .2rem
          div
            width 13px
            height 14px
            background url("../../common/img/editperinfo/moreInfo@3x.png") center center no-repeat
            background-size contain
            position absolute
            right .3rem
</style>
