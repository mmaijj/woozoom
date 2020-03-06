<template>
  <div :class="ionCls" v-show="isShow">
    <ul>
      <li v-show="isAdd" @click="createQrcode">生成邀请二维码</li>
      <li v-show="isAdd" @click="inviteNum">通过手机号搜索</li>
      <li v-show="!isAdd" @click="dissTeam">{{czText}}</li>
    </ul>
  </div>
</template>

<script>
const HIDE_ICON = 'hideIcon'
export default {
  name: 'invitationIcon',
  props: {
    size: {
      type: Number
    },
    memberCount: {
      type: Number,
      default () {
        return 0
      }
    }
  },
  data () {
    return {
      isAdd: true,
      isShow: false,
      czText: '',
      xs: '' // 权限类别
    }
  },
  computed: {
    ionCls () {
      const classMap = ['add', 'more']
      return `icon ${classMap[this.size]}`
    }
  },
  created () {
    this.changeType()
  },
  mounted () {
  },
  methods: {
    changeType () {
      const ty = this.size
      /* 获取当前用户权限，如果是队长显示'解散团队'按钮，如果是队员显示'退出团队'按钮 */
      this.xs = localStorage.getItem('userQx')
      if (ty === 0) {
        this.isAdd = true
      } else {
        this.isAdd = false
        if (this.xs === '1') {
          this.czText = '解散团队'
        } else {
          this.czText = '退出团队'
        }
      }
    },
    inviteNum () {
      this.inviteComp = this.inviteComp || this.$createInviteMember({
        $events: {
          leave: () => {
            this.$emit(HIDE_ICON)
          }
        }
      })
      this.inviteComp.show()
    },
    /* 解散团队 */
    dissTeam () {
      if (this.xs === '1') {
        /* 队长解散团队 */
        if (this.memberCount === 0) {
          this.$createDialog({
            type: 'confirm',
            content: '确认解散团队？',
            icon: 'cubeic-alert',
            onConfirm: () => {
              this.request({
                url: '/crops-platform/api/protection_v3/captain/delete',
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
                  this.$createDialog({
                    type: 'alert',
                    content: '解散成功',
                    icon: 'cubeic-alert',
                    onConfirm: () => {
                      this.$router.push('/index')
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
        } else {
          this.$createDialog({
            type: 'alert',
            content: '解散团队前请先移除团队成员！',
            icon: 'cubeic-alert'
          }).show()
        }
      } else if (this.xs === '2') {
        /* 成员退出团队 */
        this.$createDialog({
          type: 'confirm',
          content: '确认退出团队？',
          icon: 'cubeic-alert',
          onConfirm: () => {
            let userid = localStorage.getItem('userId')
            let tcParams = new URLSearchParams()
            tcParams.set('userId', userid)
            this.request({
              url: '/crops-platform/api/protection_v3/captain/flyerExit',
              method: 'get',
              params: tcParams,
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
                  content: '退出',
                  icon: 'cubeic-alert',
                  onConfirm: () => {
                    localStorage.removeItem('userToken')
                    localStorage.removeItem('myChoose')
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
          }
        }).show()
      }
    },
    createQrcode () {
      this.$router.push('/EppoQrcode')
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  .icon
    position absolute
    top 1.2rem
    z-index 10
    &.add
      right 1.4rem
    &.more
      right .3rem
    ul
      background-color $color-background-white
      box-shadow 0px 2px 20px 0px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.1)
      border-radius 6px
      li
        height 1.2rem
        line-height 1.2rem
        width 3.6rem
        text-align center
        font-size 16px
        color $color-font-black-new
</style>
