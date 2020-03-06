<template>
  <div id="uav-maintenance">
    <div class="uavMaintenance">
      <div class="mt_header">
        <div class="mt_title">
          <p>保养项目名称名称</p>
          <span>需自行保养</span>
        </div>
        <div class="mt_cycle">
          <img src="../../common/img/uavplan/mainCycle@3x.png">
          <span>每3个月</span>
        </div>
      </div>
      <div class="mt_content">
        <div class="last_mt">
          <div class="mt_lab">
            <img src="../../common/img/uavplan/lastMain@3x.png">
            <label>上次保养</label>
          </div>
          <div class="mt_det">
            <p>2019/08/05</p>
            <span></span>
            <p>125小时</p>
          </div>
        </div>
        <div class="last_mt">
          <div class="mt_lab">
            <img src="../../common/img/uavplan/theMain@3x.png">
            <label>本次保养不晚于</label>
          </div>
          <div class="mt_det">
            <p>2019/11/05</p>
            <span></span>
            <p>185小时</p>
          </div>
        </div>
      </div>
      <div class="mt_footer">
        <div class="more_mt">更多保养记录</div>
        <div class="the_mt">完成本次保养</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'uavMaintenance'
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #uav-maintenance
    height 100%
    width 100%
    background-color $color-background-grey
    overflow-y auto
    .uavMaintenance
      background-color $color-background-white
      padding 0 .3rem
      .mt_header
        .mt_title
          height .8rem
          display flex
          align-items center
          justify-content space-between
          p
            font-size 16px
            color $color-font-black-new
          span
            font-size 12px
            color $color-font-orange
        .mt_cycle
          display flex
          img
            width 12px
            height 14px
          span
            font-size 14px
            color $color-font-grey
            margin-left .14rem
      .mt_content
        margin-top .36rem
        background-color $color-background-grey-new
        .last_mt
          display flex
          position relative
          align-items center
          height .8rem
          div
            display flex
            align-items center
          .mt_lab
            padding-left .4rem
            img
              width 15px
              height 14px
            label
              font-size 12px
              color $color-font-grey
          .mt_det
            position absolute
            right .4rem
            span
              height 14px
              border 1px solid #C8C8C8
              margin 0 .16rem
            p
              font-size 12px
              color $color-font-black-new
      .mt_footer
        display flex
        justify-content flex-end
        padding-top .36rem
        padding-bottom .3rem
        div
          width 120px
          height 30px
          line-height 30px
          text-align center
          font-size 12px
          border-radius 22px
        .more_mt
          border 1px solid #C8C8C8
          margin-right .3rem
        .the_mt
          border 1px solid $color-bottom-active
</style>
