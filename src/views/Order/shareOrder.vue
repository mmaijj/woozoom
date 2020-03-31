<template>
  <div id="share-order">
    <div class="invite-content">
      <div class="orderContent">
        <div class="orderTitle">
          <label>{{orderName}}</label>
        </div>
        <div class="createTime">
          <img src="../../common/img/manger/planPlayer@3x.png">
          <div>
            <p>{{userName}}</p>创建于<p>{{createTime}}</p>
          </div>
        </div>
      </div>
      <div class="invite-code">
        <div>
          <div id="qrcode">
          </div>
          <div class="join-apply">扫码加入该订单</div>
        </div>
        <div class="shareCode" style="display: none">
          分享二维码
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
import QRCode from 'qrcodejs2'

export default {
  name: 'shareOrder',
  mixins: [popupMixin],
  data () {
    return {
      orderName: '',
      userName: '',
      orderId: '',
      userId: '',
      createTime: ''
    }
  },
  watch: {},
  created () {
    let orderDetail = JSON.parse(sessionStorage.getItem('orderDetail'))
    this.orderName = orderDetail.orderName
    this.userName = orderDetail.userName
    this.orderId = orderDetail.orderId
    this.createTime = orderDetail.createTime
    this.userId = localStorage.getItem('userId')
    this.$nextTick(function () {
      this.qrcode()
    })
  },
  mounted () {
  },
  methods: {
    //  生成二维码
    qrcode () {
      let aa = '2' + ',' + this.orderId + ',' + this.userId
      let qrcode = new QRCode('qrcode', {
        width: 160,
        height: 160, // 高度
        text: aa // 二维码内容
      })
      return qrcode
    }
  },
  components: {}
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #share-order
    width 100%
    height 100%
    background-color $color-background-grey
    .invite-content
      padding 1.1rem .3rem 0 .3rem
      .orderContent
        height 1.8rem
        background-color $color-background-white
        margin-top .2rem
        padding 0 .3rem
        border-radius 6px 6px 0 0
        position relative
        border-bottom 1px solid #DCDCDC
        .orderTitle
          padding-top .2rem
          font-size 16px
          color $color-font-black-new
        .createTime
          display flex
          height .48rem
          align-items center
          position absolute
          bottom .2rem
          img
            height 24px
            width 24px
          div
            display flex
            align-items center
            font-size 12px
            color $color-font-grey
            margin-left .12
      .invite-code
        height 6rem
        background-color $color-background-white
        display flex
        align-items center
        justify-content center
        flex-direction column
        padding-top .6rem
        .join-apply
          color $color-font-black-new
          font-size 14px
          text-align center
          margin-top .2rem
        .shareCode
          width 2.8rem
          height .88rem
          text-align center
          line-height .88rem
          border-radius 22px
          border 2px solid #C8C8C8
          margin-top .8rem
</style>
