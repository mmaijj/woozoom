<template>
  <div id="idCard-info" v-show="visible">
    <cube-input
       v-model="cardnumber"
       :clearable="clearable"
       :placeholder="tip"
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
import comMixin from 'common/mixins/common'
const EVENT_LEAVE = 'leave'
export default {
  name: 'idCardInfo',
  mixins: [popupMixin, comMixin],
  props: {
    idCard: {
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
      tip: '请输入身份证号',
      cardnumber: this.idCard
    }
  },
  watch: {
    cardnumber: function (val) {
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
      if (this.idCard !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    },
    hide () {
      let isCard = this.isRightId(this.cardnumber)
      if (isCard) {
        this.$emit(EVENT_LEAVE, this.cardnumber)
        this.cardnumber = ''
        this.visible = false
      } else {
        this.errtoast = this.errtoast || this.$createToast({
          txt: '请输入正确的身份证号',
          type: 'txt',
          time: 2000
        })
        this.errtoast.show()
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #idCard-info
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
