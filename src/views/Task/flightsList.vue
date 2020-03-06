<template>
    <div id="flight-list">
      <div class="flightInfo" v-for="(item, index) in flightList" :key="index" @click="goPlayBack(item)">
        <div class="leftInfo">
          <p>{{item.startTime}}</p>
          <span>{{item.endTime}}返航</span>
        </div>
        <div class="rightInfo">
          <div class="topInfo">
            <div>
              <img src="../../common/img/task/waterIcon@3x.png" style="margin-left: 0">
              <p v-if="item.planAcreDosage !== undefined">{{item.planAcreDosage}}<span>L/亩</span></p>
            </div>
            <div>
              <img src="../../common/img/task/areaIcon@3x.png">
              <p>{{item.acre}}<span>亩</span></p>
            </div>
            <div>
              <img src="../../common/img/task/speedIcon@3x.png">
              <p v-if="item.planSpeed !== undefined">{{item.planSpeed}}<span>m/s</span></p>
            </div>
            <div>
              <img src="../../common/img/task/heightIcon@3x.png">
              <p v-if="item.planHeight !== undefined">{{item.planHeight}}<span>m</span></p>
            </div>
          </div>
          <div class="botInfo">
            <div>
              <img src="../../common/img/task/bzIcon@3x.png">
              <p v-if="item.user !== undefined">{{item.user.name}}</p>
            </div>
            <div>
              <img src="../../common/img/task/planIcon@3x.png" style="margin-left: .2rem">
              <p>{{item.uavName}}</p>
            </div>
            <span>{{item.durationF}}</span>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import countDown from 'common/mixins/common'
export default {
  name: 'flightsList',
  mixins: [countDown],
  data () {
    return {
      taskId: '', // 任务id
      tid: '',
      backTime: '15:40', // 返航时间
      waterSpeed: '0', // 喷洒速度
      totalArea: '15', // 喷洒面积
      flySpeed: '3', // 飞行速度
      flyHeight: '15', // 飞行高度
      userName: '张三', // 用户姓名
      planName: '张三的飞机', // 飞机名称
      userTime: '05′22″', // 使用时间
      onLine: navigator.onLine, // 当前网络状况
      flightList: [] // 飞行架次列表
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.taskId = this.$route.query.taskId
    this.tid = this.$route.query.tid
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
          if (result !== null) {
            this.flightList = result
            for (let i = 0; i < this.flightList.length; i++) {
              this.flightList[i].startTime = this.formatMin(this.flightList[i].startTime)
              this.flightList[i].endTime = this.formatMin(this.flightList[i].endTime)
              this.flightList[i].durationF = this.formatTime(this.flightList[i].duration)
              this.flightList[i].durationA = this.flightList[i].duration
            }
          } else {
            this.flightList = []
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
    goPlayBack (item) {
      let recordId = item.id
      localStorage.setItem('flyDuration', item.durationA)
      this.$router.push({ path: '/playBack', query: { 'tid': this.tid, 'recordId': recordId } })
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #flight-list
    height 100%
    width 100%
    background-color $color-background-grey
    overflow-y auto
    .flightInfo
      height 1.64rem
      display flex
      background-color $color-background-white
      margin-top .16rem
      .leftInfo
        padding .46rem 0 0 .42rem
        width 1rem
        p
          font-size 18px
          color #595959
        span
          font-size 12px
          color #595959
      .rightInfo
        margin-left .54rem
        margin-top .24rem
        .topInfo
          display flex
          background-color $color-background-grey-new
          padding .24rem .22rem
          border-radius 6px
          width 4.5rem
          div
            display flex
            align-items center
            img
              height .24rem
              width .24rem
              margin-left .36rem
              margin-right .08rem
            p
              font-size 12px
              color $color-font-grey
            span
              font-size 8px
              color $color-font-grey
        .botInfo
          margin-top .16rem
          display flex
          align-items center
          position relative
          div
            display flex
            align-items center
            img
              height .24rem
              width .24rem
              margin-right .04rem
            p
              font-size 10px
              color $color-font-grey
          span
            font-size 10px
            color $color-font-grey
            position absolute
            right .2rem
    .flightInfo:first-of-type
      margin-top 0
</style>
