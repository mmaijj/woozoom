<template>
  <div id="invite-member" v-show="visible">
    <cube-input
      v-model="memberNum"
      v-show="isInvite"
      :clearable="clearable"
      :placeholder="teamNumber"
    ></cube-input>
    <div v-show="!isInvite" class="invitedNum">
      <div class="memberInfo">
        <img :src="userLogo">
        <span>{{memberName}}</span>
      </div>
    </div>
    <div class="set-btn">
      <cube-button
        :primary="true"
        :disabled="isDis"
        v-show="isInvite"
        @click="searchMember"
      >确定</cube-button>
    </div>
    <div class="set-btn">
      <cube-button
        :primary="true"
        v-show="!isInvite"
        @click="inviteUser"
      >邀请TA加入</cube-button>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
import countDown from 'common/mixins/common'
// eslint-disable-next-line no-unused-vars
const EVENT_LEAVE = 'leave'
export default {
  name: 'inviteMember',
  mixins: [popupMixin, countDown],
  data () {
    return {
      clearable: {
        visible: true,
        blurHidden: true
      },
      isDis: true,
      isInvite: true,
      memberNum: '',
      memberName: '', // 团员姓名
      memberPhone: '', // 团员手机号
      memberId: '', // 被邀请人id
      userLogo: '',
      teamNumber: '请输入被邀请者的手机号'
    }
  },
  watch: {
    memberNum: function (val) {
      const number = val
      if (number !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    }
  },
  created () {
  },
  methods: {
    searchMember () {
      let result = this.isRightNumber(this.memberNum)
      if (result) {
        let searchParam = new URLSearchParams()
        searchParam.set('phone', this.memberNum)
        this.request({
          url: '/crops-platform/api/protection_v3/captain/inviteSearch',
          method: 'get',
          params: searchParam,
          headers: {
            'clientType': 'weixin',
            'deviceId': '11654325'
          }
        }).then(response => {
          let res = response.data.status
          let memberDetail = response.data.data
          // eslint-disable-next-line no-unused-vars
          let { code, reasonPhrase } = res
          if (code === 0) {
            this.isInvite = false
            this.memberName = memberDetail.name
            this.memberPhone = memberDetail.phone
            this.memberId = memberDetail.userId
            this.userLogo = memberDetail.avatar
          } else {
            this.$createDialog({
              type: 'alert',
              content: reasonPhrase,
              icon: 'cubeic-alert'
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
    },
    inviteUser () {
      let inviteParam = new URLSearchParams()
      inviteParam.set('invitationUserId', this.memberId)
      inviteParam.set('teamId', '0')
      this.request({
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
          this.$createDialog({
            type: 'alert',
            content: '邀请成功',
            icon: 'cubeic-alert',
            onConfirm: () => {
              this.visible = false
              this.isInvite = true
              this.memberNum = ''
              this.$emit(EVENT_LEAVE)
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
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #invite-member
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    .cube-input
      height 1.2rem
      color $color-font-black-new
      font-size 15px
      .cube-input-field
        height 1.2rem
    .cube-input::after
      border none
    .cube-input_active::after
      border-color transparent
    .invitedNum
      margin 0 .3rem
      .memberInfo
        width 100%
        height 2.4rem
        background-color $color-background-white
        border-radius 20px 20px 0px 0px
        display flex
        align-items center
        img
          height 60px
          width 60px
          margin-left .4rem
        span
          color $color-font-black-new
          font-size 18px
          margin-left .3rem
    .set-btn
      margin 0 .3rem
      position absolute
      width 92%
      bottom .4rem
</style>
