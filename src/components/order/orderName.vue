<template>
  <div id="order-name" v-show="visible">
    <cube-input
      v-model="orderName"
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
const EVENT_LEAVE = 'leave'
export default {
  name: 'orderName',
  mixins: [popupMixin],
  props: {
    ordername: {
      type: String,
      default () {
        return ''
      }
    },
    orderId: {
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
      orderName: this.ordername
    }
  },
  watch: {
    orderName: function (val) {
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
      if (this.ordername !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    },
    hide () {
      let param = {}
      param.id = this.orderId
      param.name = this.orderName
      this.$emit(EVENT_LEAVE, param)
      this.visible = false
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #order-name
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
