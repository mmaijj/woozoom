<template>
    <div id="recycle-detail">
      <div class="uavId">
        <label>设备ID</label>
        <div class="uavDetal">{{uavId}}</div>
      </div>
      <div class="copyCode">
        <div class="uavCode">
          <label>设备激活码</label>
          <div>{{uavCode}}</div>
        </div>
        <div class="copyBtn" :data-clipboard-text="copyText" @click="copyCode">一键复制</div>
      </div>
    </div>
</template>

<script>
import Clipboard from 'clipboard'
export default {
  name: 'recycleDetail',
  data () {
    return {
      snId: '',
      uavId: '', // 设备id
      onLine: navigator.onLine, // 当前网络状况
      copyText: '', // 复制的内容
      uavCode: '' // 设备激活码
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.snId = this.$route.query.snId
    this.queryUavDetail()
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
    /* 查询无人机详情 */
    queryUavDetail () {
      let detailParam = new URLSearchParams()
      detailParam.set('sn', this.snId)
      this.request({
        url: '/crops-platform/api/uav_v3/getDetail',
        method: 'get',
        params: detailParam,
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
          if (result !== undefined) {
            this.uavId = result.sn
            if (result.activeCode !== undefined) {
              this.uavCode = result.activeCode
            } else {
              this.uavCode = ''
            }
            this.copyText = this.uavId + ',' + this.uavCode
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
    /* 复制并转发 */
    copyCode () {
      let _self = this
      const clipboard = new Clipboard('.copyBtn')
      clipboard.on('success', function (e) {
        _self.toast = _self.toast || _self.$createToast({
          txt: '复制成功',
          type: 'txt',
          time: 2000
        })
        _self.toast.show()
      })
      clipboard.on('error', function (e) {
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #recycle-detail
    height 100%
    width 100%
    background-color $color-background-grey
    position relative
    .uavId
      height 4rem
      background-color $color-background-white
      label
        font-size 16px
        color $color-font-black-new
        display block
        text-align center
        padding-top .8rem
      div
        width 4.8rem
        height .92rem
        background-color $color-background-grey
        color $color-font-black-new
        -webkit-user-select:auto
        margin: .4rem auto 0 auto
        text-align center
        line-height .92rem
        font-size 12px
    .copyCode
      background-color $color-background-white
      margin-top .12rem
      height 80%
      .uavCode
        height 4rem
        label
          font-size 16px
          color $color-font-black-new
          display block
          text-align center
          padding-top .8rem
        div
          width 4.8rem
          height .92rem
          background-color $color-background-grey
          color $color-font-black-new
          font-size 20px
          margin: .4rem auto 0 auto
          text-align center
          line-height .92rem
          font-size 14px
      .copyBtn
        width 6.6rem
        height .88rem
        line-height .88rem
        text-align center
        background-color $color-font-blue
        color $color-font-white
        border-radius 22px
        position absolute
        right 0
        left 0
        bottom .4rem
        margin auto
</style>
