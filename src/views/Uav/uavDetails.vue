<template>
  <div id="uav-detail">
    <div class="header_bg">
      <div class="lockTip" v-show="lockStatusN">
        <div class="cubeic-lock"></div>
        <div>该设备已锁定</div>
      </div>
    </div>
    <div class="uav_header">
      <div class="uav_id">
        <img src="../../common/img/uavplan/ID@3x.png">
        <label>{{snID}}</label>
      </div>
      <div class="uav_name" @click="changeName">
        <label>{{uavName}}</label>
        <span></span>
      </div>
      <div class="uav_fly">
        <div class="uav_style">
          <img src="../../common/img/uavplan/style@3x.png">
          <label>{{uavType}}</label>
        </div>
        <div class="uav_time">
          <img src="../../common/img/uavplan/flyTime@3x.png">
          <label>{{tjTime}}小时</label>
        </div>
      </div>
    </div>
    <div class="uav_con">
      <div>
        <label>无人机类型</label>
        <span>{{planType}}</span>
      </div>
      <div>
        <label>REG</label>
        <span>{{uavReg}}</span>
      </div>
    </div>
    <div class="uav_con">
      <div>
        <label>飞控ID</label>
        <span>{{fkID}}</span>
      </div>
      <div>
        <label>数传ID</label>
        <span>{{scID}}</span>
      </div>
      <div>
        <label>数传通道号</label>
        <span>{{scTdh}}</span>
      </div>
      <div>
        <label>机载RTK ID</label>
        <span>{{rtkID}}</span>
      </div>
      <div>
        <label>千寻 ID</label>
        <span>{{qxID}}</span>
      </div>
    </div>
    <div class="fly_detail">
      <div class="query_header">
        <div class="nyr_query">
          <span v-for="(item, index) in quertList" :key="index" :class="isActive === index?'active' : ''" @click="queryFlyDetail(index)">{{item}}</span>
        </div>
        <div class="zdy_query" @click="showDateSegment">{{queryTime}}</div>
      </div>
      <div class="fly_record">
        <div class="record_detail pl6">
          <div class="record_num">{{acre}}</div>
          <label>面积(亩)</label>
        </div>
        <span class="rightLine"></span>
        <div class="record_detail">
          <div class="record_num">{{dist}}</div>
          <label>里程(km)</label>
        </div>
        <span class="rightLine"></span>
        <div class="record_detail">
          <div class="record_num">{{duration}}</div>
          <label>时长(小时)</label>
        </div>
      </div>
    </div>
    <div class="equip_by"></div>
    <div class="equip_by" @click="showMaintenance" style="display: none;">
      <label>设备保养</label>
      <div>
        <p>1项超期保养</p>
        <span></span>
      </div>
    </div>
    <div class="cz_btn">
      <div @click="releaseTitle">解除设备所有权</div>
      <div @click="showUnlock">{{lockText}}</div>
    </div>
    <div class="ptlock" v-show="ptlock">
      <div>
        <img src="../../common/img/uavplan/ptlock.png">
        <p>该设备处于禁飞状态，无法飞行，请联系厂商解除禁飞。</p>
      </div>
    </div>
    <prompt-box v-show="isShowUnlock" @hide="hide" :pageType='lockStatus'></prompt-box>
  </div>
</template>

<script>
import PromptBox from 'components/promptBox/promptBox'
import countDown from 'common/mixins/common'
const dateSegmentData = [
  {
    is: 'cube-date-picker',
    title: '开始时间',
    min: new Date(2010, 0, 1),
    max: new Date(2030, 11, 31)
  },
  {
    is: 'cube-date-picker',
    title: '结束时间',
    min: new Date(2010, 0, 1),
    max: new Date(2030, 11, 31)
  }
]
export default {
  name: 'uavDetails',
  mixins: [countDown],
  data () {
    return {
      quertList: ['本年', '本月', '今日'],
      isActive: 0,
      uavName: '',
      isShowlock: false,
      isShowUnlock: false,
      lockStatusN: false,
      isCan: false,
      isLock: 0, // 设备锁定状态(平台锁)
      isUserLock: 0, // 用户锁
      lockStatus: 0,
      queryTime: '自定义查询',
      lockText: '锁定设备', // 按钮显示信息
      tipTeason: '', // 操作提示信息
      startDate: '', // 开始时间
      endDate: '', // 结束时间
      snID: '', // 设备id
      uavType: '', // 飞机类型
      planType: '', // 子类型
      uavReg: '', // reg
      fkID: '', // 飞控id
      scID: '', // 数传id
      scTdh: '', // 数传通道号
      rtkID: '', // 机载rtk id
      qxID: '', // 千寻id
      tjTime: '', // 统计时长
      acre: 0, // 面积
      duration: 0, // 时长
      dist: 0, // 里程
      showType: 0,
      thisMonth: '', // 本月
      thisYear: '', // 本年
      ptLock: '', // 平台锁定状态
      ptlock: false,
      onLine: navigator.onLine, // 当前网络状况
      thisDay: '' // 今日
    }
  },
  created () {
    this.getNyr()
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  /* 清空定时器 */
  beforeDestroy () {
    clearInterval(this.intervalMap)
    this.intervalMap = null // 设置为null
  },
  watch: {
    lockStatus: function (val) {
      let status = val
      if (status === 0) {
        this.lockStatusN = true
        this.lockText = '解除锁定'
      } if (status === 1) {
        this.lockStatusN = false
        this.lockText = '锁定设备'
      }
    }
  },
  mounted () {
    /* 初始化日期控件 */
    this.dateSegmentPicker = this.$createSegmentPicker({
      data: dateSegmentData,
      onSelect: (selectedDates, selectedVals, selectedTexts) => {
        this.searchDatas(selectedTexts)
      },
      onNext: (i, selectedDate, selectedValue, selectedText) => {
        dateSegmentData[1].min = selectedDate
        if (i === 0) {
          this.dateSegmentPicker.$updateProps({
            data: dateSegmentData
          })
        }
      }
    })
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    /* 获取设备详情 */
    this.getUavDetail()
    /* 获取统计时长 */
    this.getTotalTime()
    /* 获取本年的数据 */
    this.queryFlyDetail(0)
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
    /* 获取飞机详情 */
    getUavDetail () {
      this.snID = this.$route.query.snId
      let detailParam = new URLSearchParams()
      detailParam.set('sn', this.snID)
      this.request({
        url: '/crops-platform/api/uav_v3/getDetail',
        method: 'get',
        params: detailParam,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        this.isCan = true
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          let result = response.data.data
          if (result !== undefined) {
            this.uavName = result.name
            this.uavType = result.typeName
            this.planType = result.productionTypeName
            this.uavReg = result.reg
            this.fkID = result.autopilot.serialNumber
            this.scID = result.dataSenderId
            if (result.channelNo === '0') {
              this.scTdh = ''
            } else {
              this.scTdh = result.channelNo
            }
            if (result.rtkId === '0') {
              this.rtkID = ''
            } else {
              this.rtkID = result.rtkId
            }
            if (result.qxAccountId === '0') {
              this.qxID = ''
            } else {
              this.qxID = result.qxAccountId
            }
            let lockSta = result.isLock // 4:已锁定 5:未锁定(大数据平台锁)
            if (lockSta === '4') {
              this.ptlock = true
            } else if (lockSta === '5') {
              this.ptlock = false
            } else {
              this.ptlock = false
            }
            let userLock = result.isUserLock // 7:已锁定 8:未锁定(公众号用户锁)
            if (userLock === '7') {
              this.lockStatus = 0
              this.lockStatusN = true
              this.lockText = '解除锁定'
            } else if (userLock === '8') {
              this.lockStatus = 1
              this.lockText = '锁定设备'
              this.lockStatusN = false
            } else if (userLock === undefined) {
              this.lockStatus = 1
              this.lockText = '锁定设备'
              this.lockStatusN = false
            }
          }
          if (this.intervalMap !== undefined && this.intervalMap !== null) {
            return
          }
          if (this.intervalMap === undefined || this.intervalMap === null) {
            this.intervalMap = setInterval(() => {
              /* 获取设备详情 */
              this.getUavDetail()
            }, 3000)
          }
        }
      })
    },
    getTotalTime () {
      this.snID = this.$route.query.snId
      let timeParam = new URLSearchParams()
      timeParam.set('sn', this.snID)
      this.request({
        url: '/crops-platform/api/uav_v3/getDurationTotal',
        method: 'get',
        params: timeParam,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          if (response.data.data !== undefined) {
            let result = response.data.data
            if (result.duration !== undefined) {
              this.tjTime = Math.round((result.duration / 3600000) * 1000) / 1000
            } else {
              this.tjTime = 0
            }
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
      })
    },
    queryFlyDetail (index) {
      // 0：本年 1：本月 2：今日
      this.isActive = index
      this.queryTime = '自定义查询'
      if (index === 1) {
        this.startDate = this.thisMonth
        this.endDate = this.thisDay
      } else if (index === 0) {
        this.startDate = this.thisYear
        this.endDate = this.thisDay
      } else if (index === 2) {
        this.startDate = this.thisDay
        this.endDate = this.thisDay
      }
      this.getTotalSearch(this.startDate, this.endDate)
    },
    showDateSegment () {
      this.dateSegmentPicker.show()
    },
    changeName () {
      this.editComp = this.editComp || this.$createEditEquipmentName({
        $props: {
          planName: this.uavName
        },
        $events: {
          leave: (val) => {
            this.uavName = val
            this.changeUavname()
          }
        }
      })
      this.editComp.show()
    },
    /* 更改无人机名称 */
    changeUavname () {
      let changeParam = new URLSearchParams()
      changeParam.set('sn', this.snID)
      changeParam.set('name', this.uavName)
      this.request({
        url: '/crops-platform/api/uav_v3/updateUavName',
        method: 'get',
        params: changeParam,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.$createDialog({
            type: 'alert',
            content: '更改成功',
            icon: 'cubeic-alert'
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
    /* 自定义时间段查询 */
    searchDatas (val) {
      let startSearch = val[0]
      let endSearch = val[1]
      this.startDate = startSearch[0] + '-' + startSearch[1] + '-' + startSearch[2]
      this.endDate = endSearch[0] + '-' + endSearch[1] + '-' + endSearch[2]
      this.queryTime = this.startDate + '-' + this.endDate
      this.isActive = ''
      this.getTotalSearch(this.startDate, this.endDate)
    },
    /* 根据所选时间进行查询 */
    getTotalSearch (start, end) {
      let startTime = start
      let endTime = end
      let dateParams = new URLSearchParams()
      dateParams.set('sn', this.snID)
      dateParams.set('startTime', startTime)
      dateParams.set('endTime', endTime)
      this.request({
        url: '/crops-platform/api/uav_v3/getTotalSearch',
        method: 'get',
        params: dateParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          if (response.data.data !== undefined) {
            let result = response.data.data
            if (result.acre !== undefined) {
              this.acre = result.acre
            } else {
              this.acre = 0
            }
            if (result.dist !== undefined) {
              this.dist = result.dist / 1000
            } else {
              this.dist = 0
            }
            if (result.duration !== undefined) {
              this.duration = Math.round((result.duration / 3600000) * 1000) / 1000
            } else {
              this.duration = 0
            }
          }
        }
      })
    },
    /* 获取本年，本月，本日 */
    getNyr () {
      let now = new Date()
      let month = now.getMonth() + 1
      this.thisDay = this.getNowFormatDate()
      let year = now.getFullYear()
      this.thisMonth = year + '-' + month + '-' + '1'
      this.thisYear = year + '-' + '1' + '-' + '1'
    },
    showMaintenance () {
      this.$router.push('/UavMaintenance')
    },
    /* 解除设备所有权 */
    releaseTitle () {
      if (this.isCan) {
        if (this.lockStatus === 0) {
          this.$createDialog({
            type: 'alert',
            content: '该设备已锁定',
            icon: 'cubeic-alert'
          }).show()
        } else {
          this.$createDialog({
            type: 'confirm',
            content: '确定解除所有权吗？',
            icon: 'cubeic-alert',
            onConfirm: (e, promptValue) => {
              let releaseParams = new URLSearchParams()
              releaseParams.set('sn', this.snID)
              this.request({
                url: '/crops-platform/api/uav_v3/removeUav',
                method: 'get',
                params: releaseParams,
                headers: {
                  'clientType': 'weixin',
                  'deviceId': '11654325'
                }
              }).then(response => {
                let res = response.data.status
                // eslint-disable-next-line no-unused-vars
                let { code, reasonPhrase } = res
                if (code === 0) {
                  this.$createDialog({
                    type: 'alert',
                    content: '解除成功',
                    icon: 'cubeic-alert',
                    onConfirm: (e, promptValue) => {
                      this.$router.push('/UavList')
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
            }
          }).show()
        }
      } else {
        this.$createDialog({
          type: 'alert',
          content: '数据加载中，请稍后尝试',
          icon: 'cubeic-alert'
        }).show()
      }
    },
    /* 锁定设备操作 */
    showUnlock () {
      this.isShowUnlock = true
    },
    hide (val) {
      this.isShowUnlock = false
      let _type = val // 0:解锁设备 1:锁定设备
      if (_type === 0) {
        this.isUserLock = 8
        this.tipTeason = '解锁成功'
        this.lockStatus = 1
        this.lockStatusN = false
        this.updateLock()
      } else if (_type === 1) {
        this.isUserLock = 7
        this.tipTeason = '锁定成功'
        this.lockStatus = 0
        this.lockStatusN = true
        this.updateLock()
      }
    },
    /* 更新设备状态 */
    updateLock () {
      let updateParams = new URLSearchParams()
      updateParams.set('sn', this.snID)
      updateParams.set('lock', this.isUserLock)
      this.request({
        url: '/crops-platform/api/uav_v3/updateLock',
        method: 'get',
        params: updateParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.$createDialog({
            type: 'alert',
            content: this.tipTeason,
            icon: 'cubeic-alert'
          }).show()
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    }
  },
  components: {
    PromptBox
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #uav-detail
    width 100%
    height 100%
    overflow-y auto
    background-color $color-background-grey
    .header_bg
      height 2.8rem
      background url("../../common/img/uavplan/X50_bg@3x.png") center center no-repeat
      background-size contain
      position relative
      .lockTip
        display flex
        justify-content center
        align-items center
        height .6rem
        width 100%
        background linear-gradient(90deg,rgba(234,196,108,1) 0%,rgba(255,219,137,1) 51%,rgba(236,198,112,1) 100%)
        font-size 12px
        color #4B473D
        position absolute
        bottom 0
    .uav_header
      height 1.9rem
      background-color $color-background-white
      .uav_id
        display flex
        padding-top .28rem
        padding-left .3rem
        img
          width 24px
          height 17px
        label
          color $color-font-disabled-new
          font-size 14px
          margin-left .16rem
        p
          color $color-font-disabled-new
          font-size 14px
      .uav_name
        display flex
        padding-top .14rem
        padding-left .3rem
        position relative
        label
          font-size 18px
          color $color-font-black-new
        span
          display block
          width 13px
          height 15px
          background url("../../common/img/uavplan/road@3x.png") center center no-repeat
          background-size contain
          position absolute
          right .3rem
      .uav_fly
          display flex
          padding-top .24rem
          padding-left .3rem
          .uav_style
            display flex
            align-items center
            img
              width 14px
              height 15px
            label
              font-size 12px
              color $color-font-disabled-new
              margin-left .16rem
          .uav_time
            display flex
            align-items center
            margin-left .6rem
            img
              width 14px
              height 15px
            label
              font-size 12px
              color $color-font-disabled-new
              margin-left .16rem
    .uav_con
      background-color $color-background-white
      margin-top .12rem
      div
        height .6rem
        display flex
        align-items center
        label
          width 25%
          padding-left .3rem
          font-size 12px
          color $color-font-disabled-new
        span
          font-size 12px
          color $color-font-black-new
          font-weight 500
    .fly_detail
      background-color $color-background-white
      margin-top .12rem
      padding 0 .3rem .4rem .3rem
      .query_header
        height .9rem
        display flex
        align-items center
        position relative
        .nyr_query
          display flex
          span
            display block
            width 48px
            height 24px
            color $color-font-black-new
            line-height 24px
            text-align center
            font-size 12px
            border-radius 12px
          .active
            background-color $color-font-blue
            color $color-font-white
        .zdy_query
            position absolute
            right 0
            font-size 12px
            color $color-font-grey
      .fly_record
        display flex
        align-items center
        height 1.4rem
        background-color #F8F8F8
        .rightLine
          display block
          height .6rem
          border 1px solid $color-bottom-line
          margin 0 .6rem
        .record_detail
          text-align center
          &.pl6
            padding-left .6rem
          .record_num
            font-size 20px
            color $color-font-black-new
          label
            font-size 12px
            color $color-font-disabled
            margin-top 4px
    .equip_by
      /*height 1.2rem*/
      /*display flex*/
      /*align-items center*/
      margin-top .12rem
      margin-bottom 1.4rem
      background-color $color-background-white
      padding 0 .3rem
      /*justify-content space-between*/
      label
        font-size 15px
        color $color-font-black-new
      div
        display flex
      p
        font-size 15px
        color $color-font-red
        padding-right 5px
      span
        display block
        width 13px
        height 15px
        background url("../../common/img/uavplan/road@3x.png") center center no-repeat
        background-size contain
    .cz_btn
      width 100%
      height 1.4rem
      display flex
      align-items center
      position fixed
      bottom 0
      z-index 99
      justify-content space-around
      background-color $color-background-white
      div
        width 140px
        height 44px
        line-height 44px
        text-align center
        border 2px solid #C8C8C8
        border-radius 22px
        font-size 15px
        color $color-font-grey
    .ptlock
      position absolute
      right 0
      left 0
      bottom 2rem
      margin 0 .3rem
      div
        background-color $color-font-black-new
        opacity 0.8
        display flex
        height 1.5rem
        align-items center
        padding 0 .3rem
        border-radius 6px
        img
          height 56px
          width 56px
        p
          font-size 15px
          color $color-font-white
          margin-left .1rem
</style>
