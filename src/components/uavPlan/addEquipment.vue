<template>
  <div id="addUav" v-show="visible">
    <div class="set_id">
      <label>设备ID</label>
      <cube-input
        :placeholder="setId"
        v-model="uavId"
      ></cube-input>
    </div>
    <div class="set_code">
      <label>设备激活码</label>
      <cube-input
        :placeholder="setCode"
        v-model="uavCode"
      ></cube-input>
    </div>
    <span class="code_tip">激活码可从销售人员或前一位设备所有者处获取</span>
    <div class="set-btn" @click="addEquipment">
      <cube-button
        :primary="true"
        :disabled="isDis">激活设备</cube-button>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
const LEAVE_EVENT = 'leave'
export default {
  name: 'addEquipment',
  mixins: [popupMixin],
  data () {
    return {
      setId: '请手动输入设备ID',
      setCode: '请输入设备激活码',
      uavId: '',
      uavCode: ''
    }
  },
  computed: {
    isDis () {
      let isDisabled = true
      if (this.uavId !== '' && this.uavCode !== '') {
        isDisabled = false
      } else {
        isDisabled = true
      }
      return isDisabled
    }
  },
  methods: {
    /* 添加设备 */
    addEquipment () {
      let addParams = new URLSearchParams()
      addParams.set('sn', this.uavId)
      addParams.set('code', this.uavCode)
      this.request({
        url: '/crops-platform/api/uav_v3/bindUav',
        method: 'get',
        params: addParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
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
      this.visible = false
      this.$emit(LEAVE_EVENT)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #addUav
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
