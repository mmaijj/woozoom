<template>
  <div id="name-info" v-show="visible">
    <cube-input
      v-model="planname"
      :placeholder="setName"
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
  name: 'planName',
  mixins: [popupMixin],
  props: {
    playerName: {
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
      setName: '输入的名称不要超过8个字符',
      isDis: true,
      planname: this.playerName
    }
  },
  watch: {
    planname: function (val) {
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
      if (this.playerName !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    },
    hide () {
      let name = this.planname
      if (name.length > 8) {
        this.errtoast = this.errtoast || this.$createToast({
          txt: '输入的名称过长',
          type: 'txt',
          time: 2000
        })
        this.errtoast.show()
      } else {
        this.$emit(EVENT_LEAVE, this.planname)
        this.visible = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #name-info
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
