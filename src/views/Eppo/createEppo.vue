<template>
  <div id="create-eppo">
    <div class="maskLayer"></div>
    <div class="maskContent">
      <div class="createHeader">
        创建植保队
      </div>
      <div style="padding: 0 .3rem;">
        <cube-input
          v-model="eppoName"
          :placeholder="setArea"
          :autofocus="true"
          @blur.prevent="changeBlur()"
        ></cube-input>
      </div>
      <div class="createFooter">
        <div class="cancelBtn" @click="hidePage(0)">取消</div>
        <div class="submitBtn" @click="hidePage(1)">提交</div>
      </div>
    </div>
  </div>
</template>

<script>
const HIDE = 'hide'
export default {
  name: 'createEppo',
  props: {
  },
  data () {
    return {
      setArea: '给你的植保队起个名字吧',
      eppoName: '' // 植保队名称
    }
  },
  created () {
  },
  watch: {
  },
  methods: {
    changeBlur () {
      this.$emit('changeBlur')
    },
    hidePage (val) {
      debugger
      let eppoName = ''
      if (val === 1) {
        if (this.eppoName !== '') {
          if (this.eppoName.length > 15) {
            this.errtoast = this.errtoast || this.$createToast({
              txt: '植保队名称过长',
              type: 'txt',
              time: 2000
            })
            this.errtoast.show()
          } else {
            eppoName = this.eppoName
            this.$emit(HIDE, eppoName)
            this.eppoName = ''
          }
        } else {
          this.errtoast = this.errtoast || this.$createToast({
            txt: '请输入植保队名称',
            type: 'txt',
            time: 2000
          })
          this.errtoast.show()
        }
      } else {
        this.eppoName = ''
        this.$emit(HIDE, eppoName)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #create-eppo
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    .maskLayer
      height 100%
      width 100%
      background-color $color-background-black
      opacity .4
      z-index 99
    .maskContent
      position absolute
      top 50%
      left 50%
      transform: translate(-50%, -50%);
      background-color $color-background-white
      border-radius 6px
      width 6.6rem
      .cube-input
        margin-top 20px
        height 50px
      /*padding-right: 1.5rem;*/
      .cube-input::after
        border none
        border-bottom 1px solid $color-bottom-line
      .cube-input_active::after
        border-color $color-bottom-active
      .createHeader
        height 1.4rem
        line-height 1.4rem
        font-size 20px
        color $color-font-black-new
        padding-left .5rem
      .createFooter
        height 1.2rem
        display flex
        align-items center
        justify-content flex-end
        font-size 18px
        .cancelBtn
          color $color-font-grey
          margin-right .96rem
        .submitBtn
          color $color-font-blue
          margin-right .5rem
</style>
