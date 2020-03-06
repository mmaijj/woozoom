<template>
    <div id="leader-operation" v-show="visible">
      <div class="header">
        <div class="header-info">
          <div class="headerLogo">
            <img :src="numLogo">
          </div>
          <div class="headerDetail">
            <span>{{numName}}</span>
            <a id="phone" :href="'tel:' + numPhone"><p>{{numPhone}}</p></a>
          </div>
          <div class="callNum" @click="callNum">
            <img src="../../common/img/eppoteam/callPhone@3x.png">
          </div>
        </div>
      </div>
      <div class="set-btn" v-show="isShowBtn">
        <div class="removeNum" @click="removeNum">移除该队员</div>
        <div class="transPromiss" @click="transPromiss">转让管理员</div>
      </div>
<!--      <div class="set-btn" v-show="!isShowBtn">-->
<!--        <cube-button-->
<!--          :primary="true"-->
<!--          @click="goBack">返回</cube-button>-->
<!--      </div>-->
    </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
const EVENT_LEAVE = 'leave'
export default {
  name: 'leaderOperation',
  mixins: [popupMixin],
  props: {
    numDet: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      numName: '', // 队员姓名
      numPhone: '', // 队员电话
      numId: '', // 队员id
      userQx: '', // 用户权限
      isShowBtn: true, // 是否显示按钮
      loginId: '', // 当前登录用户的id
      numLogo: '' // 队员头像
    }
  },
  mounted () {
    this.userQx = localStorage.getItem('userQx') // 当前登录的用户权限
    this.loginId = localStorage.getItem('userId') // 获取当前登录的用户id
    this.getDetail()
  },
  methods: {
    /* 获取队员详情 */
    getDetail () {
      this.numName = this.numDet.userName
      if (this.numDet.userPhone !== null && this.numDet.userPhone !== undefined && this.numDet.userPhone !== '') {
        this.numPhone = this.numDet.userPhone
      } else {
        this.numPhone = localStorage.getItem('userPhone')
      }
      this.numId = this.numDet.userId
      this.numLogo = this.numDet.avatar
      if (this.numId === this.loginId && this.userQx === '1') {
        this.isShowBtn = false
      } else if (this.userQx === '2') {
        this.isShowBtn = false
      } else {
        this.isShowBtn = true
      }
    },
    /* 移除该成员 */
    removeNum () {
      this.$createDialog({
        type: 'confirm',
        content: '确定移除该队员？',
        icon: 'cubeic-alert',
        onConfirm: () => {
          let numParam = new URLSearchParams()
          numParam.set('userId', this.numId)
          this.request({
            url: '/crops-platform/api/protection_v3/captain/deleteFlyer',
            method: 'get',
            params: numParam,
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
                content: '已成功移除',
                icon: 'cubeic-alert',
                onConfirm: () => {
                  this.visible = false
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
      }).show()
    },
    /* 拨打电话 */
    callNum () {
      document.getElementById('phone').click()
    },
    // goBack () {
    //   this.visible = false
    //   this.isShowBtn = true
    //   this.$emit(EVENT_LEAVE)
    // },
    /* 转让队长权限 */
    transPromiss () {
      this.$createDialog({
        type: 'confirm',
        content: '确定转让权限？',
        icon: 'cubeic-alert',
        onConfirm: () => {
          let tranParam = new URLSearchParams()
          tranParam.set('exchangeUserId', this.numId)
          this.request({
            url: '/crops-platform/api/protection_v3/captain/exchange',
            method: 'get',
            params: tranParam,
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
                content: '权限转让成功',
                icon: 'cubeic-alert',
                onConfirm: () => {
                  this.visible = false
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
      }).show()
    }
  }

}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #leader-operation
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    .header
      margin 0 .3rem
      .header-info
        height 2.4rem
        width 100%
        background-color #FFFFFF
        border-radius 20px 20px 0 0
        display flex
        .callNum
          display flex
          align-items center
          margin-left 1.4rem
          img
            height 36px
            width 36px
        .headerLogo
          img
            height 1.2rem
            width 1.2rem
            padding .6rem 0 0 .4rem
        .headerDetail
          span
            color $color-font-black-new
            font-size 18px
            padding .64rem 0 0 .3rem
            display block
          p
            color $color-font-disabled-new
            font-size 14px
            margin .32rem 0 0 .3rem
    .set-btn
      display flex
      padding 0 .3rem
      justify-content space-between
      position fixed
      bottom .4rem
      left 0
      right 0
      .removeNum
        width 3.12rem
        height .88rem
        line-height .88rem
        text-align center
        background-color $color-background-white
        border 1px solid #c8c8c8
        border-radius 22px
        font-size 15px
        color $color-font-black-new
      .transPromiss
        width 3.12rem
        height .88rem
        line-height .88rem
        text-align center
        background-color $color-background-blue
        border-radius 22px
        font-size 15px
        color $color-font-white
</style>
