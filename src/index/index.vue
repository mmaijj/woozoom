<template>
  <div id="index">
    <cube-tab-bar
      v-model="activePanel"
      :data="tabs"
      :useTransition="isTrans"
      >
      <cube-tab v-for="(item, index) in tabs" :label="item.label" :key="index">
        <!-- name为icon的插槽 -->
        <div class="verCenter">
          <div slot="icon" :class="item.icon"></div>
        </div>
        <!-- 默认插槽 -->
        <span>{{item.label}}</span>
      </cube-tab>
    </cube-tab-bar>
    <cube-tab-panels v-model="activePanel">
      <cube-tab-panel :label="task">
        <task></task>
      </cube-tab-panel>
      <cube-tab-panel :label="count">
        <statistical :userqx="userqx"></statistical>
      </cube-tab-panel>
      <cube-tab-panel :label="manger">
        <manger :teamName="teamName" :userPhone="userPhone" :userName="userName" :userLogo="userLogo"></manger>
      </cube-tab-panel>
    </cube-tab-panels>
  </div>
</template>

<script>
import Manger from 'views/Manger/manger'
import Task from 'views/Task/task'
import Statistical from 'views/Statistical/statistical'
export default {
  name: 'index',
  data () {
    return {
      activePanel: '管理',
      task: '任务',
      count: '统计',
      manger: '管理',
      status: '',
      tabs: [{
        label: '任务',
        icon: 'task'
      }, {
        label: '统计',
        icon: 'count'
      }, {
        label: '管理',
        icon: 'manger'
      }],
      userPhone: '213123',
      teamName: '',
      isTrans: false,
      userName: '',
      userLogo: '',
      userqx: 0,
      onLine: navigator.onLine, // 当前网络状况
      userInfo: {} // 用户信息
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    if (window.entryUrl === undefined) {
      window.entryUrl = location.href.split('#')[0]
    }
    let tag = localStorage.getItem('tabPage')
    if (tag === 'manager') {
      this.activePanel = '管理' // 初始化显示管理页面
    } else if (tag === 'task') {
      this.activePanel = '任务' // 初始化显示管理页面
    } else {
      this.activePanel = '管理' // 初始化显示管理页面
    }
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    // this.getOpenId()
    this.getUserDetail()
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
    getUserDetail () {
      localStorage.setItem('linePhone', '') // 用户联系电话
      localStorage.setItem('userQx', '')
      localStorage.setItem('userId', '') // 用户id
      localStorage.setItem('userName', '') // 用户昵称
      localStorage.setItem('userCard', '') // 用户身份证号码
      localStorage.setItem('userLogo', '') // 用户头像
      this.userPhone = localStorage.getItem('userPhone')
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
          let userQx = response.data.data.protectionRole // 0：未加入植保队 1:队长  2：队员
          let userName = ''
          if (response.data.data.realName !== '') {
            userName = response.data.data.realName // 登录人的真实姓名
          } else {
            userName = localStorage.getItem('nickname')
          }
          let teamName = ''
          if (userQx === 0) {
            teamName = '未加入植保队' // 当没加入植保队的时候，显示'未加入植保队'
          } else {
            teamName = response.data.data.protectionName // 所属植保队名称
          }
          this.teamName = teamName
          this.userName = userName
          if (response.data.data.avator !== '') {
            this.userLogo = response.data.data.avator
          } else {
            let cc = localStorage.getItem('userHeader')
            this.uploadwxHeader(cc)
            // this.uploadHearder()
          }
          this.userqx = userQx
          localStorage.setItem('userQx', userQx)
          localStorage.setItem('linePhone', response.data.data.phone) // 联系电话
          localStorage.setItem('userId', response.data.data.id) // 用户id
          localStorage.setItem('userName', userName) // 用户昵称
          localStorage.setItem('userCard', response.data.data.cardNo) // 用户身份证号码
          localStorage.setItem('userLogo', this.userLogo) // 用户头像
          localStorage.setItem('quaCount', response.data.data.qualificationsCount) // 用户头像
          localStorage.setItem('teamId', response.data.data.office.id)
        }
      })
    },
    /* 上传微信头像 */
    uploadwxHeader (val) {
      let updateParams = new URLSearchParams()
      updateParams.set('urlStr', val)
      this.request({
        url: '/crops-platform/api/base/file/wx/upload',
        method: 'post',
        data: updateParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.changeInfo('1', response.data.data)
        }
      })
    },
    /* 更改个人信息 */
    changeInfo (type, val) {
      // type： 1 头像 2 更改姓名 3 更改电话 4 更改身份证
      let updateParams = {}
      updateParams.id = this.userId
      switch (type) {
        case '1':
          updateParams.avator = val
          break
        case '2':
          updateParams.realName = val
          break
        case '3':
          updateParams.phone = val
          break
        case '4':
          updateParams.cardNo = val
          break
      }
      this.request({
        url: '/crops-platform/api/user/userInfo_v3/save',
        method: 'post',
        data: updateParams,
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
          this.getUserDetail()
        } else {
        }
      })
    },
    /* 上传头像 */
    uploadHearder () {
      let updateParams = {}
      updateParams.id = localStorage.getItem('userId')
      updateParams.avator = localStorage.getItem('userHeader')
      this.request({
        url: '/crops-platform/api/user/userInfo_v3/save',
        method: 'post',
        data: updateParams,
        headers: {
          'Content-Type': 'application/json',
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
      })
    }
  },
  components: {
    Manger,
    Task,
    Statistical
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #index
    height 100%
    width 100%
    .cube-tab-panels
      height 92%
      .cube-tab-panel
        height 100%
    .cube-tab-bar
      position: absolute;
      bottom: 0;
      width: 100%;
      height 8%
      font-size 12px
      color $color-font-grey
      border-top: 1px solid $color-bottom-line;
      background-color $color-background-grey
      .verCenter
        display flex
        justify-content center
        margin-bottom 5px
      .cube-tab_active
        color $color-font-black
        .task
          height 22px
          width 18px
          background url("../common/img/icon/taskActive@3x.png") center center no-repeat
          background-size contain
        .count
          height 22px
          width 18px
          background url("../common/img/icon/countActive@3x.png") center center no-repeat
          background-size contain
        .manger
          height 22px
          width 18px
          background url("../common/img/icon/manActive@3x.png") center center no-repeat
          background-size contain
      .task
        height 22px
        width 18px
        background url("../common/img/icon/taskIcon@3x.png") center center no-repeat
        background-size contain
      .count
        height 22px
        width 18px
        background url("../common/img/icon/countIcon@3x.png") center center no-repeat
        background-size contain
      .manger
        height 22px
        width 18px
        background url("../common/img/icon/mangerIcon@3x.png") center center no-repeat
        background-size contain
</style>
