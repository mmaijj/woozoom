<template>
  <div id="permiss-tran" v-show="visible">
    <div class="appoTeam">
      <div class="appo-header">
        <img src="../../common/img/manger/planPlayer@3x.png">
        <p>老司机植保</p>
      </div>
      <div class="appo-detail">
        <div class="detail-header">
          <span>选择新队长</span>
        </div>
        <div class="teamNum">
          <div class="team-num" v-for="(item, index) in teamNums" :key="index" :id="index + 1" @click="changeTeamtrans(index)">
            <img src="../../common/img/manger/planPlayer@3x.png">
            <label>{{item.name}}</label>
          </div>
        </div>
        <div class="set-btn" @click="hide">
          <cube-button
            :primary="true"
          >确定转让</cube-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
export default {
  name: 'permissTrans',
  mixins: [popupMixin],
  data () {
    return {
      teamNums: [
        {
          name: '阿拉善'
        },
        {
          name: '鄂尔多斯'
        }, {
          name: '巴彦淖尔'
        }, {
          name: '吉安'
        }, {
          name: '霍林郭勒'
        }
      ]
    }
  },
  created () {
  },
  methods: {
    changeTeamtrans (item) {
      const numId = item + 1
      document.getElementById(numId).className = 'red'
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #permiss-tran
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    .appoTeam
      height 100%
      .appo-header
        height 1.6rem
        display flex
        background-color $color-background-white
        align-items center
        color $color-font-black-new
        img
          height 60px
          width 60px
          margin-left .3rem
        p
          font-size 18px
          margin-left .2rem
          font-weight 500
      .appo-detail
        margin-top 6px
        height inherit
        background-color $color-background-white
        .detail-header
          color $color-font-black
          span
            display block
            padding-left .3rem
            padding-top .48rem
            font-size 18px
            font-weight 500
        .teamNum
          margin-left .6rem
          margin-top .28rem
          .team-num
            height 80px
            width 60px
            float left
            text-align center
            margin-right 1rem
            margin-top .2rem
            img
              height 50px
              width 50px
            label
              font-size 15px
              color $color-font-black
        .set-btn
          margin 0 .3rem
          position absolute
          width 92%
          bottom .4rem
        .red
          color red !important
</style>
