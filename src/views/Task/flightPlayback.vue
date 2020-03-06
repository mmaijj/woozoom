<template>
    <div id="play-back">
      <div id="viewDiv">
      </div>
      <div id="flyControl">
        <img :src="playIcon" @click="playBack">
        <span class="timeSign">{{nowTime}}/{{totalTime}}</span>
        <div class="speedBtn" @click="controlSpeed">{{speedNum}}x</div>
      </div>
    </div>
</template>

<script>
import countDown from 'common/mixins/common'
import transForm from 'common/mixins/transform'
import { loadModules } from 'esri-loader'
export default {
  name: 'flightPlayback',
  mixins: [transForm, countDown],
  data () {
    return {
      intervalMap: null,
      timeIntervalMap: null,
      tid: '',
      flightList: [],
      flightLats: [],
      flightLons: [],
      setExt: '0', // 是否设置了地图显示范围 0:没有 1:有
      lineSymbol: {}, // 在线飞机实例
      landList: [], // 地块坐标集合
      obstaclesList: [], // 障碍物集合
      circleList: [], // 圆形障碍物
      polygonList: [], // 多边形障碍物
      landLons: [], // 地块坐标
      landLats: [], // 地块坐标
      landPosition: [], // 地块转化坐标
      flightPosition: [], // 飞行回放转换坐标
      polygonPosition: [], // 多边形障碍物转化坐标
      landGraphics: [], // 地块实例list
      zaGraphics: [], // 圆形障碍实例list
      polylineGraphics: [], // 飞行轨迹list
      polygonGraphics: [], // 多边形障碍物实例
      lineSymbol1: {}, // 在线飞机实例
      flyPosition: 0,
      timeInterval: 2000, // 绘制飞行轨迹时间间隔（ms）
      totalTimeIn: 2000,
      recordId: '', // 架次id
      speedNum: 1, // 播放速度
      flyDuration: '', // 飞行时长
      playStatus: '0', // 播放状态(0:暂停 1:播放)
      nowTime: 0, // 当前时间
      timeIcon: 0,
      totalTime: '', // 总共时间
      onLine: navigator.onLine, // 当前网络状况
      playIcon: require('../../common/img/task/playBtn@3x.png') // 播放按钮显示图标
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  /* 清空定时器 */
  beforeDestroy () {
    clearInterval(this.timeIntervalMap)
    this.intervalMap = null // 设置为null
    clearInterval(this.timeIntervalMap)
    this.timeIntervalMap = null // 设置为null
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.tid = this.$route.query.tid
    this.recordId = this.$route.query.recordId
    this.flyDuration = Number(localStorage.getItem('flyDuration'))
    this.totalTime = this.formatTime(this.flyDuration)
    this.nowTime = this.formatTime(0)
    let clientH = document.documentElement.clientHeight
    let orderH = document.getElementById('flyControl').clientHeight
    let viewH = (clientH - orderH).toString()
    document.getElementById('viewDiv').style.height = viewH + 'px'
    this.set2DMap()
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
        this.flySymbol = {
          type: 'simple-line', // autocasts as new SimpleFillSymbol()
          color: [0, 220, 255],
          width: 2
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
    /* 飞行详情 */
    queryFlyDetail () {
      let flyParams = new URLSearchParams()
      flyParams.set('tId', this.tid)
      flyParams.set('recordId', this.recordId)
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
          if (result.recordsPoints !== undefined) {
            this.flightList = result.recordsPoints[0].realPointsList
            for (let i = 0; i < this.flightList.length; i++) {
              let trans = this.gcj_encrypt(this.flightList[i].lat, this.flightList[i].lon) // 将坐标转码
              this.flightLats[i] = trans.lat
              this.flightLons[i] = trans.lon
            }
          } else {
            this.flightList = []
          }
          if (this.flightList.length > 0) {
            this.timeInterval = this.flyDuration / this.flightList.length
          } else {
            this.timeInterval = 2000
          }
          // this.totalTimeIn = this.flyDuration / this.flightList.length
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
        /* 根据返回的地块坐标点，规划地图显示范围 */
        if (this.landList.length > 0) {
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
          }
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
    /* 添加飞行轨迹 */
    setTrajectory () {
      if (this.flyPosition > this.flightList.length) {
        clearInterval(this.intervalMap)
        this.intervalMap = null // 设置为null
        clearInterval(this.timeIntervalMap)
        this.timeIntervalMap = null
      } else {
        loadModules(
          ['esri/Graphic'],
          this.options
        ).then(([Graphic]) => {
          /* 绘制飞行路线 */
          let flyBack = []
          for (let j = 0; j < this.flyPosition; j++) {
            flyBack[j] = this.flightList[j]
          }
          if (flyBack.length > 0) {
            for (let i = 0; i < flyBack.length; i++) {
              let latPosition = flyBack[i].lat
              let lonPosition = flyBack[i].lon
              let trans = this.gcj_encrypt(latPosition, lonPosition) // 将坐标转码
              let realX = trans.lat
              let realY = trans.lon
              this.flightPosition[i] = [realY, realX]
            }
            let polyline = {
              type: 'polyline', // autocasts as new Polyline()
              paths: this.flightPosition
            }
            this.pointGraphic = new Graphic({
              geometry: polyline,
              symbol: this.flySymbol
            })
            this.polylineGraphics[0] = this.pointGraphic
          }
          this.graphicsList = this.polylineGraphics
          this.flyPosition++
          this.view.graphics.addMany(this.graphicsList)
        })
        if (this.timeIcon !== this.flyDuration) {
          this.timeIcon = (this.flyDuration / this.flightList.length) * (this.flyPosition + 1)
          this.nowTime = this.formatTime(this.timeIcon)
        }
      }
    },
    /* 飞行回放 */
    playBack () {
      if (this.playStatus === '0') {
        this.playStatus = '1'
        this.playIcon = require('../../common/img/task/pauseBtn@3x.png')
        if (this.intervalMap != null) {
          return
        }
        this.intervalMap = setInterval(() => {
          this.setTrajectory()
        }, this.timeInterval)
        if (this.timeIntervalMap != null) {
          return
        }
        this.timeIntervalMap = setInterval(() => {
          this.timeIcon = this.timeIcon + 1000
          this.nowTime = this.formatTime(this.timeIcon)
          // if (this.timeIcon >= this.flyDuration) {
          //   clearInterval(this.timeIntervalMap)
          //   this.timeIntervalMap = null
          // }
        }, 1000)
      } else if (this.playStatus === '1') {
        this.playStatus = '0'
        this.playIcon = require('../../common/img/task/playBtn@3x.png')
        clearInterval(this.intervalMap)
        this.intervalMap = null // 设置为null
        clearInterval(this.timeIntervalMap)
        this.timeIntervalMap = null
      }
    },
    /* 控制回放速度 */
    controlSpeed () {
      clearInterval(this.intervalMap)
      this.intervalMap = null // 设置为null
      if (this.playStatus === '1') {
        if (this.speedNum === 1) {
          this.speedNum = 1.5
          this.timeInterval = this.timeInterval / 1.5
          this.totalTimeIn = this.totalTimeIn * 1.5
        } else if (this.speedNum === 1.5) {
          this.speedNum = 2
          this.timeInterval = this.timeInterval / 2
          this.totalTimeIn = this.totalTimeIn * 2
        } else if (this.speedNum === 2) {
          this.speedNum = 2.5
          this.timeInterval = this.timeInterval / 2.5
          this.totalTimeIn = this.totalTimeIn * 2.5
        } else if (this.speedNum === 2.5) {
          this.speedNum = 3
          this.timeInterval = this.timeInterval / 3
          this.totalTimeIn = this.totalTimeIn * 3
        } else {
          this.speedNum = 1
          this.timeInterval = this.flyDuration / this.flightList.length
          this.totalTimeIn = this.flyDuration / this.flightList.length
        }
        this.intervalMap = setInterval(() => {
          this.setTrajectory()
        }, this.timeInterval)
      }
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
  #play-back
    height 100%
    width 100%
    background-color $color-background-grey
    #flyControl
      height .8rem
      background-color #000000
      display flex
      align-items center
      position relative
      img
        height .52rem
        width .52rem
        margin-left .2rem
      .timeSign
        color #ffffff
        font-size 12px
        margin-left .16rem
      .speedBtn
        width 1rem
        height .48rem
        line-height .48rem
        text-align center
        border 1px solid $color-font-disabled
        color #ffffff
        border-radius 6px
        position absolute
        right .2rem
</style>
