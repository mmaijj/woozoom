<template>
  <div id="create-order">
    <div class="login-detail">
      <cube-input
        v-model="account"
        :placeholder="setAccount"
        :autofocus="true"
      ></cube-input>
<!--      <cube-input-->
<!--        v-model="area"-->
<!--        :placeholder="setArea"-->
<!--        :autofocus="true"-->
<!--        @click="showAddressPicker"-->
<!--      ></cube-input>-->
    </div>
    <div class="login-btn">
      <cube-button
        :primary="true"
        @click="createOrder"
      >确定</cube-button>
    </div>
  </div>
</template>

<script>
import countDown from 'common/mixins/common'
export default {
  name: 'createOrder',
  mixins: [countDown],
  data () {
    return {
      account: '', // 订单名称
      setAccount: '订单名称',
      setArea: '地区信息', // 地区信息
      area: '' // 所在省市区
    }
  },
  mounted () {
  },
  methods: {
    /* 创建订单 */
    createOrder () {
      if (this.account !== '') {
        let addParams = new URLSearchParams()
        addParams.set('name', this.account)
        this.request({
          url: '/crops-platform/api/order_v3/createOrder',
          method: 'get',
          params: addParams,
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
              content: '添加成功',
              icon: 'cubeic-alert',
              onConfirm: () => {
                this.$router.push('OrderList')
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
        this.$createDialog({
          type: 'alert',
          content: '订单名称不能为空',
          icon: 'cubeic-alert'
        }).show()
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #create-order
    height 100%
    width 100%
    background-color $color-background-white
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
      position absolute
      bottom 1rem
      left 0
      right 0
</style>
