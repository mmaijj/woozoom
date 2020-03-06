<template>
  <div id="eppo-appro" v-show="visible">
    <div class="main-info">
      <div class="verCenter">
        <label>公司名称</label>
        <cube-input
          v-model="companyName"
          :placeholder="notFill"
        ></cube-input>
      </div>
      <div class="verCenter">
        <label>法定代表人</label>
        <cube-input
          v-model="representative"
          :placeholder="notFill"
        ></cube-input>
      </div>
      <div class="verCenter">
        <label>执照代码</label>
        <cube-input
          v-model="licenseCode"
          :placeholder="notFill"
        ></cube-input>
      </div>
    </div>
    <div class="uploadImg">
      <label>营业执照照片</label>
      <div class="imgShow">
      </div>
      <div class="set-btn" @click="hide">
        <cube-button
          :primary="true"
        >提交</cube-button>
      </div>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
export default {
  name: 'eppoAppro',
  mixins: [popupMixin],
  data () {
    return {
      notFill: '未填写',
      companyName: '',
      representative: '',
      licenseCode: ''
    }
  },
  methods: {
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #eppo-appro
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    label
      font-size 15px
      font-weight 600
      color $color-font-black-new
      margin-left: .3rem
      width 40%
    .cube-input
      height 1.2rem
      color $color-font-black-new
      font-size 15px
    .cube-input::after
      border none
    .cube-input_active::after
      border-color transparent
    .main-info
      background-color $color-background-white
      .verCenter
        display flex
        align-items center
        height 1.2rem
    .uploadImg
      margin-top 6px
      background-color $color-background-white
      height inherit
      label
        height 1.2rem
        line-height 1.2rem
      .imgShow
        width 4.8rem
        height 3.4rem
        background-color $color-background-grey
        margin-top 2px
        margin-left .3rem
    .set-btn
      margin 0 .3rem
      position absolute
      width 92%
      bottom .4rem
</style>
