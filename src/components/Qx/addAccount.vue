<template>
  <div id="addAccount" v-show="visible">
    <div class="set_id">
      <label>千寻账号ID</label>
      <cube-input
        :placeholder="setId"
        v-model="qxId"
      ></cube-input>
    </div>
    <div class="set_code">
      <label>千寻密码</label>
      <cube-input
        :placeholder="setCode"
        v-model="qxCode"
      ></cube-input>
    </div>
    <div class="set-btn" @click="addAccount">
      <cube-button
        :primary="true"
        :disabled="isDis">激活账号</cube-button>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
const LEAVE_EVENT = 'leave'
export default {
  name: 'addAccount',
  mixins: [popupMixin],
  data () {
    return {
      setId: '请输入千寻账号ID',
      setCode: '请输入千寻密码',
      qxId: '',
      qxCode: ''
    }
  },
  computed: {
    isDis () {
      let isDisabled = true
      if (this.qxId !== '' && this.qxCode !== '') {
        isDisabled = false
      } else {
        isDisabled = true
      }
      return isDisabled
    }
  },
  methods: {
    /* 添加设备 */
    addAccount () {
      let addParams = new URLSearchParams()
      addParams.set('qxAccount', this.qxId)
      addParams.set('code', this.qxCode)
      this.request({
        url: '/crops-platform/api/wxqianxun/active',
        method: 'post',
        params: addParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        let { code, reasonPhrase } = res
        let msg = ''
        if (response.data.data !== undefined) {
          msg = response.data.data.msg
          reasonPhrase = msg
        }
        // let msg = response.data.data.msg
        // eslint-disable-next-line no-unused-vars
        // if (msg !== undefined) {
        //   reasonPhrase = msg
        // }
        if (code === 0) {
          this.$createDialog({
            type: 'alert',
            content: '激活成功',
            icon: 'cubeic-alert',
            onConfirm: () => {
              this.hide()
            }
          }).show()
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    hide () {
      this.qxId = ''
      this.qxCode = ''
      this.visible = false
      this.$emit(LEAVE_EVENT)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #addAccount
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    .set_id
      background-color $color-background-white
      height 2rem
      label
        display block
        color $color-font-black-new
        font-size 18px
        padding-left .3rem
        padding-top .5rem
    .set_code
      background-color $color-background-white
      height 2rem
      margin-top 0.12rem
      label
        display block
        color $color-font-black-new
        font-size 18px
        padding-left .3rem
        padding-top .5rem
    .code_tip
      display block
      color $color-font-disabled
      font-size 12px
      margin-top .24rem
      margin-left .3rem
    .set-btn
      margin 0 .3rem
      position absolute
      width 92%
      bottom .4rem
</style>
