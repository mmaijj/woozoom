<template>
  <div id="phone-info" v-show="visible">
    <cube-input
      v-model="phonenumber"
      :clearable="clearable"
    ></cube-input>
    <div class="set-btn" @click="hide">
      <cube-button
        :primary="true"
        :disabled="isDis">确定</cube-button>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
import countDown from 'common/mixins/common'
const EVENT_LEAVE = 'leave'
export default {
  name: 'phoneNumber',
  mixins: [popupMixin, countDown],
  props: {
    phoneNum: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      clearable: {
        visible: true,
        blurHidden: true
      },
      isDis: true,
      phonenumber: this.phoneNum
    }
  },
  watch: {
    phonenumber: function (val) {
      const number = val
      if (number !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    }
  },
  created () {
    this._getNumber()
  },
  methods: {
    _getNumber () {
      if (this.phoneNum !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    },
    hide () {
      const result = this.isRightNumber(this.phonenumber)
      if (result) {
        this.$emit(EVENT_LEAVE, this.phonenumber)
        this.visible = false
      } else {
        this.$createDialog({
          type: 'alert',
          content: '请输入正确的手机号',
          icon: 'cubeic-alert'
        }).show()
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #phone-info
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
    .set-btn
      margin 0 .3rem
      position absolute
      width 92%
      bottom .4rem
</style>
