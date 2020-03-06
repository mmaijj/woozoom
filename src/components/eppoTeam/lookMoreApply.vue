<template>
  <div id="apply-info" v-show="visible">
    <div class="apply-list">
      <div class="apply-detail">
        <img src="../../common/img/manger/planPlayer@3x.png">
        <p>乌海</p>
        <div class="cz-btn">
          <div class="icon refuse">拒绝</div>
          <div class="icon agree">同意</div>
        </div>
      </div>
      <div class="apply-detail">
        <img src="../../common/img/manger/planPlayer@3x.png">
        <p>乌海</p>
        <div class="cz-btn">
          <div class="icon refuse">拒绝</div>
          <div class="icon agree">同意</div>
        </div>
      </div>
      <div class="apply-detail">
        <img src="../../common/img/manger/planPlayer@3x.png">
        <p>乌海</p>
        <div class="cz-btn">
          <div class="icon refuse">拒绝</div>
          <div class="icon agree">同意</div>
        </div>
      </div>
    </div>
    <div class="set-btn" @click="hide">
      <cube-button
        :primary="true"
      >关闭</cube-button>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
export default {
  name: 'lookMoreApply',
  mixins: [popupMixin],
  props: {
  },
  data () {
    return {
    }
  },
  watch: {
  },
  created () {
  },
  methods: {
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #apply-info
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    .apply-list
      color $color-font-black-new
      background-color $color-background-white
      .apply-detail
        display flex
        height 1.2rem
        align-items center
        img
          height .6rem
          width .6rem
          margin-left .3rem
        p
          font-size 15px
          color $color-font-black-new
          margin-left .2rem
        .cz-btn
          display flex
          position absolute
          right .4rem
          .icon
            width 80px
            height 26px
            line-height 26px
            text-align center
            border-radius 15px
            font-size 16px
            &.refuse
              background-color $color-background-white
              color $color-font-grey
              border 1px solid $color-font-grey
              margin-right .2rem
            &.agree
              background-color $color-background-blue
              color $color-font-white
              border 1px solid $color-background-blue
    .set-btn
      margin 0 .3rem
      position absolute
      width 92%
      bottom .4rem
</style>
