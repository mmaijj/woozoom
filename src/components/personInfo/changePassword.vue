<template>
  <div id="name-info" v-show="visible">
    <cube-input
      v-model="oldPassword"
      v-show="isOld"
      :clearable="clearable"
      :placeholder="setOldPass"
      :autofocus="true"
    ></cube-input>
    <cube-input
      v-model="password"
      :clearable="clearable"
      :placeholder="setNewPass"
      v-show="!isOld"
    ></cube-input>
    <div class="set-btn" @click="nextStep" v-show="isOld">
      <cube-button
        :primary="true"
        :disabled="isDisO">下一步</cube-button>
    </div>
    <div class="set-btn" @click="hide" v-show="!isOld">
      <cube-button
        :primary="true"
        :disabled="isDis">{{btnText}}</cube-button>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
const EVENT_LEAVE = 'leave'
export default {
  name: 'changePassword',
  mixins: [popupMixin],
  data () {
    return {
      clearable: {
        visible: true,
        blurHidden: true
      },
      isDis: true,
      isDisO: true,
      oldPassword: '', // 旧密码
      isOld: true, // 是否输入旧密码
      setOldPass: '请输入旧密码',
      setNewPass: '请输入新密码',
      btnText: '确定',
      password: ''
    }
  },
  watch: {
    password: function (val) {
      const number = val
      if (number !== '') {
        this.isDis = false
      } else {
        this.isDis = true
      }
    },
    oldPassword: function (val) {
      const number = val
      if (number !== '') {
        this.isDisO = false
      } else {
        this.isDisO = true
      }
    }
  },
  mounted () {
  },
  methods: {
    /* 判断旧密码是否正确 */
    nextStep () {
      let oldPass = localStorage.getItem('userPassword')
      if (oldPass !== this.oldPassword) {
        this.$createDialog({
          type: 'alert',
          content: '请输入正确的旧密码',
          icon: 'cubeic-alert'
        }).show()
      } else {
        this.isOld = false
      }
    },
    hide () {
      this.$emit(EVENT_LEAVE, this.password)
      this.visible = false
      this.isOld = true
      this.password = ''
      this.oldPassword = ''
      localStorage.setItem('userPassword', this.password) // 记录用户密码
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
