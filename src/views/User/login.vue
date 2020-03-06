<template>
    <div id="login-password">
      <div class="login-title">
        无距农业
      </div>
      <div class="login-detail">
        <cube-input
          v-model="account"
          :placeholder="setAccount"
          :autofocus="true"
        ></cube-input>
        <cube-input
          v-model="password"
          :type="passwordType"
          :placeholder="setPassword"
          :eye="eye"
          v-show="!isVercode"
        ></cube-input>
        <cube-input
          v-model="vercode"
          :placeholder="setCode"
          v-show="isVercode"
        ></cube-input>
        <button class="forgetPass" v-show="!isVercode" @click="resetPassword">忘记密码</button>
        <button class="forgetPass" v-show="isVercode" @click="getVercode" :disabled="!login.canGet">
          <span v-show="!login.canGet && isVercode">{{login.waitTime+"s后重新获取"}}</span>
          <span v-show="login.canGet">获取验证码</span>
        </button>
      </div>
      <div class="login-btn">
        <cube-button
          :primary="true"
          :disabled="isDis"
          @click="userlogin"
        >登录</cube-button>
      </div>
      <div class="login-change">
        <!--暂时注释掉验证码登录-->
<!--        <p @click="changeLoginStyle">{{this.loginStyle}}</p>-->
        <p @click="goRegister">新用户注册</p>
      </div>
    </div>
</template>

<script>
import countDown from 'common/mixins/common'
export default {
  name: 'login-password',
  mixins: [countDown],
  data () {
    return {
      account: '',
      password: '',
      vercode: '',
      isDis: true,
      isPassword: false,
      isVercode: false,
      setAccount: '请输入手机号',
      setPassword: '请输入密码',
      setCode: '请输入验证码',
      passwordType: 'password',
      loginStyle: '账号密码登录',
      onLine: navigator.onLine, // 当前网络状况
      eye: {
        open: false,
        reverse: false
      },
      tempLogin: { // 定义一个临时对象
        canGet: true,
        timer: null,
        waitTime: 60
      }
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  watch: {
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
    if (window.entryUrl === undefined) {
      window.entryUrl = location.href.split('#')[0]
    }
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    let flag = this.$route.query.flag
    if (flag !== '1') {
      this.getOpenId()
    }
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
    /* 更改登录方式 */
    changeLoginStyle () {
      if (this.loginStyle === '短信验证码登录') {
        this.loginStyle = '账号密码登录'
        this.isVercode = true
      } else if (this.loginStyle === '账号密码登录') {
        this.loginStyle = '短信验证码登录'
        this.isVercode = false
      }
    },
    /* 获取openid */
    getOpenId () {
      let code = localStorage.getItem('userCode')
      let appid = 'wx705764e5b1918e9e'
      let srcret = '0d65b9f4f4abae3635dad0dbee1194f1'
      let getIdParams = new URLSearchParams()
      getIdParams.set('code', code)
      getIdParams.set('appid', appid)
      getIdParams.set('srcret', srcret)
      this.request({
        url: '/crops-platform/api/wxUser/wxUserInfo_v3/getUserInfo',
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
          localStorage.setItem('openId', result.openid)
          let aa = result.headimgurl
          // eslint-disable-next-line no-useless-escape
          let ss = '\/'
          let cc = aa.replace(ss, '/')
          localStorage.setItem('userHeader', cc)
          localStorage.setItem('nickname', result.nickname)
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    /* 获取验证码 */
    getVercode () {
      if (this.account !== '') {
        const result = this.isRightNumber(this.account)
        if (result) {
          this.toast = this.toast || this.$createToast({
            txt: '验证码已发送至您的手机',
            type: 'txt',
            time: 2000
          })
          this.toast.show()
          this.timeCountdown(this.login)
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
    /* 用户登录 */
    userlogin () {
      let loginParam = new URLSearchParams()
      loginParam.set('clientType', 'app')
      loginParam.set('loginType', 'password')
      loginParam.set('deviceId', '')
      loginParam.set('rememberMe', '1')
      loginParam.set('username', this.account)
      loginParam.set('password', this.password)
      localStorage.setItem('userPassword', this.password) // 记录用户密码
      this.request({
        url: '/crops-platform/a/login',
        method: 'post',
        params: loginParam
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          localStorage.setItem('userPhone', this.account)
          let token = response.data.sessionid
          localStorage.setItem('userToken', token)
          this.$router.push('/index')
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    /* 用户注册 */
    goRegister () {
      this.$router.push('/UserRegister')
    },
    /* 重置密码 */
    resetPassword () {
      this.$router.push('/userRest')
      // this.$router.push('/UserRegister')
      // this.$router.push('/UserReset')
    }
  },
  comments: {
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
        padding-right: 1.5rem;
      .cube-input::after
        border none
        border-bottom 1px solid $color-bottom-line
      .cube-input_active::after
        border-color $color-bottom-active
      .forgetPass
        position absolute
        bottom 16px
        right .3rem
        background-color transparent
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
    .login-change
      margin .4rem .4rem 0 .4rem
      display flex
      justify-content space-between
      font-size 14px
      color $color-font-grey
</style>
