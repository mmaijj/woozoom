<template>
  <div id="manger-main">
    <div class="manger-header">
      <div class="header-scan" @click="scanCode">
        <img src="../../common/img/manger/scanIcon@3x.png">
      </div>
      <div class="header-main" @click="gotoInfo">
        <div class="header-logo">
          <img :src="userLogo">
        </div>
        <div style="margin-left: 16px;">
          <div class="header-detail">
            <label>{{userName}}</label>
          </div>
          <div class="zb-name" @click.stop="joinEppo">{{teamName}}</div>
        </div>
        <div class="more-detail"></div>
      </div>
    </div>
    <div class="manger-main">
      <div class="manger-icon">
        <div @click="gotoEppo">
          <img src="../../common/img/manger/eppoTeam@3x.png">
          <div class="mt-top">植保队</div>
        </div>
        <div @click="gotoUav">
          <img src="../../common/img/manger/uavIcon@3x.png">
          <div class="mt-top">无人机</div>
        </div>
        <div @click="gotoQx">
          <img src="../../common/img/manger/qxIcon@3x.png">
          <div class="mt-top">千寻账号</div>
        </div>
      </div>
      <div class="manger-icon">
        <div @click="gotoOrder">
          <img src="../../common/img/manger/orderIcon@3x.png">
          <div class="mt-top">订单</div>
        </div>
        <div @click="gotoSand">
          <img src="../../common/img/manger/sandTable@3x.png">
          <div class="mt-top">沙盘</div>
        </div>
        <div>
          <img src="../../common/img/manger/msgIcon@3x.png">
          <div class="mt-top">消息</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import wx from 'weixin-js-sdk'
export default {
  name: 'manger',
  props: {
    userInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    userPhone: {
      type: String
    },
    userName: {
      type: String
    },
    teamName: {
      type: String
    },
    userLogo: {
      type: String
    }
  },
  data () {
    return {
      userId: ''
    }
  },
  mounted () {
    this.userId = localStorage.getItem('userId')
    let _url = this.getSignUrl()
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
      }
    })
    // this.goCreateEppo()
  },
  methods: {
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
    /* 跳转到个人信息页面 */
    gotoInfo () {
      localStorage.setItem('tabPage', 'manager')
      this.$router.push('/perInfo')
    },
    /* 跳转到植保队页面 */
    gotoEppo () {
      localStorage.setItem('tabPage', 'manager')
      let eppoParam = new URLSearchParams()
      eppoParam.set('phone', this.userPhone)
      // eppoParam.set('deviceId', '')
      this.request({
        url: '/crops-platform/api/protection_v3/getProtection',
        method: 'get',
        params: eppoParam,
        headers: {
          'clientType': 'weixin',
          'deviceId': '1165465'
        }
      }).then(response => {
        let res = response.data.status
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.$router.push('/EppoMain')
        } else if (code === 4615) {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert',
            onConfirm: () => {
              this.$router.push('/EppoIndex')
            }
          }).show()
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
        }
      })
    },
    joinEppo () {
      let qx = localStorage.getItem('userQx')
      if (qx === '0') {
        this.$createDialog({
          type: 'alert',
          content: '是否加入或创建植保队？',
          icon: 'cubeic-alert',
          onConfirm: () => {
            localStorage.setItem('tabPage', 'manager')
            this.$router.push('/EppoIndex')
          }
        }).show()
      } else {
        localStorage.setItem('tabPage', 'manager')
        this.$router.push('/EppoMain')
      }
    },
    /* 扫码 */
    scanCode () {
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
          if (id !== '') {
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
                      _self.$router.push('/EppoMain')
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
            } else if (flag === '2') {
              let userid = ss[2]
              let userId = localStorage.getItem('userId')
              console.log('用户id' + userid)
              if (userid !== userId) {
                let userQx = localStorage.getItem('userQx') // 用户权限
                if (userQx === '1') {
                  let teamId = localStorage.getItem('teamId')
                  let searchParams = new URLSearchParams()
                  searchParams.set('orderId', id)
                  searchParams.set('receiveTeamId', teamId)
                  _self.request({
                    url: '/crops-platform/api/order_v3/shareOrder',
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
                      _self.$createDialog({
                        type: 'alert',
                        content: '加入成功',
                        icon: 'cubeic-alert'
                      }).show()
                    } else {
                      _self.$createDialog({
                        type: 'alert',
                        content: reasonPhrase,
                        icon: 'cubeic-alert'
                      }).show()
                    }
                  })
                } else {
                  _self.$createDialog({
                    type: 'alert',
                    content: '只有植保队长能够加入订单',
                    icon: 'cubeic-alert'
                  }).show()
                }
              } else {
                _self.$createDialog({
                  type: 'alert',
                  content: '此订单已经属于您所属的植保队,不需要再扫码了',
                  icon: 'cubeic-alert'
                }).show()
              }
            }
          }
        }
      })
    },
    /* 跳转到无人机页面 */
    gotoUav () {
      localStorage.setItem('tabPage', 'manager')
      this.$router.push('/UavList')
    },
    /* 跳转到订单页面 */
    gotoOrder () {
      let flag = localStorage.getItem('userQx')
      if (flag !== '0') {
        localStorage.setItem('tabPage', 'manager')
        this.$router.push('/OrderList')
      } else {
        this.$createDialog({
          type: 'alert',
          content: '没有植保队无法查看订单',
          icon: 'cubeic-alert'
        }).show()
      }
    },
    /* 跳转到沙盘 */
    gotoSand () {
      localStorage.setItem('tabPage', 'manager')
      this.$router.push('/SandTable')
    },
    /* 跳转到千寻账号页面 */
    gotoQx () {
      localStorage.setItem('tabPage', 'manager')
      this.$router.push('/QxList')
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #manger-main
    height 100%
    width 100%
    background-color $color-background-grey
    background-size cover
    .header-scan
      height 1rem
      line-height  1rem
      position relative
      img
        height 30px
        width 30px
        position absolute
        top .4rem
        right .4rem
    .header-main
      height 2.8rem
      display flex
      align-items center
      margin-left .6rem
      position relative
      .header-detail
        height 60px;
        width 200px
        display flex
        align-items center
        label
          font-size 28px
        img
          height 32px
          width 32px
          margin-left 4px
      .zb-name
        width 200px
        height 28px
        line-height 28px
        background linear-gradient(45deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.4) 100%)
        border-radius 4px
        color $color-font-white
        text-align: center
        font-size 14px
      .header-logo
        img
          height 90px
          width 90px
      .more-detail
        height 12px
        width 8px
        background url("../../common/img/manger/moreDetail@3x.png") center center no-repeat
        background-size contain
        position absolute
        right 14px
    .manger-icon
      height 3rem
      display flex
      align-items center
      justify-content space-around
      div
        width 50px
        font-size: 12px;
        text-align: center;
      img
        height 36px
        width 36px
</style>
