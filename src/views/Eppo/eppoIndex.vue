<template>
  <div id="eppo-index">
    <div class="eppoTeam">
      <div class="eppo-content">
        <img src="../../common/img/eppoteam/noTeam@3x.png">
        <p>您目前没有所属团队</p>
      </div>
    </div>
    <div class="bottom-btn">
      <!--去掉加入植保队入口-->
      <cube-button
        :primary="true"
        :disabled="isDis"
        @click="joinEppo"
        style="margin-bottom: .4rem;"
      >扫码加入团队</cube-button>
      <cube-button
        :primary="true"
        :disabled="isDis"
        @click="createEppo"
        >创建新的团队</cube-button>
    </div>
    <create-eppo v-show="isCreate" @hide="hide" @changeBlur="changeBlur"></create-eppo>
  </div>
</template>

<script>
import CreateEppo from 'views/Eppo/createEppo'
import wx from 'weixin-js-sdk'
export default {
  name: 'eppoIndex',
  data () {
    return {
      isDis: false,
      isCreate: false,
      userId: '', // 当前用户id
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
    this.userId = localStorage.getItem('userId')
    let _url = this.getSignUrl()
    console.log('当前路径' + _url)
    let appid = 'wx97b55a9b21ad3b5f'
    let srcret = '25726f24d45a8213dfd08bab5b7fa186'
    let getIdParams = new URLSearchParams()
    getIdParams.set('url', _url)
    getIdParams.set('appid', appid)
    getIdParams.set('srcret', srcret)
    this.request({
      url: '/crops-platform/api/wxUser/wxUserInfo_v3/getSDKInfo',
      method: 'get',
      params: getIdParams,
      headers: {
        'clientType': 'weixin',
        'deviceId': '11654325'
      }
    }).then(response => {
      let res = response.data.status
      // eslint-disable-next-line no-unused-vars
      let { code, reasonPhrase } = res
      if (code === 0) {
        let result = JSON.parse(response.data.data)
        wx.config({
          debug: false,
          appId: appid,
          timestamp: result.timestmp,
          nonceStr: result.nonceStr,
          signature: result.signature,
          jsApiList: [
            'scanQRCode'
          ]
        })
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
    /* 解决ios上jssdk配置签名问题 */
    getSignUrl () {
      let url = ''
      let u = navigator.userAgent
      let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 // android终端
      if (isAndroid) {
        url = window.location.href
      } else {
        url = window.entryUrl ? window.entryUrl : window.location.href
      }
      return url
    },
    createEppo () {
      this.isCreate = true
    },
    /* 解决ios在微信浏览器输入框失去焦点页面无法回弹的问题 */
    changeBlur () {
      // eslint-disable-next-line no-unused-vars
      let u = navigator.userAgent; let app = navigator.appVersion
      let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
      if (isIOS) {
        setTimeout(() => {
          const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0
          window.scrollTo(0, Math.max(scrollHeight - 1, 0))
        }, 200)
      }
    },
    hide (val) {
      if (val !== '') {
        let eppoParam = {}
        eppoParam.id = ''
        eppoParam.name = val
        eppoParam.logo = '../../common/img/manger/planPlayer@3x.png'
        this.request({
          url: '/crops-platform/api/protection_v3/captain/add',
          method: 'post',
          data: JSON.stringify(eppoParam),
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
            this.$createDialog({
              type: 'alert',
              content: '创建成功',
              icon: 'cubeic-alert',
              onConfirm: () => {
                localStorage.setItem('userQx', '1')
                this.$router.push('/EppoMain')
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
      } else {
        this.isCreate = false
      }
    },
    joinEppo () {
      // eslint-disable-next-line no-unused-vars
      let _self = this
      wx.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
          // eslint-disable-next-line no-unused-vars
          let result = res.resultStr // 当needResult 为 1 时，扫码返回的结果
          let ss = result.split(',')
          let flag = ss[0]
          let id = ss[1] // 植保队id或者订单id
          console.log('开启扫码啦啦啦')
          // 1：加入植保队 2：分享订单
          if (flag === '1') {
            let inviteParam = new URLSearchParams()
            inviteParam.set('invitationUserId', _self.userId)
            inviteParam.set('teamId', id)
            _self.request({
              url: '/crops-platform/api/protection_v3/captain/invite',
              method: 'get',
              params: inviteParam,
              headers: {
                'clientType': 'weixin',
                'deviceId': '11654325'
              }
            }).then(response => {
              let res = response.data.status
              // eslint-disable-next-line no-unused-vars
              let { code, reasonPhrase } = res
              if (code === 0) {
                _self.$createDialog({
                  type: 'alert',
                  content: '加入成功',
                  icon: 'cubeic-alert',
                  onConfirm: () => {
                    _self.$router.push('/index')
                  }
                }).show()
              } else {
                _self.$createDialog({
                  type: 'alert',
                  content: reasonPhrase,
                  icon: 'cubeic-alert'
                }).show()
              }
            })
          }
        }
      })
    },
    searchResult () {
      this.searchComp = this.searchComp || this.$createSearchResult({
        $props: {
          searchRes: {}
        }
      })
      this.searchComp.show()
    }
  },
  components: {
    CreateEppo
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #eppo-index
    height 100%
    width 100%
    .eppoTeam
      display flex
      align-items center
      justify-content center
      .eppo-content
        img
          height 3.4rem
          width 3rem
          margin-top 2rem
        p
          margin-top 18px
          font-size 16px
          color $color-font-grey
    .bottom-btn
      position absolute
      width 92%
      bottom .4rem
      margin 0 .3rem
</style>
