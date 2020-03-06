<template>
  <div id="prompt-box">
    <div class="maskLayer"></div>
    <div class="maskContent">
      <div class="closePage">
        <span @click="hidePage()"></span>
      </div>
      <div class="lockIcon">
        <img :src="lockType">
      </div>
      <div class="lockText">
        <p>{{locktext}}</p>
      </div>
      <div class="set-btn" @click="hidePage(pageType)">
        <cube-button
          :primary="true">{{lockbtn}}</cube-button>
      </div>
    </div>
  </div>
</template>

<script>
const HIDE = 'hide'
export default {
  name: 'promptBox',
  props: {
    pageType: {
      type: Number,
      default () {
        return 0
      }
    }
  },
  data () {
    return {
      lockType: '',
      locktext: '',
      visible: false,
      lockbtn: ''
    }
  },
  created () {
    this.isShowPage()
  },
  watch: {
    pageType: function (val) {
      const st = val
      if (st === 1) {
        this.lockType = require('../../common/img/uavplan/lockIcon@3x.png')
        this.locktext = '锁定设备了！'
        this.lockbtn = '确定并锁定'
      } else if (st === 0) {
        this.lockType = require('../../common/img/uavplan/unlockIcon@3x.png')
        this.locktext = '确定解除锁定吗？'
        this.lockbtn = '确定'
      }
    }
  },
  methods: {
    isShowPage () {
      const st = this.pageType
      if (st === 1) {
        this.lockType = require('../../common/img/uavplan/lockIcon@3x.png')
        this.locktext = '锁定设备了！'
        this.lockbtn = '确定并锁定'
      } else if (st === 0) {
        this.lockType = require('../../common/img/uavplan/unlockIcon@3x.png')
        this.locktext = '确定解除锁定吗？'
        this.lockbtn = '确定'
      }
    },
    hidePage (val) {
      this.$emit(HIDE, val)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #prompt-box
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
      .set-btn
        padding 1.3rem 1.4rem .6rem
</style>
