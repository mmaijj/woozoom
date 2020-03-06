<template>
  <div id="join-eppo" v-show="visible">
    <cube-input
      v-model="eppoNumber"
      :clearable="clearable"
      :placeholder="teamNumber"
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
  name: 'applyJoinEppo',
  mixins: [popupMixin],
  data () {
    return {
      clearable: {
        visible: true,
        blurHidden: true
      },
      isDis: true,
      eppoNumber: '',
      teamNumber: '请输入队长手机号'
    }
  },
  watch: {
    eppoNumber: function (val) {
      const number = val
      if (number !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    }
  },
  created () {
  },
  methods: {
    hide () {
      this.$emit(EVENT_LEAVE, this.planname)
      this.visible = false
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #join-eppo
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
