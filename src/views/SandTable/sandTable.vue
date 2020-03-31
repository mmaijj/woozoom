<template>
    <div id="sand-table">
      <div id="sandTable"></div>
      <div class="numBtn" @click="showNumlist" v-show="showNumBtn"></div>
      <div class="uavBtn" @click="showUavlist" v-show="!showUav"></div>
      <div class="numList" v-show="showNum">
        <div class="numTitle" @click="hideNumlist">成员列表</div>
        <div class="numDetail" v-for="(item, index) in playerList" :key="index" :class="{'selectActive':numIndex===index}" @click="goNum(item, index)">{{item.userName}}</div>
      </div>
      <div class="uavList" v-show="showUav">
        <div class="uavTitle" @click="hideUavlist">无人机列表</div>
        <div class="uavDetail" v-for="(item, index) in uavList" :key="index" :class="{'selectActive':uavIndex===index}" @click="goUav(item, index)">{{item.name}}</div>
      </div>
      <div class="uavDetail" id="uavDetail" v-show="isShowUav">
        <div class="uavTitle">
          <img :src="uavIcon">
          <label>{{uavName}}</label>
<!--          <p>{{userName}}</p>-->
        </div>
        <div class="uavBottom">
          <img src="../../common/img/sandtable/V@3x.png">
          <p class="vDetail">{{vPosition}}m/s</p>
          <img src="../../common/img/sandtable/H@3x.png" style="margin-left: .3rem">
          <p class="vDetail">{{hPositon}}m</p>
          <img src="../../common/img/sandtable/jwdIcon@3x.png">
          <p class="position">N{{uavLon}}, E{{uavLat}}</p>
        </div>
      </div>
      <div class="flyerDetail" id="flyerDetail" v-show="isShowFly">
        <p style="width: 22%;overflow-wrap: break-word">{{flyerName}}</p>
        <div class="rightLine"></div>
        <p style="width: 20%;overflow-wrap: break-word">{{flyerPhone}}</p>
        <div class="flyBottom">
          <img :src="flyerPosition">
          <p class="position">N{{flyLon}}, E{{flyLat}}</p>
        </div>
      </div>
      <div :class="screenHeight" @click="showAllScreen"></div>
    </div>
</template>

<script>
import transForm from 'common/mixins/transform'
import { loadModules } from 'esri-loader'
export default {
  name: 'sandTable',
  mixins: [transForm],
  data () {
    return {
      uavList: [], // 无人机列表
      playerList: [], // 飞手列表
      uavPosition: [], // 无人机位置信息
      palyerPosition: [], // 飞手位置信息
      showNum: false, // 是否显示成员列表
      showNumBtn: true,
      showUav: false, // 是否显示无人机列表
      uavLons: [],
      uavLats: [],
      allLons: [], // 飞机和人员的坐标集合
      allLats: [],
      playerLons: [],
      isShowFly: false, // 是否显示飞手详细信息
      isShowUav: false, // 是否显示无人机详细信息
      playerLats: [],
      uavGraphics: [], // 无人机实例list
      flyerGraphics: [], // 人员实例list
      graphicsList: [], // 实例list
      polylineGraphics: [], // 飞行轨迹list
      ext: null, // 地图显示范围
      setExt: '0', // 是否设置了地图显示范围 0:没有 1:有
      uavIndex: '',
      numIndex: '',
      screenHeight: 'allScreen',
      // intervalMap: null,
      view: null,
      point: {},
      options: {
        url: 'https://js.arcgis.com/4.7/'
      },
      lineGraphic: null,
      pointGraphic: null,
      playerGraphic: null,
      uavIcon: '', // 无人机图标
      uavName: '', // 无人机名称
      userName: '', // 拥有者
      vPosition: '', // 速度
      hPositon: '', // h速度
      flyerName: '', // 飞行人员
      flyerPhone: '', // 人员电话
      flyerPosition: '', // 人员图标
      playerDetail: '', // 人员详细信息
      uavDetail: '', // 无人机详细信息
      viewGraphics: '',
      uavLon: '',
      uavLat: '',
      flyLon: '',
      flyLat: '',
      nowId: '',
      oldId: '',
      graphicList: [],
      firstShowPer: '0', // 是否第一次显示人员
      firstShowUav: '0', // 是否第一次显示飞机
      activeId: '', // 当前选中的图标id
      onlineSymbol: {}, // 在线飞机实例
      outlineSymbol: {}, // 离线飞机实例
      lineInSymbol: {}, // 在线人员实例
      userQx: '', // 用户权限
      lineOutSymbol: {}, // 离线人员实例
      onUavSymbol: {}, // 在线飞机选中实例
      offUavSymbol: {}, // 离线飞机选中实例
      onPlayerSymbol: {}, // 在线人员选中实例
      offPlayerSymbol: {}, // 离线人员选中实例
      chooseUavPosition: [], // 选中的在线飞机飞行轨迹坐标集合
      onLine: navigator.onLine // 当前网络状况
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.set2DMap()
    this.userQx = localStorage.getItem('userQx')
    if (this.userQx === '1') {
      this.showNumBtn = true
    } else {
      this.showNumBtn = false
    }
  },
  /* 清空定时器 */
  beforeDestroy () {
    clearInterval(this.intervalMap)
    this.intervalMap = null // 设置为null
    clearInterval(this.intervalMapN)
    this.intervalMapN = null // 设置为null
    clearInterval(this.intervalMapM)
    this.intervalMapM = null // 设置为null
    clearInterval(this.intervalMapA)
    this.intervalMapA = null // 设置为null
    clearInterval(this.intervalMapB)
    this.intervalMapB = null // 设置为null
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
    /* 获取无人机列表 */
    getUavList () {
      this.request({
        url: '/crops-platform/api/monitor_v3/userAndUavList',
        method: 'get',
        headers: {
          'clientType': 'weixin',
          'deviceId': '1165465'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        let result = response.data.data
        if (code === 0) {
          this.uavList = []
          if (result.uavs !== undefined) {
            for (let j = 0; j < result.uavs.length; j++) {
              if (result.uavs[j].lon1 !== 0 && result.uavs[j].lat1 !== 0) {
                this.uavList.push(result.uavs[j])
              }
            }
            for (let i = 0; i < this.uavList.length; i++) {
              this.uavLons[i] = this.uavList[i].lon1
              this.uavLats[i] = this.uavList[i].lat1
            }
          }
          if (result.flyers !== undefined) {
            this.playerList = result.flyers
            for (let j = 0; j < this.playerList.length; j++) {
              if (this.playerList[j].lat === 0) {
                this.playerList[j].lat = 41.7983268598
              }
              if (this.playerList[j].lon === 0) {
                this.playerList[j].lon = 123.4556544666
              }
              this.playerLons[j] = this.playerList[j].lon
              this.playerLats[j] = this.playerList[j].lat
            }
          }
          // 获取飞机以及人员的坐标集合确定地图边界
          this.allLons = this.uavLons.concat(this.playerLons)
          this.allLats = this.uavLats.concat(this.playerLats)
          this.setSymbols()
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
    set2DMap () {
      let self = this
      this.options = {
        url: 'https://js.arcgis.com/4.7/'
      }
      loadModules(
        ['esri/Map', 'esri/views/MapView', 'esri/layers/WebTileLayer', 'esri/widgets/Zoom'],
        this.options
      ).then(([Map, MapView, WebTileLayer]) => {
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
          container: 'sandTable'
        })
        /* 在线飞机实例 */
        this.onlineSymbol = {
          type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
          url: require('../../common/img/sandtable/planOnline@3x.png'),
          width: '16px',
          height: '16px'
        }
        /* 离线飞机实例 */
        // eslint-disable-next-line no-unused-vars
        this.outlineSymbol = {
          type: 'picture-marker',
          url: require('../../common/img/sandtable/planOffline@3x.png'),
          width: '16px',
          height: '16px'
        }
        /* 在线人员实例 */
        // eslint-disable-next-line no-unused-vars
        this.lineInSymbol = {
          type: 'picture-marker',
          url: require('../../common/img/sandtable/mapPlayer@3x.png'),
          width: '16px',
          height: '16px'
        }
        /* 离线人员实例 */
        // eslint-disable-next-line no-unused-vars
        this.lineOutSymbol = {
          type: 'picture-marker',
          url: require('../../common/img/sandtable/playerGrey@3x.png'),
          width: '16px',
          height: '16px'
        }
        /* 在线选中飞机实例 */
        this.onUavSymbol = {
          type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
          url: require('../../common/img/sandtable/onlineUavA@3x.png'),
          width: '72px',
          height: '72px'
        }
        /* 在线选中人员实例 */
        this.onPlayerSymbol = {
          type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
          url: require('../../common/img/sandtable/onlinePlayerA@3x.png'),
          width: '72px',
          height: '72px'
        }
        /* 离线选中飞机实例 */
        this.offUavSymbol = {
          type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
          url: require('../../common/img/sandtable/outlineUavA@3x.png'),
          width: '72px',
          height: '72px'
        }
        /* 离线选中人员实例 */
        this.offPlayerSymbol = {
          type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
          url: require('../../common/img/sandtable/outlinePlayerA@3x.png'),
          width: '72px',
          height: '72px'
        }
        /* 在线飞机飞行轨迹 */
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
          self.getUavList()
          self.listenView()
        })
      })
    },
    /* 添加地图实例 */
    setSymbols () {
      this.view.graphics.removeMany(this.graphicsList)
      // this.view.graphics.remove(this.polylineGraphics)
      loadModules(
        ['esri/Graphic', 'esri/geometry/SpatialReference', 'esri/geometry/Extent'],
        this.options
      ).then(([Graphic, SpatialReference, Extent]) => {
        /* 根据返回的飞机以及人员坐标点，规划地图显示范围 */
        if (this.allLons.length > 0) {
          let maxX = ''
          // 遍历数组，默认arr中的某一个元素为最大值，进行逐一比较
          for (let i = 0; i < this.allLons.length; i++) {
            // 外层循环一次，就拿arr[i] 和 内层循环arr.legend次的 arr[j] 做对比
            for (let j = i; j < this.allLons.length; j++) {
              if (this.allLons[i] < this.allLons[j]) {
                // 如果arr[j]大就把此时的值赋值给最大值变量max
                maxX = this.allLons[j]
                this.allLons[j] = this.allLons[i]
                this.allLons[i] = maxX
              }
            }
          }
        }
        if (this.allLats.length > 0) {
          let maxY = ''
          // 遍历数组，默认arr中的某一个元素为最大值，进行逐一比较
          for (let i = 0; i < this.allLats.length; i++) {
            // 外层循环一次，就拿arr[i] 和 内层循环arr.legend次的 arr[j] 做对比
            for (let j = i; j < this.allLats.length; j++) {
              if (this.allLats[i] < this.allLats[j]) {
                // 如果arr[j]大就把此时的值赋值给最大值变量max
                maxY = this.allLats[j]
                this.allLats[j] = this.allLats[i]
                this.allLats[i] = maxY
              }
            }
          }
        }
        if (this.setExt === '0') {
          /* 取x,y轴最大最小值 */
          let xmin = this.allLons[this.allLons.length - 1] - 0.03
          let xMax = this.allLons[0] + 0.02
          let yMin = this.allLats[this.allLats.length - 1] - 0.02
          let yMax = this.allLats[0] + 0.02
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
        /* 根据返回的飞机坐标绘制飞机实例 */
        if (this.uavList.length > 0) {
          for (let i = 0; i < this.uavList.length; i++) {
            let latPosition = this.uavList[i].lat1
            let lonPosition = this.uavList[i].lon1
            let uavId = this.uavList[i].id
            let isOnline = this.uavList[i].online // 获取飞机在线状态 true:在线 false:离线
            let trans = this.gcj_encrypt(latPosition, lonPosition) // 将坐标转码
            let realX = trans.lat
            let realY = trans.lon
            this.uavPosition[i] = [realY, realX]
            this.point.longitude = realY
            this.point.latitude = realX
            let symbol = null
            if (isOnline === '1') {
              if (this.activeId === uavId) {
                symbol = this.onUavSymbol
                let pos = [realY, realX]
                this.chooseUavPosition.push(pos)
              } else {
                // this.polylineGraphics[0] = ''
                symbol = this.onlineSymbol
              }
            } else {
              // this.polylineGraphics[0] = ''
              if (this.activeId === uavId) {
                symbol = this.offUavSymbol
              } else {
                symbol = this.outlineSymbol
              }
            }
            let point = {
              type: 'point', // autocasts as new Point()
              longitude: realY,
              latitude: realX
            }
            this.pointGraphic = new Graphic({
              geometry: point,
              symbol: symbol
            })
            this.pointGraphic.id = uavId
            this.pointGraphic.clickType = 'uav'
            this.uavGraphics[i] = this.pointGraphic
          }
        }
        /* 根据返回的人员坐标，绘制人员实例 */
        if (this.playerList.length > 0) {
          for (let i = 0; i < this.playerList.length; i++) {
            let latPosition = this.playerList[i].lat
            let lonPosition = this.playerList[i].lon
            let isOnline = this.playerList[i].online // 获取人员在线状态 1:在线 0:离线
            let playerId = this.playerList[i].id
            let trans = this.gcj_encrypt(latPosition, lonPosition)
            let realX = trans.lat
            let realY = trans.lon
            let symbol = null
            if (isOnline === '1') {
              if (this.activeId === playerId) {
                symbol = this.onPlayerSymbol
              } else {
                symbol = this.lineInSymbol
              }
            } else {
              if (this.activeId === playerId) {
                symbol = this.offPlayerSymbol
              } else {
                symbol = this.lineOutSymbol
              }
            }
            let point = {
              type: 'point', // autocasts as new Point()
              longitude: realY,
              latitude: realX
            }
            this.playerGraphic = new Graphic({
              geometry: point,
              symbol: symbol
            })
            this.playerGraphic.id = playerId
            this.playerGraphic.clickType = 'player'
            this.flyerGraphics[i] = this.playerGraphic
            // this.view.graphics.add(this.playerGraphic)
          }
        }
        let polyline = {
          type: 'polyline', // autocasts as new Polyline()
          paths: this.chooseUavPosition
        }
        this.lineGraphic = new Graphic({
          geometry: polyline,
          symbol: this.flySymbol
        })
        this.polylineGraphics[0] = this.lineGraphic
        let ss = this.uavGraphics.concat(this.polylineGraphics)
        this.graphicsList = ss.concat(this.flyerGraphics)
        this.view.graphics.addMany(this.graphicsList)
        // this.activeId = ''
        // this.chooseUavPosition = []
      })
      if (this.intervalMap !== undefined) {
        return
      }
      if (this.intervalMap === undefined) {
        this.intervalMap = setInterval(() => {
          this.getUavList()
        }, 2000)
      }
    },
    /* 监听地图点击事件 */
    listenView () {
      /* 清空定时器 */
      this.intervalMapM = null // 设置为null
      clearInterval(this.intervalMapN)
      this.intervalMapN = null // 设置为null
      let self = this
      this.view.on('click', function (event) {
        self.view.hitTest(event).then(function (response) {
          if (response.results[0]) {
            let graphicType = response.results[0].graphic.symbol.type // 获取点击的类型
            let clickId = response.results[0].graphic.id
            let clickType = response.results[0].graphic.clickType
            if (graphicType === 'picture-marker') {
              // 判断点击图标类型，player：人员 uav： 无人机
              self.activeId = clickId
              self.showUav = false
              self.showNum = false
              self.uavIndex = ''
              self.numIndex = ''
              self.chooseUavPosition = []
              if (clickType === 'player') {
                self.screenHeight = 'allScreenP'
                self.setPlayerDetailMap(clickId)
              } else if (clickType === 'uav') {
                self.screenHeight = 'allScreenU'
                self.setUavDetailMap(clickId)
              }
            }
          }
        })
      })
    },
    /* 展示成员列表 */
    showNumlist () {
      if (this.showNum) {
        this.showNum = false
      } else {
        this.showNum = true
      }
    },
    /* 查看无人机 */
    goUav (item, index) {
      this.activeId = ''
      this.chooseUavPosition = []
      let id = item.id
      this.setExt = '1' // 当选中其中一个时候，地图放大
      this.uavIndex = index
      this.isShowUav = true
      this.isShowFly = false
      this.numIndex = ''
      this.showNum = false
      this.screenHeight = 'allScreenU'
      this.activeId = id
      clearInterval(this.intervalMapA)
      this.intervalMapA = null // 设置为null
      clearInterval(this.intervalMapB)
      this.intervalMapB = null // 设置为null
      clearInterval(this.intervalMapN)
      this.intervalMapN = null // 设置为null
      this.setUavDetail(id)
    },
    /* 无人机详细信息 */
    setUavDetail (item) {
      this.uavDetail = this.uavList.find(function (item1) {
        // eslint-disable-next-line no-return-assign
        return item1.id === item
      })
      let latPosition = this.uavDetail.lat1
      let lonPosition = this.uavDetail.lon1
      let trans = this.gcj_encrypt(latPosition, lonPosition)
      let realX = trans.lat
      let realY = trans.lon
      if (this.nowId !== item) {
        this.view.center = [realY, realX]
        this.view.extent = null
        this.view.zoom = '19'
      }
      this.nowId = item
      // 页面加载完成后获取高度信息
      this.$nextTick(function () {
        let clientH = document.documentElement.clientHeight
        let orderH = document.getElementById('uavDetail').clientHeight
        let viewH = (clientH - orderH).toString()
        document.getElementById('sandTable').style.height = viewH + 'px'
      })
      if (item.online === '1') {
        this.uavIcon = require('../../common/img/sandtable/uavIcon@3x.png')
      } else {
        this.uavIcon = require('../../common/img/sandtable/uavGrey@3x.png')
      }
      this.uavName = this.uavDetail.name
      this.vPosition = (this.uavDetail.horiz) / 10
      this.hPositon = (this.uavDetail.vert) / 10
      this.userName = this.uavDetail.user.name
      this.uavLon = realX
      this.uavLat = realY
      if (this.intervalMapM !== undefined && this.intervalMapM !== null) {
        return
      }
      if (this.intervalMapM === undefined || this.intervalMapM === null) {
        this.intervalMapM = setInterval(() => {
          let id = this.nowId
          this.setUavDetail(id)
        }, 2000)
      }
    },
    setUavDetailMap (item) {
      this.uavDetail = this.uavList.find(function (item1) {
        // eslint-disable-next-line no-return-assign
        return item1.id === item
      })
      let latPosition = this.uavDetail.lat1
      let lonPosition = this.uavDetail.lon1
      let trans = this.gcj_encrypt(latPosition, lonPosition)
      let realX = trans.lat
      let realY = trans.lon
      if (this.nowId !== item) {
        this.view.center = [realY, realX]
        this.view.extent = null
        this.view.zoom = '19'
      }
      this.nowId = item
      // 页面加载完成后获取高度信息
      this.$nextTick(function () {
        let clientH = document.documentElement.clientHeight
        let orderH = document.getElementById('uavDetail').clientHeight
        let viewH = (clientH - orderH).toString()
        document.getElementById('sandTable').style.height = viewH + 'px'
      })
      this.isShowFly = false
      this.isShowUav = true
      if (item.online === '1') {
        this.uavIcon = require('../../common/img/sandtable/uavIcon@3x.png')
      } else {
        this.uavIcon = require('../../common/img/sandtable/uavGrey@3x.png')
      }
      this.uavName = this.uavDetail.name
      this.vPosition = (this.uavDetail.horiz) / 10
      this.hPositon = (this.uavDetail.vert) / 10
      this.userName = this.uavDetail.user.name
      this.uavLon = realX
      this.uavLat = realY
      if (this.intervalMapA !== undefined && this.intervalMapA !== null) {
        return
      }
      if (this.intervalMapA === undefined || this.intervalMapA === null) {
        this.intervalMapA = setInterval(() => {
          let id = this.nowId
          this.setUavDetailMap(id)
        }, 2000)
      }
    },
    /* 查看人员 */
    goNum (item, index) {
      let id = item.id
      this.numIndex = index
      this.screenHeight = 'allScreenP'
      this.showUav = false
      this.uavIndex = ''
      clearInterval(this.intervalMapA)
      this.intervalMapA = null // 设置为null
      clearInterval(this.intervalMapB)
      this.intervalMapB = null // 设置为null
      clearInterval(this.intervalMapM)
      this.intervalMapM = null // 设置为null
      this.activeId = id
      this.setPlayerDetail(id)
    },
    /* 人员详细信息 */
    setPlayerDetail (item) {
      this.playerDetail = this.playerList.find(function (item1) {
        // eslint-disable-next-line no-return-assign
        return item1.id === item
      })
      this.setExt = '1' // 当选中其中一个时候，地图放大
      let latPosition = this.playerDetail.lat
      let lonPosition = this.playerDetail.lon
      let trans = this.gcj_encrypt(latPosition, lonPosition)
      let realX = trans.lat
      let realY = trans.lon
      if (this.nowId !== item) {
        this.view.center = [realY, realX]
        this.view.extent = null
        this.view.zoom = '19'
      }
      this.nowId = item
      // 页面加载完成后获取高度信息
      this.$nextTick(function () {
        let clientH = document.documentElement.clientHeight
        let orderH = document.getElementById('flyerDetail').clientHeight
        let viewH = (clientH - orderH).toString()
        document.getElementById('sandTable').style.height = viewH + 'px'
      })
      this.isShowFly = true
      this.isShowUav = false
      if (item.online === '1') {
        this.flyerPosition = require('../../common/img/sandtable/jwdIcon@3x.png')
      } else {
        this.flyerPosition = require('../../common/img/sandtable/lastPostion@3x.png')
      }
      this.flyerName = this.playerDetail.userName
      this.flyerPhone = this.playerDetail.phone
      this.flyLon = realX
      this.flyLat = realY
      if (this.intervalMapN !== undefined && this.intervalMapN !== null) {
        return
      }
      if (this.intervalMapN === undefined || this.intervalMapN === null) {
        this.intervalMapN = setInterval(() => {
          let id = this.nowId
          this.setPlayerDetail(id)
        }, 2000)
      }
    },
    setPlayerDetailMap (item) {
      this.playerDetail = this.playerList.find(function (item1) {
        // eslint-disable-next-line no-return-assign
        return item1.id === item
      })
      this.setExt = '1' // 当选中其中一个时候，地图放大
      let latPosition = this.playerDetail.lat
      let lonPosition = this.playerDetail.lon
      let trans = this.gcj_encrypt(latPosition, lonPosition)
      let realX = trans.lat
      let realY = trans.lon
      if (this.nowId !== item) {
        this.view.center = [realY, realX]
        this.view.extent = null
        this.view.zoom = '19'
      }
      this.nowId = item
      // 页面加载完成后获取高度信息
      this.$nextTick(function () {
        let clientH = document.documentElement.clientHeight
        let orderH = document.getElementById('flyerDetail').clientHeight
        let viewH = (clientH - orderH).toString()
        document.getElementById('sandTable').style.height = viewH + 'px'
      })
      this.isShowFly = true
      this.isShowUav = false
      if (item.online === '1') {
        this.flyerPosition = require('../../common/img/sandtable/jwdIcon@3x.png')
      } else {
        this.flyerPosition = require('../../common/img/sandtable/lastPostion@3x.png')
      }
      this.flyerName = this.playerDetail.userName
      this.flyerPhone = this.playerDetail.phone
      this.flyLon = realX
      this.flyLat = realY
      if (this.intervalMapB !== undefined && this.intervalMapB !== null) {
        return
      }
      if (this.intervalMapB === undefined || this.intervalMapB === null) {
        this.intervalMapB = setInterval(() => {
          let id = this.nowId
          this.setPlayerDetailMap(id)
        }, 2000)
      }
    },
    /* 隐藏成员列表 */
    hideNumlist () {
      this.showNum = false
      this.showNumBtn = true
      this.view.extent = this.ext
      this.uavIndex = ''
      this.numIndex = ''
      this.isShowFly = true
      this.isShowUav = true
      this.setExt = '0'
      this.activeId = ''
      this.chooseUavPosition = []
      this.nowId = ''
      this.screenHeight = 'allScreen'
      clearInterval(this.intervalMapN)
      this.intervalMapN = null // 设置为null
      clearInterval(this.intervalMapM)
      this.intervalMapM = null // 设置为null
      clearInterval(this.intervalMapA)
      this.intervalMapA = null // 设置为null
      clearInterval(this.intervalMapB)
      this.intervalMapB = null // 设置为null
      document.getElementById('sandTable').style.height = document.documentElement.clientHeight + 'px'
    },
    /* 展示无人机列表 */
    showUavlist () {
      if (this.showUav) {
        this.showUav = false
      } else {
        this.showUav = true
      }
    },
    /* 隐藏无人机列表 */
    hideUavlist () {
      this.showUav = false
      this.view.extent = this.ext
      this.uavIndex = ''
      this.numIndex = ''
      this.isShowFly = true
      this.isShowUav = true
      this.setExt = '0'
      this.activeId = ''
      this.chooseUavPosition = []
      this.screenHeight = 'allScreen'
      this.nowId = ''
      clearInterval(this.intervalMapN)
      this.intervalMapN = null // 设置为null
      clearInterval(this.intervalMapM)
      this.intervalMapM = null // 设置为null
      clearInterval(this.intervalMapA)
      this.intervalMapA = null // 设置为null
      clearInterval(this.intervalMapB)
      this.intervalMapB = null // 设置为null
      document.getElementById('sandTable').style.height = document.documentElement.clientHeight + 'px'
    },
    /* 展示全屏 */
    showAllScreen () {
      this.showUav = false
      this.view.extent = this.ext
      this.uavIndex = ''
      this.numIndex = ''
      this.isShowFly = true
      this.isShowUav = true
      this.setExt = '0'
      this.activeId = ''
      this.nowId = ''
      this.chooseUavPosition = []
      this.screenHeight = 'allScreen'
      clearInterval(this.intervalMapN)
      this.intervalMapN = null // 设置为null
      clearInterval(this.intervalMapM)
      this.intervalMapM = null // 设置为null
      clearInterval(this.intervalMapA)
      this.intervalMapA = null // 设置为null
      clearInterval(this.intervalMapB)
      this.intervalMapB = null // 设置为null
      document.getElementById('sandTable').style.height = document.documentElement.clientHeight + 'px'
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import url("https://js.arcgis.com/4.7/esri/themes/light/main.css")
  @import "~common/stylus/variable"
  #sand-table
    height 100%
    width 100%
    #sandTable
      height 100%
      width 100%
    .numBtn
      width 1.12rem
      height .88rem
      background url("../../common/img/sandtable/numList@3x.png") center center no-repeat
      background-size contain
      position absolute
      left .12rem
      top .12rem
    .allScreen
      width 1.12rem
      height .88rem
      background url("../../common/img/sandtable/fullScreen@3x.png") center center no-repeat
      background-size contain
      position absolute
      right .12rem
      bottom .12rem
    .allScreenU
      width 1.12rem
      height .88rem
      background url("../../common/img/sandtable/fullScreen@3x.png") center center no-repeat
      background-size contain
      position absolute
      right .12rem
      bottom 1.8rem
    .allScreenP
      width 1.12rem
      height .88rem
      background url("../../common/img/sandtable/fullScreen@3x.png") center center no-repeat
      background-size contain
      position absolute
      right .12rem
      bottom 1rem
    .uavBtn
      width 1.12rem
      height .88rem
      background url("../../common/img/sandtable/uavList@3x.png") center center no-repeat
      background-size contain
      position absolute
      right .12rem
      top .12rem
    .uavList
      position absolute
      top 0
      right 0
      background $color-background-white
      width 2.4rem
      border-radius 6px 0 0 6px
      .uavTitle
        height .6rem
        line-height .6rem
        color #969696
        font-size 12px
        padding-left .3rem
        border-bottom 1px solid #DCDCDC
      .uavDetail
        height .84rem
        display flex
        align-items center
        color #505050
        font-size 14px
        padding-left .3rem
    .numList
      position absolute
      top 0
      left 0
      background $color-background-white
      width 2.4rem
      border-radius 0 6px 6px 0
      .numTitle
        height .6rem
        line-height .6rem
        color #969696
        font-size 12px
        padding-left .3rem
        border-bottom 1px solid #DCDCDC
      .numDetail
        height .84rem
        display flex
        align-items center
        padding-left .3rem
        color #505050
        font-size 14px
    .uavDetail
      height 1.6rem
      background-color $color-background-white
      .uavTitle
        display flex
        padding 0 .3rem
        position relative
        img
          height .48rem
          width .48rem
          margin-top .24rem
        label
          font-size 14px
          color $color-font-black-new
          margin-left .1rem
          margin-top .34rem
        p
          font-size 14px
          color $color-font-grey
          position absolute
          right .3rem
          top .34rem
      .uavBottom
        height .38rem
        display flex
        align-items center
        margin-top .26rem
        padding 0 .3rem
        img
          width .24rem
          height .18rem
        img:last-of-type
          width .2rem
          height .28rem
          margin-left .6rem
        .vDetail
          font-size 16px
          color $color-font-black-new
          margin-left .12rem
        .position
          font-size 12px
          color $color-font-grey
          margin-left .16rem
    .flyerDetail
      height .8rem
      background-color $color-background-white
      display flex
      align-items center
      font-size 14px
      color $color-font-black-new
      position relative
      p:first-of-type
        margin-left .3rem
      .rightLine
        height .28rem
        width 2px
        background-color #DCDCDC
        margin-left .2rem
        margin-right .2rem
      .flyBottom
        display flex
        align-items center
        margin-left .3rem
        font-size 12px
        color #969696
        img
          width .2rem
          height .28rem
    .selectActive
      background-color $color-bottom-active
      color $color-font-white!important
</style>
