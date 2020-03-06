<template>
    <div id="my-statistical">
      <div class="teamSearch" v-show="isCaption">
        <span v-for="(item, index) in teamList" :key="index" :class="{'selectActive':teamIndex===index}" @click="searchDetailTeam(index)">{{item}}</span>
      </div>
      <div class="searchTitle">
        <span v-for="(item, index) in searchList" :key="index" :class="{'active':activeIndex===index}" @click="searchDetail(index)">{{item}}</span>
        <div @click="changeDate" class="timeVal" style="display: none;">
          <div>{{selectVal}}</div>
          <div class="cubeic-select"></div>
        </div>
      </div>
      <div class="statisicalTitle">
        <div>作业统计</div>
      </div>
      <div class="workStatisical">
        <div class="detailList">
          <div>
            <p>{{chArea}}</p>
            <span>测绘面积（亩）</span>
          </div>
          <div class="ml3">
            <p>{{orderArea}}</p>
            <span>作业面积（亩）</span>
          </div>
          <div class="ml3">
            <p>{{uavCount}}</p>
            <span>作业架次</span>
          </div>
        </div>
        <div class="detailList">
          <div>
            <p>{{flyDis}}</p>
            <span>飞行里程（km）</span>
          </div>
          <div class="ml3">
            <p>{{flyTime}}</p>
            <span>飞行时长（min）</span>
          </div>
          <div class="ml3">
            <p>{{landCount}}</p>
            <span>地块数量</span>
          </div>
        </div>
      </div>
      <div class="areaTitle">
        <div>作业面积趋势</div>
      </div>
      <div class="areaDetail">
        <div id="chart1"></div>
      </div>
      <div v-show="!perStatistical">
        <div class="areaTitle" v-show="isCaption">
          <div>队员作业面积</div>
        </div>
        <div class="areaDetail" v-show="isCaption">
          <div id="chart2"></div>
        </div>
      </div>
    </div>
</template>

<script>
import countDown from 'common/mixins/common'
import 'echarts/lib/chart/line'
const dateSegmentData = [
  {
    is: 'cube-date-picker',
    title: '开始时间',
    min: new Date(2000, 0, 1),
    max: new Date(2030, 11, 31)
  },
  {
    is: 'cube-date-picker',
    title: '结束时间',
    min: new Date(2000, 0, 1),
    max: new Date(2030, 11, 31)
  }
]
export default {
  name: 'statistical',
  mixins: [countDown],
  // props: {
  //   userqx: {
  //     type: Number
  //   }
  // },
  data () {
    return {
      teamList: [
        '个人统计', '团队统计'
      ],
      searchList: [
        '本年', '本月', '本日'
      ],
      orgOptions: {},
      landCount: 0, // 地块数量
      flyDis: 0, // 飞行里程
      uavCount: 0, // 作业架次
      orderArea: 0, // 作业面积
      flyTime: 0, // 飞行时长
      chArea: 0,
      teamIndex: 0,
      activeIndex: 0,
      perStatistical: true,
      isCaption: true, // 是否是队长
      ss: [
        { date: '1', acre: '356' },
        { date: '3', acre: '36' }
      ],
      startDate: '', // 开始时间
      endDate: '', // 结束时间
      selectVal: '选择时间', // 所选时间
      count: 0,
      // userQx: '', // 用户的权限
      userId: '', // 用户id
      thisMonth: '', // 本月
      thisYear: '', // 本年
      thisDay: '', // 今日
      isTeam: '0', // 0:个人 1:团队
      timeFlag: 'year',
      statisticalList: [],
      userQx: '', // 用户权限
      teamAreaList: [],
      intervalId: null
    }
  },
  mounted () {
    /* 获取用户权限 */
    this.getUserInfo()
    this.getNyr()
    this.userId = localStorage.getItem('userId')
    this.queryWorkData()
    this.queryWorkArea()
    this.queryTeamArea()
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
  },
  methods: {
    /* 获取用户权限 */
    getUserInfo () {
      this.request({
        url: '/crops-platform/api/user/userInfo_v3/get',
        method: 'get',
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          /* 获取登陆人员身份信息 */
          this.userQx = response.data.data.protectionRole // 0：未加入植保队 1:队长  2：队员
          if (this.userQx === 1) {
            this.isCaption = true
          } else {
            this.isCaption = false
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
    searchDetailTeam (index) {
      this.teamIndex = index
      if (index === 0) {
        this.isTeam = '0'
        this.perStatistical = true
      } else if (index === 1) {
        this.isTeam = '1'
        this.perStatistical = false
      }
      this.queryWorkData()
      this.queryWorkArea()
      this.queryTeamArea()
    },
    searchDetail (index) {
      this.activeIndex = index
      this.startDate = ''
      this.endDate = ''
      this.selectVal = ''
      if (index === 0) {
        this.timeFlag = 'year'
      } else if (index === 1) {
        this.timeFlag = 'month'
      } else if (index === 2) {
        this.timeFlag = 'today'
      }
      this.queryWorkData()
      this.queryWorkArea()
      this.queryTeamArea()
    },
    changeDate () {
      this.timeFlag = 'custom'
      this.activeIndex = ''
      this.dateSegmentPicker.show()
    },
    /* 自定义时间段查询 */
    searchDatas (val) {
      let startSearch = val[0]
      let endSearch = val[1]
      this.startDate = startSearch[0] + '-' + startSearch[1] + '-' + startSearch[2]
      this.endDate = endSearch[0] + '-' + endSearch[1] + '-' + endSearch[2]
      this.selectVal = this.startDate + '至' + this.endDate
      this.queryWorkData()
    },
    /* 获取统计数据 */
    queryWorkData () {
      let queryParams = {}
      queryParams.userId = this.userId
      queryParams.uavId = ''
      queryParams.flag = this.timeFlag
      queryParams.startDate = this.startDate
      queryParams.endDate = this.endDate
      queryParams.orderBy = ''
      queryParams.isTeam = this.isTeam
      this.request({
        url: '/crops-platform/api/analysis_v3/teamList',
        method: 'post',
        data: JSON.stringify(queryParams),
        headers: {
          'Content-Type': 'application/json',
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          let result = response.data.data
          if (result.total_measure_area !== undefined) {
            this.chArea = result.total_measure_area // 测绘面积
          } else {
            this.chArea = '0'
          }
          if (result.total_work_area !== undefined) {
            this.orderArea = result.total_work_area // 作业面积
          } else {
            this.orderArea = '0'
          }
          if (result.total_sortie !== undefined) {
            this.uavCount = result.total_sortie // 作业架次
          } else {
            this.uavCount = '0'
          }
          if (result.total_distance !== undefined) {
            this.flyDis = Math.round((result.total_distance / 1000) * 100) / 100 // 飞行里程
          } else {
            this.flyDis = '0'
          }
          if (result.total_time !== undefined) {
            this.flyTime = Math.round((result.total_time / 60000) * 100) / 100 // 飞行时长
          } else {
            this.flyTime = '0'
          }
          if (result.total_land_count !== undefined) {
            this.landCount = result.total_land_count // 地块数量
          } else {

          }
        }
      })
    },
    queryWorkArea () {
      let queryParams = {}
      queryParams.userId = this.userId
      queryParams.uavId = ''
      queryParams.flag = this.timeFlag
      queryParams.startDate = this.startDate
      queryParams.endDate = this.endDate
      queryParams.orderBy = ''
      queryParams.isTeam = this.isTeam
      this.request({
        url: '/crops-platform/api/analysis_v3/workAreaGrowthTrend',
        method: 'post',
        data: JSON.stringify(queryParams),
        headers: {
          'Content-Type': 'application/json',
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          // eslint-disable-next-line no-unused-vars
          let result = response.data.data
          if (result !== undefined) {
            this.statisticalList = result
            let result1 = []
            if (this.timeFlag === 'month') {
              for (let i = 0; i < this.statisticalList.length; i++) {
                this.statisticalList[i].date = this.formatDay(this.statisticalList[i].date)
              }
              let s = {}
              this.statisticalList.forEach(value => {
                s[Number(value.date)] = value.area
              })
              let dayNum = this.getDateNum()
              for (let month = 1; month <= dayNum; month++) {
                result1.push({ date: month, area: s[month] || 0 })
              }
            } else if (this.timeFlag === 'year') {
              let s = {}
              this.statisticalList.forEach(value => {
                s[Number(value.date)] = value.area
              })
              for (let month = 1; month <= 12; month++) {
                result1.push({ date: month, area: s[month] || 0 })
              }
            } else if (this.timeFlag === 'today') {
              let s = {}
              this.statisticalList.forEach(value => {
                s[Number(value.date)] = value.area
              })
              for (let month = 1; month <= 24; month++) {
                result1.push({ date: month, area: s[month] || 0 })
              }
            }
            let acreList = []
            let monthList = []
            for (let i = 0; i < result1.length; i++) {
              acreList.push(result1[i].area.toString())
              monthList.push(result1[i].date.toString())
            }
            this.$chart.line1('chart1', acreList, monthList)
          } else {
            let acreList = []
            let monthList = []
            if (this.timeFlag === 'month') {
              let dayNum = this.getDateNum()
              for (let month = 1; month <= dayNum; month++) {
                monthList[month - 1] = month
              }
            } else if (this.timeFlag === 'year') {
              for (let month = 1; month <= 12; month++) {
                monthList[month - 1] = month
              }
            } else if (this.timeFlag === 'today') {
              for (let month = 1; month <= 24; month++) {
                monthList[month - 1] = month
              }
            }
            this.$chart.line1('chart1', acreList, monthList)
          }
        }
      })
    },
    queryTeamArea () {
      let queryParams = {}
      queryParams.userId = this.userId
      queryParams.uavId = ''
      queryParams.flag = this.timeFlag
      queryParams.startDate = this.startDate
      queryParams.endDate = this.endDate
      queryParams.orderBy = ''
      queryParams.isTeam = this.isTeam
      this.request({
        url: '/crops-platform/api/analysis_v3/workAreaRank',
        method: 'post',
        data: JSON.stringify(queryParams),
        headers: {
          'Content-Type': 'application/json',
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          // eslint-disable-next-line no-unused-vars
          let result = response.data.data
          if (result !== undefined) {
            this.teamAreaList = result
            let nameList = []
            let areaList = []
            for (let i = 0; i < this.teamAreaList.length; i++) {
              nameList.push(this.teamAreaList[i].name)
              areaList.push(this.teamAreaList[i].area)
            }
            this.$chart.bar1('chart2', areaList, nameList)
          } else {
            let nameList = []
            let areaList = []
            this.$chart.bar1('chart2', areaList, nameList)
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #my-statistical
    height 100%
    width 100%
    background-color $color-background-white
    overflow-x hidden
    overflow-y auto
    .teamSearch
      height 1rem
      display flex
      align-items center
      padding-left .4rem
      position relative
      background-color #f2f2f2
      span
        display block
        width 1.6rem
        height .5rem
        line-height .5rem
        text-align center
        font-size 14px
        border-radius 24px
      .selectActive
        background-color $color-bottom-active
        color $color-font-white
    .searchTitle
      height 1rem
      display flex
      align-items center
      padding-left .4rem
      position relative
      background-color #f2f2f2
      span
        display block
        width 1.1rem
        height .5rem
        line-height .5rem
        text-align center
        font-size 14px
        border-radius 24px
      .active
        background-color $color-bottom-active
        color $color-font-white
      .timeVal
        display flex
        font-size 14px
        color $color-font-grey
        position absolute
        right .4rem
        div:first-of-type
          margin-right .1rem
    .statisicalTitle
      div
        text-align center
        font-size 14px
        color $color-font-black-new
        font-weight bold
        margin-top .5rem
        position relative
      div:before
        content ''
        position absolute
        top 50%
        background #E6E6E6
        width 15%
        height 2px
        left 26%
      div:after
        content ''
        position absolute
        top 50%
        background #E6E6E6
        width 15%
        height 2px
        right 26%
    .workStatisical
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
    .areaTitle
      div
        text-align center
        font-size 14px
        color $color-font-black-new
        font-weight bold
        margin-top .5rem
        position relative
      div:before
        content ''
        position absolute
        top 50%
        background #E6E6E6
        width 15%
        height 2px
        left 22%
      div:after
        content ''
        position absolute
        top 50%
        background #E6E6E6
        width 15%
        height 2px
        right 22%
    #chart1
      width 300px
      height 300px
      margin 0 auto
    #chart2
      width 300px
      height 300px
      margin 0 auto
</style>
