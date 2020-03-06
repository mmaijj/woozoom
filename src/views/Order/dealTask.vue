<template>
  <div id="order-detail">
    <div id="viewDiv">
    </div>
    <div class="viewListG">
      <div class="hideDetail">
        <span></span>
      </div>
      <div class="taskList" id="taskList">
        <div class="searchTitle" v-show="!isShowSearch">
          <span @click="screenTeam">{{userTag}}</span>
          <span class="cubeic-select"></span>
          <img src="../../common/img/order/searchGrey@3x.png" @click="showSearch">
          <span class="mangerIcon" @click="mangerTask">管理</span>
        </div>
        <div class="search-header" v-show="isShowSearch">
          <div class="searchText">
            <cube-input
              :placeholder="searchVal"
              v-model="taskName"
              @input="searchByName"
            >
              <template v-slot:prepend>
                <div class="cubeic-search ml12"></div>
              </template>
            </cube-input>
          </div>
          <span class="cancerBtn" @click="cancerBtn">取消</span>
        </div>
        <div class="taskScroll">
          <cube-scroll
            ref="scroll"
            :data="taskList"
            :options="options"
            @pulling-down="onPullingDown"
            @pulling-up="onPullingUp"
          >
            <div class="taskDetail" v-for="(item, index) in dealTask" :key="index" @click="goToDetail(item)">
              <p>{{item.taskName}}</p>
              <div class="titleBot">
                <div>
                  <label class="cubeic-aim"></label>
                  <span v-if="item.land !== undefined">{{item.land.position}}</span>
                </div>
                <div class="creatTime">
                  <label class="cubeic-calendar"></label>
                  <span>{{item.updateDate}}</span>
                </div>
                <div class="beTeam">
                  <img src="../../common/img/task/beTeam.png">
                  <span v-if="item.office !== undefined">{{item.office.name}}</span>
                </div>
              </div>
              <div class="taskContent">
                <div>
                  <img src="../../common/img/order/createIcon@3x.png">
                  <span>{{item.createUserName}}</span>
                </div>
                <div>
                  <img src="../../common/img/order/areaIcon@3x.png">
                  <span>{{item.acre}}亩</span>
                </div>
                <div>
                  <img src="../../common/img/order/percentIcon@3x.png">
                  <span v-if="item.percent !== undefined">{{item.percent}}%</span>
                  <span v-if="item.percent === undefined">0%</span>
                </div>
              </div>
            </div>
          </cube-scroll>
        </div>
      </div>
      <span class="addOrder" @click="addOrder">
      </span>
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
      searchVal: '搜索任务',
      userTag: '所有团队',
      isOrder: true,
      positions: [],
      pageNo: 1, // 当前页数
      pageSize: 10, // 每页个数
      isLast: 0, // 是否最后一页0：不是 1：是
      taskList: [],
      orderName: '', // 订单名称
      userName: '', // 用户姓名
      createTime: '', // 创建时间
      orderId: '', // 订单ID
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
      dealTask: [], // 已关联的任务
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
      isShowSearch: false,
      userId: '', // 用户id
      taskName: '', // 任务名称
      onLine: navigator.onLine, // 当前网络状况
      createId: '', // 订单创建者id
      teamId: '' // 植保队id
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    this.createId = localStorage.getItem('createId')
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    let clientH = document.documentElement.clientHeight
    let orderH = document.getElementById('taskList').clientHeight
    let viewH = (clientH - orderH).toString()
    document.getElementById('viewDiv').style.height = viewH + 'px'
    this.orderId = this.$route.query.orderId
    this.searchDealTask()
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
            self.queryFlyDetail(self.dealTask[i])
          }
          // self.queryFlyDetail()
          // document.getElementById('sandTable').style.height = '400px'
        })
      })
    },
    sumPosition (sum1, sum2) {
      return (Math.round(sum1 * 10000000000) + Math.round(sum2 * 10000000000)) / 10000000000
    },
    /* 添加任务 */
    addOrder () {
      this.$router.push({ path: '/OrderAddTask', query: { orderId: this.orderId } })
    },
    /* 管理任务 */
    mangerTask () {
      this.$router.push({ path: '/OrderDelTask', query: { orderId: this.orderId } })
    },
    /* 展示搜索框 */
    showSearch () {
      this.isShowSearch = true
    },
    cancerBtn () {
      this.setExt = '0'
      this.isShowSearch = false
      this.taskName = ''
      this.dealTask = []
      this.searchDealTask()
    },
    /* 根据名称查询任务 */
    searchByName () {
      if (this.isShowSearch) {
        this.pageNo = 1
        this.setExt = '0'
        this.dealTask = []
        this.searchDealTask()
      }
    },
    /* 查询此订单已关联的任务 */
    searchDealTask () {
      let searchParams = new URLSearchParams()
      // searchParams.set('orderId', this.orderId)
      searchParams.set('orderId', this.orderId)
      searchParams.set('taskName', this.taskName)
      searchParams.set('userId', this.userId)
      searchParams.set('teamId', this.teamId)
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
            for (let i = 0; i < this.dealTask.length; i++) {
              if (this.dealTask[i].percent !== undefined && this.dealTask[i].percent !== '0') {
                if (this.dealTask[i].percent.indexOf('.') !== -1) {
                  this.dealTask[i].percent = this.dealTask[i].percent.substring(0, this.dealTask[i].percent.indexOf('.'))
                }
                if (this.dealTask[i].percent === '0') {
                  this.dealTask[i].chArea = this.dealTask[i].acre
                } else {
                  this.dealTask[i].chArea = (this.dealTask[i].acre / this.dealTask[i].percent) * 100
                }
              } else {
                this.dealTask[i].chArea = this.dealTask[i].acre
              }
              if (this.dealTask[i].acre !== undefined) {
                this.dealTask[i].acre = Math.round(this.dealTask[i].acre * 1000) / 1000
              }
              if (this.dealTask[i].updateDate !== undefined) {
                this.dealTask[i].updateDate = this.dealTask[i].updateDate.substring(0, 10)
              }
            }
          } else {
            this.dealTask = []
          }
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
        this.set2DMap()
      })
    },
    /* 筛选团队 */
    screenTeam () {
      this.screenComp = this.screenComp || this.$createScreeningTeam({
        $props: {
          orderId: this.orderId
        },
        $events: {
          leave: (val) => {
            this.screenComp.hide()
            this.dealTask = []
            this.teamId = val.teamId
            this.userId = val.userId
            this.userTag = val.userName
            this.setExt = '0'
            this.landList = []
            this.obstaclesList = []
            this.searchDealTask()
          }
        }
      })
      this.screenComp.show()
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
            for (let i = 0; i < this.landList.length; i++) {
              let trans = this.gcj_encrypt(this.landList[i].lat, this.landList[i].lon) // 将坐标转码
              this.landLats[i] = trans.lat
              this.landLons[i] = trans.lon
            }
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
    /* 添加地图实例 */
    setSymbols () {
      // this.view.graphics.removeMany(this.graphicsList)
      loadModules(
        ['esri/Graphic', 'esri/geometry/SpatialReference', 'esri/geometry/Extent', 'esri/geometry/Point', 'esri/geometry/Circle', 'esri/geometry/support/webMercatorUtils'],
        this.options
      ).then(([Graphic, SpatialReference, Extent, Point, Circle, webMercatorUtils]) => {
        if (this.landList.length > 0) {
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
    },
    /* 查看订单详情 */
    goToDetail (item) {
      let taskData = item
      sessionStorage.setItem('taskContent', JSON.stringify(taskData))
      this.$router.push('/taskDetail')
    },
    /* 上拉加载 */
    onPullingUp () {
      if (this.isLast === 0) {
        setTimeout(() => {
          this.pageNo = this.pageNo + 1
          this.searchDealTask()
        }, 1000)
      } else {
        this.$refs.scroll.forceUpdate()
      }
    },
    /* 下拉刷新 */
    onPullingDown () {
      this.pageNo = 1
      this.taskList = []
      this.searchDealTask()
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import url("https://js.arcgis.com/4.7/esri/themes/dark-red/main.css")
  @import "~common/stylus/variable"
  #order-detail
    height 100%
    width 100%
    background-color $color-background-grey
    overflow-y auto
    #viewDiv
      /*height 7rem*/
    .viewListG
      background-color $color-background-grey
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
      .taskList
        height 7rem
        .searchTitle
          display flex
          height .8rem
          align-items center
          margin  0 .3rem
          position relative
          img
            height .4rem
            width .4rem
            position absolute
            right 1.2rem
          .cubeic-select
            margin-left .2rem
          .mangerIcon
            position absolute
            right 0
        .taskDetail
          padding 0 .3rem .28rem .3rem
          background-color $color-background-white
          box-shadow 0px 4px 10px 0px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.05)
          border-radius 6px
          margin-top .12rem
          p
            font-size 16px
            color $color-font-black-new
            padding-top .2rem
        .titleBot
          height .24rem
          display flex
          align-items center
          margin-top .32rem
          div
            display flex
            align-items center
          img
            width 17px
            height 15px
          span
            font-size 12px
            color $color-font-disabled-new
            margin-left .14rem
          .creatTime
            margin-left .3rem
          .beTeam
            margin-left .3rem
        .taskContent
          margin-top .36rem
          display flex
          height .6rem
          align-items center
          justify-content space-around
          background-color #F8F8F8
          div
            /*width 33%*/
            text-align center
          img
            height .2rem
            width .2rem
          span
            font-size 12px
            color $color-font-grey
            margin-left .2rem
      .addOrder
        height 48px
        width 48px
        background url("../../common/img/uavplan/add_icon@3x.png") center center no-repeat
        background-size contain
        position fixed
        bottom .4rem
        right .3rem
        z-index 99
      .taskScroll
        height 90%
        margin 0 .3rem
      .search-header
        height .8rem
        margin 0 .3rem
        display flex
        align-items center
        position relative
        .searchText
          width 5.8rem
        .cancerBtn
          position absolute
          right .3rem
          font-size 12px
        span
          margin-left .16rem
</style>
