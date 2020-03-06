<template>
  <div id="bind-confirm">
    <div class="maskLayer"></div>
    <div class="maskContent">
      <div class="closePage">
        <span @click="hidePage('1')"></span>
      </div>
      <div class="lockIcon">
        <img :src="lockType">
      </div>
      <div class="lockText">
        <h1>确定要绑定该设备吗？</h1>
        <h2>请确认此账号剩余可绑定设备的次数</h2>
      </div>
      <div class="uavDetail">
        <div>
          <label>绑定的设备名称</label>
          <p>{{uavName}}</p>
        </div>
        <div>
          <label>绑定的设备ID</label>
          <p>{{uavId}}</p>
        </div>
        <div>
          <label>本年剩余可绑定次数</label>
          <p>{{qxNum}}次</p>
        </div>
      </div>
      <div class="set-btn" @click="hidePage('2')">
        <cube-button
          :primary="true">{{lockbtn}}</cube-button>
      </div>
    </div>
  </div>
</template>

<script>
const HIDE = 'hide'
export default {
  name: 'bindConfirm',
  props: {
    uavName: {
      type: String
    },
    uavId: {
      type: String
    },
    qxNum: {
      type: String
    }
  },
  data () {
    return {
      lockType: require('../../common/img/qxaccount/bindTip.png'),
      locktext: '',
      visible: false,
      lockbtn: '确认并绑定'
    }
  },
  methods: {
    hidePage (item) {
      let val = item
      this.$emit(HIDE, val)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #bind-confirm
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    .maskLayer
      height 100%
      width 100%
      background-color $color-background-black
      opacity .4
      z-index 99
    .maskContent
      position absolute
      top 50%
      left 50%
      transform: translate(-50%, -50%);
      background-color $color-background-white
      width 6.6rem
      .closePage
        height 1rem
        line-height 1rem
        span
          display block
          height 30px
          width 30px
          background url("../../common/img/uavplan/closePage@3x.png") center center no-repeat
          background-size contain
          float right
          margin-right .2rem
      .lockIcon
        display flex
        justify-content center
        align-items center
        img
          width 150px
          height 155px
      .lockText
        font-size 14px
        color $color-font-grey
        margin-top 4px
        padding 0 .8rem
        text-align center
        h1
          font-size 16px
          color #1E1E1E
        h2
          font-size 12px
          color #505050
          margin-top .2rem
      .uavDetail
        font-size 12px
        padding 0 .5rem
        margin-top .5rem
        div
          display flex
          height .5rem
          align-items center
        label
          flex 1
          color #969696
        p
          color #1E1E1E
      .set-btn
        padding 1.3rem 1.4rem .6rem
</style>
