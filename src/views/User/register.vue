<template>
  <div id="login-password">
    <div class="login-title">
      注册无距农业
    </div>
    <div class="login-detail">
      <cube-input
        v-model="account"
        v-show="isVercode"
        :placeholder="setAccount"
        :autofocus="true"
      ></cube-input>
      <cube-input
        v-model="vercode"
        :placeholder="setCode"
        v-show="isVercode"
      ></cube-input>
      <cube-input
        v-model="password"
        :type="passwordType"
        :placeholder="setPassword"
        :eye="eye"
        v-show="!isVercode"
      ></cube-input>
      <button class="forgetPass" @click="getVercode" :disabled="!login.canGet" v-show="isVercode">
        <span v-show="!login.canGet">{{login.waitTime+"s后重新获取"}}</span>
        <span v-show="login.canGet">获取验证码</span>
      </button>
    </div>
    <div class="login-btn">
      <cube-button
        :primary="true"
        :disabled="isDis"
        @click="setPass"
      >{{buttonText}}</cube-button>
    </div>
  </div>
</template>

<script>
import countDown from 'common/mixins/common'
export default {
  name: 'register',
  mixins: [countDown],
  data () {
    return {
      account: '', // 账号
      vercode: '', // 验证码
      password: '', // 密码
      isDis: true,
      isVercode: true, // 是否获取验证码
      setAccount: '请输入手机号',
      setCode: '请输入验证码',
      setPassword: '请设置密码  ( 6-16位字母+数字组合 )',
      buttonText: '下一步',
      passwordType: 'password',
      onLine: navigator.onLine, // 当前网络状况
      tempLogin: { // 定义一个临时对象
        canGet: true,
        timer: null,
        waitTime: 60
      },
      eye: { // 设置密码显示或者隐藏
        open: true,
        reverse: false
      }
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  watch: {
    /* 监听账号，在没有输入账号的时候，按钮无法使用 */
    account: function (val) {
      const account = val
      if (account !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    }
  },
  computed: {
    login () { // 最终对象
      if (!this.tempLogin.canGet) {
        return this.timeCountdown(this.tempLogin)
      } else {
        return this.tempLogin
      }
    }
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
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
    /* 获取验证码 */
    getVercode () {
      if (this.account !== '') {
        let result = this.isRightNumber(this.account)
        let codeParam = new URLSearchParams()
        codeParam.set('phone', this.account) // 电话号码
        if (result) {
          this.request({
            url: '/crops-platform/api/base/textCode',
            method: 'get',
            params: codeParam
          }).then(response => {
            let res = response.data.status
            let { code, reasonPhrase } = res
            if (code === 0) {
              this.toast = this.toast || this.$createToast({
                txt: '验证码已发送至您的手机',
                type: 'txt',
                time: 2000
              })
              this.toast.show()
              this.timeCountdown(this.login)
            } else {
              this.$createDialog({
                type: 'alert',
                icon: 'cubeic-alert',
                content: reasonPhrase
              }).show()
            }
          })
        } else {
          this.errorToast = this.errorToast || this.$createToast({
            txt: '请输入正确的手机号',
            type: 'txt',
            time: 2000
          })
          this.errorToast.show()
        }
      } else {
        this.errtoast = this.errtoast || this.$createToast({
          txt: '请输入手机号',
          type: 'txt',
          time: 2000
        })
        this.errtoast.show()
      }
    },
    /* 重新设置密码 */
    setPass () {
      if (this.isVercode) {
        if (this.vercode !== '') {
          this.buttonText = '注册'
          this.isVercode = false
        } else {
          this.errvercode = this.errvercode || this.$createToast({
            txt: '请输入验证码',
            type: 'txt',
            time: 2000
          })
          this.errvercode.show()
        }
      } else {
        let passResult = this.isRightPass(this.password)
        if (passResult) {
          let registerParam = {}
          registerParam.phone = this.account // 电话号码
          registerParam.textCode = this.vercode // 验证码
          registerParam.password = this.password // 设置的密码
          this.request({
            url: '/crops-platform/api/user/userInfo_v3/registration',
            method: 'post',
            data: JSON.stringify(registerParam),
            headers: {
              'Content-Type': 'application/json',
              'clientType': 'weixin',
              'deviceId': '11654325'
            }
          }).then(response => {
            let res = response.data.status
            let { code, reasonPhrase } = res
            if (code === 0) {
              this.$createDialog({
                type: 'alert',
                content: '注册成功',
                icon: 'cubeic-alert',
                onConfirm: () => {
                  this.$router.push({ path: '/UserLogin', query: { 'flag': '1' } })
                }
              }).show()
            } else {
              this.$createDialog({
                type: 'alert',
                content: reasonPhrase,
                icon: 'cubeic-alert',
                onConfirm: () => {
                  this.isVercode = true
                  this.password = ''
                  this.vercode = ''
                  this.buttonText = '下一步'
                }
              }).show()
            }
          })
        } else {
          this.errpass = this.errpass || this.$createToast({
            txt: '密码格式不正确',
            type: 'txt',
            time: 2000
          })
          this.errpass.show()
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #login-password
    height 100%
    width 100%
    background-color $color-background-white
    .login-title
      width 100%
      color $color-font-black
      font-size 30px
      margin 1rem 0 .6rem .3rem
    .login-detail
      position relative
      padding 0 .3rem
      .cube-input
        margin-top 20px
        height 50px
        /*padding-right: 1.5rem;*/
      .cube-input::after
        border none
        border-bottom 1px solid $color-bottom-line
      .cube-input_active::after
        border-color $color-bottom-active
      .forgetPass
        position absolute
        bottom 16px
        right .3rem
        background-color $color-background-white
        border none
        border-left 1px solid $color-bottom-active
        outline none
        font-size 14px
        height 20px
        line-height 20px
        color $color-bottom-active
        padding-left .2rem
    .login-btn
      margin .8rem .3rem 0 .3rem
</style>
