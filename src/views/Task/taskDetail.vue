<template>
  <div id="task-detail">
    <div id="viewDiv">
    </div>
    <div class="viewList" id="taskList">
      <div class="hideDetail">
        <span></span>
      </div>
      <div class="orderDetail">
        <div class="detailTitle">
          <div class="orderTitle">
            {{taskName}}
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
              <p>{{landArea}}</p>
              <span>地块面积（亩）</span>
            </div>
            <div class="ml3">
              <p>{{compDegree}}%</p>
              <span>完成度</span>
            </div>
            <div class="ml3">
              <p>{{workNum}}</p>
              <span>作业人员</span>
            </div>
          </div>
        </div>
        <div class="workDetail">
          <div>
            <label>作业地点</label>
            <p>{{workPosition}}</p>
          </div>
          <div>
            <label>作业时间</label>
            <p>{{workTime}}</p>
          </div>
          <div>
            <label>作业人员</label>
            <p>{{workNumDetail}}</p>
          </div>
          <div>
            <label>作业团队</label>
            <p>{{workTeamName}}</p>
          </div>
        </div>
        <div class="landDetail" @click="goLandDetail">
          <img src="../../common/img/task/landIcon@3x.png">
          <label>地块信息</label>
          <span class="more-info"></span>
        </div>
        <div class="landDetail" @click="lookFlightsList">
          <img src="../../common/img/task/playBack@3x.png">
          <label>飞行回放</label>
          <p>{{flightNum}}个架次</p>
          <span class="more-info"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import transForm from 'common/mixins/transform'
import { loadModules } from 'esri-loader'

export default {
  name: 'taskDetail',
  mixins: [transForm],
  data () {
    return {
      mapTitle: '',
      type: '1',
      timer: '',
      landArea: '', // 地块面设
      compDegree: '', // 完成度
      workNum: '', // 作业人员
      taskName: '', // 任务名称
      userName: '', // 用户姓名
      workPosition: '', // 作业地点
      workTime: '', // 作业时间
      workNumDetail: '', // 作业人员信息
      workTeamName: '', // 作业团队
      flyerList: [], // 作业人员集合
      createTime: '', // 创建时间
      taskId: '', // 任务ID
      userId: '', // 用户id
      teamId: '', // 植保队id
      blockId: '', // 地块id
      flightList: [],
      tid: '',
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
      onLine: navigator.onLine, // 当前网络状况
      landLats: [] // 地块坐标
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
    let orderH = document.getElementById('taskList').clientHeight
    let viewH = (clientH - orderH).toString()
    document.getElementById('viewDiv').style.height = viewH + 'px'
    this.set2DMap()
    this.getTaskDetail()
    this.queryFlightList()
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
          self.queryFlyDetail()
          // document.getElementById('sandTable').style.height = '400px'
        })
      })
    },
    getTaskDetail () {
      let task = JSON.parse(sessionStorage.getItem('taskContent'))
      if (task !== '') {
        this.taskName = task.taskName
        this.userName = task.createUserName
        this.createTime = task.createDate
        this.tid = task.id
        this.taskId = task.taskId
        this.queryTaskDetail()
      }
    },
    /* 获取订单详情 */
    queryTaskDetail () {
      let taskParams = new URLSearchParams()
      taskParams.set('tId', this.tid)
      this.request({
        url: '/crops-platform/api/task_v3/getTaskDetail',
        method: 'get',
        params: taskParams,
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
          this.landArea = result.taskDtail.land.area
          this.workPosition = result.taskDtail.land.position
          this.workTime = result.taskDtail.createDate
          if (result.taskDtail.percent !== undefined && result.taskDtail.percent !== '0') {
            if (result.taskDtail.percent.indexOf('.') !== -1) {
              this.compDegree = result.taskDtail.percent.substring(0, result.taskDtail.percent.indexOf('.'))
            } else {
              this.compDegree = result.taskDtail.percent
            }
          } else {
            this.compDegree = 0
          }
          console.log(this.compDegree)
          this.blockId = result.taskDtail.land.blockId
          // this.tid = result.taskDetail.id
          if (result.flyerList !== undefined) {
            this.workNum = result.flyerList.length
            for (let i = 0; i < result.flyerList.length; i++) {
              this.workNumDetail = result.flyerList[i].userName + ',' + this.workNumDetail
            }
            this.workNumDetail = this.workNumDetail.substring(0, this.workNumDetail.length - 1)
          } else {
            this.workNum = 0
            this.workNumDetail = '无'
          }
          if (result.taskDtail.office !== undefined) {
            this.workTeamName = result.taskDtail.office.name
          }
          // this.workNumDetail = result.taskDtail.userName
          // let ss = this.workNumDetail.split(',')
          // this.workNum = ss.length
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
    /* 查看地块详情 */
    goLandDetail () {
      this.$router.push({ path: '/landDetail', query: { 'blockId': this.blockId } })
    },
    /* 查看飞行架次列表 */
    lookFlightsList () {
      this.$router.push({ path: '/flightList', query: { 'taskId': this.taskId, 'tid': this.tid } })
    },
    /* 飞行详情 */
    queryFlyDetail () {
      let flyParams = new URLSearchParams()
      flyParams.set('tId', this.tid)
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
    /* 添加地图实例 */
    setSymbols () {
      this.view.graphics.removeMany(this.graphicsList)
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
        } else {
          this.view.center = ['123.4556544666', '41.7983268598'] // 没有飞机时候默认地图中心点为沈阳故宫
          this.view.zoom = 19
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
    /* 查询飞行架次 */
    queryFlightList () {
      let flightparams = new URLSearchParams()
      flightparams.set('taskId', this.taskId)
      this.request({
        url: '/crops-platform/api/task_v3/flyRecordList',
        method: 'get',
        params: flightparams,
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
          if (result !== null && result !== undefined) {
            this.flightList = result
            this.flightNum = this.flightList.length
          } else {
            this.flightNum = 0
            this.flightList = []
          }
        }
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
  #task-detail
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
        background-color $color-background-grey-new
        .detailTitle
          margin-top .07rem
          padding 0 .3rem
          background-color $color-background-white
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
          height 1.4rem
          background-color $color-background-white
          padding .4rem 0.52rem 0 0.52rem
          .detailList
            height 1.4rem
            display flex
            align-items center
            background-color $color-background-grey-new
            padding 0 .52rem
            justify-content space-between
            p
              font-size 22px
              color $color-font-grey
              text-align center
              height .6rem
              line-height .6rem
            span
              display block
              font-size 10px
              color $color-font-disabled-new
              margin-top: 4px;
              text-align: center;
        .workDetail
          background-color $color-background-white
          div
            height 1rem
            display flex
            align-items center
            padding 0 .3rem
            position relative
            justify-content space-between
            label
              font-size 15px
              color $color-font-black-new
            p
              font-size 15px
              color $color-font-grey
              text-align right
              word-break break-word
              flex 1
        .landDetail
          height 1.2rem
          display flex
          align-items center
          background-color $color-background-white
          padding 0 .3rem
          margin-top .12rem
          img
            height 14px
            width 14px
          p
            position absolute
            right .7rem
            font-size 15px
            color $color-font-disabled
          label
            font-size 15px
            color $color-font-black-new
            margin-left .16rem
        .more-info
          display block
          height 14px
          width 14px
          background url("../../common/img/editperinfo/moreInfo@3x.png") center center no-repeat
          background-size contain
          position absolute
          right .3rem
</style>
