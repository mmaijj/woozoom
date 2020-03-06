<template>
  <div id="invite-member">
    <div class="invite-content">
      <div class="invite-header">
        <img :src="teamLogo">
        <label>{{teamName}}</label>
      </div>
      <div class="invite-code">
        <div>
          <div id="qrcode">
          </div>
          <div class="join-apply">扫码提交加入申请</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
import QRCode from 'qrcodejs2'
export default {
  name: 'qrcodeInvite',
  mixins: [popupMixin],
  data () {
    return {
      teamId: '', // 植保队id
      teamLogo: '', // 植保队头像
      teamName: '', // 植保队名称
      pageFlag: '1' // 扫码页面1：加入植保队 2：加入订单
    }
  },
  watch: {
  },
  created () {
    this.teamId = localStorage.getItem('teamId')
    this.$nextTick(function () {
      this.qrcode()
    })
  },
  mounted () {
    this.teamName = localStorage.getItem('teamName')
    this.teamLogo = localStorage.getItem('teamLogo')
  },
  methods: {
    //  生成二维码
    qrcode () {
      let aa = '1' + ',' + this.teamId
      let qrcode = new QRCode('qrcode', {
        width: 160,
        height: 160, // 高度
        text: aa // 二维码内容
      })
      return qrcode
    }
  },
  components: {
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #invite-member
    width 100%
    height 100%
    background-color $color-background-grey
    .invite-content
      padding 1.1rem .3rem 0 .3rem
      .invite-header
        height 2.4rem
        background url("../../common/img/eppoteam/header_bg@3x.png") center center no-repeat
        background-size cover
        display flex
        align-items center
        img
          height 60px
          width 60px
          margin-left .4rem
        label
          color $color-font-white
          font-size 18px
          margin-left .3rem
      .invite-code
        height 6rem
        background-color $color-background-white
        display flex
        align-items center
        justify-content center
        .join-apply
          color $color-font-black-new
          font-size 14px
          text-align center
          margin-top .2rem
</style>
