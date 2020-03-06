<template>
  <div id="search-info" v-show="visible">
    <div class="appoTeam">
      <div class="appo-header">
        <img src="../../common/img/manger/planPlayer@3x.png">
        <p>老司机植保</p>
      </div>
      <div class="appo-detail">
        <div>
          <label>队长</label>
          <p>阿拉蕾</p>
        </div>
        <div>
          <label>团队成员</label>
          <p>5人</p>
        </div>
        <div>
          <label>创建时间</label>
          <p>2019/08/31</p>
        </div>
      </div>
    </div>
    <div class="set-btn">
      <cube-button
        :primary="true"
        :disabled="isDis"
        @click="hide"
      >申请加入</cube-button>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
export default {
  name: 'searchResult',
  mixins: [popupMixin],
  props: {
    searchRes: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      clearable: {
        visible: true,
        blurHidden: true
      },
      isDis: false
    }
  },
  created () {
  },
  methods: {
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #search-info
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    .appoTeam
      margin 0 .3rem
      .appo-header
        height 2.4rem
        background url("../../common/img/eppoteam/header_bg@3x.png") center center no-repeat
        background-size cover
        display flex
        img
          height 60px
          width 60px
          margin .6rem 0 0 .4rem
        p
          margin 1rem 0 0 .3rem
          font-size 18px
      .appo-detail
        height 3.6rem
        width 100%
        font-size 15px
        box-shadow 0 4px 10px 0 rgba(0,0,0,0.05),0 2px 2px 0 rgba(0,0,0,0.05)
        div
          height 1.2rem
          width 100%
          display flex
          align-items center
          justify-content space-between
          label
            color $color-font-black
            padding-left .4rem
          p
            color $color-font-grey
            padding-right .4rem
    .set-btn
      margin 0 .3rem
      position absolute
      width 92%
      bottom .4rem
</style>
