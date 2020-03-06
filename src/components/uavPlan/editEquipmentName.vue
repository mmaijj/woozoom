<template>
  <div id="equip-name" v-show="visible">
    <cube-input
      v-model="equipName"
      :placeholder="tipName"
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
  name: 'editEquipmentName',
  mixins: [popupMixin],
  props: {
    planName: {
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
      tipName: '飞机名称不得多于10位',
      equipName: this.planName
    }
  },
  watch: {
    equipName: function (val) {
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
      if (this.planName !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    },
    hide () {
      if (this.equipName.length > 10) {
        this.$createDialog({
          type: 'alert',
          content: '您输入的名称过长',
          icon: 'cubeic-alert'
        }).show()
      } else {
        this.$emit(EVENT_LEAVE, this.equipName)
        this.visible = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #equip-name
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
