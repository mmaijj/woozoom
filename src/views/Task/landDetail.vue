<template>
  <div id="task-detail">
    <div id="viewDiv">
    </div>
    <div class="viewList" id="taskList" @click="showScreen">
      <div class="hideDetail">
        <span></span>
      </div>
      <div class="landDetail" v-show="!isShowAll">
        <div>
          <label>地块名称</label>
          <p>{{landName}}</p>
        </div>
        <div>
          <label>地块位置</label>
          <p>{{landPosition1}}</p>
        </div>
        <div>
          <label>测绘人员</label>
          <p>{{chPerson}}</p>
        </div>
        <div>
          <label>测绘方式</label>
          <p>{{chWay}}</p>
        </div>
        <div>
          <label>地块面积</label>
          <p>{{landArea}}亩</p>
        </div>
        <div>
          <label>测绘时间</label>
          <p>{{chTime}}</p>
        </div>
        <div>
          <label>联系人</label>
          <p>{{linePer}}</p>
        </div>
        <div>
          <label>联系电话</label>
          <p>{{lineTel}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import transForm from 'common/mixins/transform'
import common from 'common/mixins/common'
import { loadModules } from 'esri-loader'
export default {
  name: 'landDetail',
  mixins: [transForm, common],
  data () {
    return {
      landName: '', // 地块名称
      landPosition1: '', // 地块位置
      landArea: '', // 地块面积
      chPerson: '', // 测绘人员
      chWay: '', // 测绘方式
      lineTel: '', // 联系电话
      linePer: '', // 联系人
      taskId: '',
      landList: [], // 地块坐标集合
      obstaclesList: [], // 障碍物集合
      stopSprayList: [], // 停喷区
      infoPointList: [], // 辅助点
      circleList: [], // 圆形障碍物
      polygonList: [], // 多边形障碍物
      landLons: [], // 地块坐标
      landPosition: [], // 地块转化坐标
      polygonPosition: [], // 多边形障碍物转化坐标
      stopSprayPosition: [], // 停喷区坐标转化
      infoPointPosition: [], // 辅助点坐标转化
      setExt: '0', // 是否设置了地图显示范围 0:没有 1:有
      landGraphics: [], // 地块实例list
      zaGraphics: [], // 圆形障碍实例list
      stopSprayGraphics: [], // 停喷区实例list
      infoPointGraphics: [], // 辅助点实例list
      polygonGraphics: [], // 多边形障碍物实例
      lineSymbol: {}, // 在线飞机实例
      lineSymbol1: {}, // 在线飞机实例
      landLats: [], // 地块坐标
      onLine: navigator.onLine, // 当前网络状况
      isShowAll: false, // 是否展示全屏
      chTime: '' // 测绘时间
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
    let task = JSON.parse(sessionStorage.getItem('taskContent'))
    if (task !== '') {
      this.taskId = task.id
    }
    this.set2DMap()
    this.getLandDetail()
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
    /* 扩大屏幕 */
    showScreen () {
      if (this.isShowAll) {
        this.isShowAll = false
      } else {
        this.isShowAll = true
      }
      this.$nextTick(() => {
        let clientH = document.documentElement.clientHeight
        let orderH = document.getElementById('taskList').clientHeight
        let viewH = (clientH - orderH).toString()
        document.getElementById('viewDiv').style.height = viewH + 'px'
      })
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
          color: [0, 0, 0, 0.3],
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: '#FFFFFF',
            width: 1
          }
        }
        this.lineSymbolN = {
          type: 'simple-fill', // autocasts as SimpleLineSymbol()
          color: [0, 216, 25, 0.3],
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: '#00D819',
            width: 1
          }
        }
        this.lineSymbol1 = {
          type: 'simple-fill', // autocasts as new SimpleFillSymbol()
          color: [255, 27, 32, 0.3],
          style: 'solid',
          outline: { // autocasts as new SimpleLineSymbol()
            color: '#FF1B26',
            width: 1
          }
        }
        this.stopSymbol = {
          type: 'simple-fill', // autocasts as new SimpleFillSymbol()
          color: [255, 212, 40, 0.3],
          style: 'solid',
          outline: { // autocasts as new SimpleLineSymbol()
            color: '#FFD428',
            width: 1
          }
        }
        this.infoSymbol = {
          type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
          color: [103, 0, 255],
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 2
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
    getLandDetail () {
      let blockId = this.$route.query.blockId
      let landParams = new URLSearchParams()
      landParams.set('blockId', blockId)
      this.request({
        url: '/crops-platform/api/task_v3/getLandDetail',
        method: 'get',
        params: landParams,
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
          this.landName = result.landName
          this.landPosition1 = result.position
          this.chPerson = result.user.name
          this.chWay = '采点器'
          this.landArea = result.area
          if (result.createTime !== '') {
            this.chTime = this.formatDate(Number(result.createTime))
          }
          this.linePer = result.farmersName
          this.lineTel = result.farmersPhone
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
    /* 飞行详情 */
    queryFlyDetail () {
      let flyParams = new URLSearchParams()
      flyParams.set('tId', this.taskId)
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
          if (result.stopSprayPoint !== undefined) {
            this.stopSprayList = JSON.parse(result.stopSprayPoint)
            if (this.stopSprayList === undefined) {
              this.stopSprayList = []
            }
          } else {
            this.stopSprayList = []
          }
          if (result.infoPoint !== undefined) {
            this.infoPointList = JSON.parse(result.infoPoint)
            if (this.infoPointList === undefined) {
              this.infoPointList = []
            }
          } else {
            this.infoPointList = []
          }
          this.setSymbols()
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
        if (this.landList.length === 0) {
          this.view.center = ['123.4556544666', '41.7983268598'] // 没有飞机时候默认地图中心点为沈阳故宫
          this.view.zoom = 19
        } else if (this.landList.length > 0) {
          this.landPosition = []
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
          let flightNum = this.$route.query.flightNum
          let symbol = null
          if (flightNum > 0) {
            symbol = this.lineSymbolN
          } else {
            symbol = this.lineSymbol
          }
          this.pointGraphic = new Graphic({
            geometry: polygon,
            symbol: symbol
          })
          this.landGraphics[0] = this.pointGraphic
        }
        /* 根据返回坐标点绘制停喷区 */
        if (this.stopSprayList.length > 0) {
          for (let i = 0; i < this.stopSprayList.length; i++) {
            this.stopSprayPosition = []
            for (let j = 0; j < this.stopSprayList[i].length; j++) {
              let latPosition = this.stopSprayList[i][j].mLatitude
              let lonPosition = this.stopSprayList[i][j].mLongitude
              let trans = this.gcj_encrypt(latPosition, lonPosition) // 将坐标转码
              let realX = trans.lat
              let realY = trans.lon
              this.stopSprayPosition[j] = [realY, realX]
            }
            let stopPolygon = {
              type: 'polygon', // autocasts as new Polyline()
              rings: this.stopSprayPosition
            }
            let stopSprayGraphic = new Graphic({
              geometry: stopPolygon,
              symbol: this.stopSymbol
            })
            this.stopSprayGraphics[i] = stopSprayGraphic
          }
        }
        /* 绘制辅助点 */
        if (this.infoPointList.length > 0) {
          for (let i = 0; i < this.infoPointList.length; i++) {
            let latPosition = this.infoPointList[i].mLatitude
            let lonPosition = this.infoPointList[i].mLongitude
            let trans = this.gcj_encrypt(latPosition, lonPosition) // 将坐标转码
            let realX = trans.lat
            let realY = trans.lon
            let point = {
              type: 'point',
              longitude: realY,
              latitude: realX
            }
            let infoPointGraphic = new Graphic({
              geometry: point,
              symbol: this.infoSymbol
            })
            this.infoPointGraphics[i] = infoPointGraphic
          }
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
            this.polygonPosition = []
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
        this.graphicsList = this.graphicsList.concat(this.stopSprayGraphics)
        this.graphicsList = this.graphicsList.concat(this.infoPointGraphics)
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
      .landDetail
        div
          height .8rem
          display flex
          align-items center
          justify-content space-between
          padding 0 .3rem
          label
            font-size 15px
            color $color-font-black-new
          p
            font-size 15px
            color $color-font-grey
</style>
