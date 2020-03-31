<template>
    <div id="qx-list">
      <div class="qx_account" v-for="(item, index) in accountList" :key="index">
        <div :class="[item.validDate >= nowDate?'qx_header':'qx_header_sx']">
          <p class="qxcode">{{item.accountId}}</p>
          <span class="qxtime">有效期至：<p>{{item.validDate}}</p></span>
          <span class="ybd">本年剩余绑定次数<p>{{item.bindCount}}</p>次</span>
        </div>
        <div class="qx_footer" v-if="item.validDate >= nowDate">
          <div class="bindUav" v-if="item.deviceId === '' || item.deviceId === '0'" @click="goBind(item)">
            <img src="../../common/img/qxaccount/bind_icon@3x.png">
            <p>绑定设备</p>
          </div>
          <div class="ubindUav" v-if="item.deviceId !== '' && item.deviceId !== '0'">
            <img src="../../common/img/uavplan/uavPlan@3x.png" v-if="item.bindTypeN === '1' || item.bindTypeN === '3'">
            <img src="../../common/img/qxaccount/rtkActive@3x.png" v-if="item.bindTypeN === '0'">
            <img src="../../common/img/qxaccount/jzRtk.png" v-if="item.bindTypeN === '4'">
            <p v-if="item.uavSn === ''"><label>{{item.rtkTypeN}}</label>：{{item.deviceId}}</p>
            <p v-if="item.bindType !== '1'">{{item.uavName}}<label v-if="item.bindTypeN === '3'">(非自己所属)</label></p>
            <div @click="ubind(item)">解绑设备</div>
          </div>
        </div>
      </div>
      <div class="backIndex" @click="goBack">返回首页</div>
      <span class="addUav" @click="addAccount">
      </span>
    </div>
</template>

<script>
import countDown from 'common/mixins/common'
const PAGE_SIZE = '10'
export default {
  name: 'qxList',
  mixins: [countDown],
  data () {
    return {
      pageNo: 1,
      hasUav: false,
      qxBg: 'qx_header', // 是否有效
      bindType: '', // 0: 一体化rtk 1：机载rtk与飞机 2：机载rtk 3: 不是自己的飞机
      nowDate: '', // 当前日期
      userId: '',
      rtkType: '',
      showImg: '',
      onLine: navigator.onLine, // 当前网络状况
      accountList: [] // 千寻账号
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.userId = localStorage.getItem('userId')
    this.getQxList()
  },
  methods: {
    /* 网络状况 */
    updateOnlineStatus (e) {
      const { type } = e
      this.onLine = type === 'online' // true:网络状况良好 false:当前没有网络
      if (!this.onLine) {
        this.$createDialog({
          type: 'alert',
          content: '请检查当前网络状况',
          icon: 'cubeic-alert'
        }).show()
      }
    },
    /* 获取千寻账号列表 */
    getQxList () {
      this.nowDate = this.formatDate((new Date()).getTime())
      let searchParam = new URLSearchParams()
      searchParam.set('pageNo', this.pageNo)
      searchParam.set('pageSize', PAGE_SIZE)
      this.request({
        url: '/crops-platform/api/wxqianxun/list',
        method: 'get',
        params: searchParam,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.accountList = response.data.data.list
          for (let i = 0; i < this.accountList.length; i++) {
            if (this.accountList[i].validDate !== '') {
              this.accountList[i].validDate = this.formatDate(this.accountList[i].validDate)
            }
            if (this.accountList[i].uavSn !== '') {
              if (this.userId === this.accountList[i].uavOwner) {
                this.accountList[i].bindTypeN = '1'
              } else {
                this.accountList[i].bindTypeN = '3'
              }
              this.accountList[i].rtkTypeN = ''
            } else {
              if (this.accountList[i].bindType === '0') {
                this.accountList[i].bindTypeN = '2'
                this.accountList[i].rtkTypeN = '机载RTK模块'
              } else {
                this.accountList[i].bindTypeN = '0'
                this.accountList[i].rtkTypeN = '一体化RTK'
              }
            }
          }
          console.log(this.accountList)
        } else if (code === 5003) {
          this.$createDialog({
            type: 'alert',
            content: '系统异常，请重新登录',
            icon: 'cubeic-alert',
            onConfirm: () => {
              localStorage.removeItem('userToken')
              this.$router.push({ path: '/UserLogin', query: { 'flag': '1' } })
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
    /* 添加千寻账号 */
    addAccount () {
      this.addQxComp = this.addQxComp || this.$createAddAccount({
        $events: {
          leave: () => {
            this.getQxList()
          }
        }
      })
      this.addQxComp.show()
    },
    /* 绑定设备 */
    goBind (item) {
      let qxAccount = item.accountId
      localStorage.setItem('qxNum', item.bindCount)
      this.$router.push({ path: '/QxBind', query: { 'qxId': qxAccount } })
    },
    /* 解绑设备 */
    ubind (item) {
      let count = item.bindCount
      if (count === 0) {
        this.$createDialog({
          type: 'alert',
          content: '千寻绑定次数已达20次上限，无法解绑',
          icon: 'cubeic-alert'
        }).show()
      } else {
        if (item.online !== undefined) {
          let isOnline = item.online
          if (isOnline === '1') {
            this.$createDialog({
              type: 'alert',
              content: '设备在线，解绑需先关闭设备电源。',
              icon: 'cubeic-alert'
            }).show()
          } else {
            this.$createDialog({
              type: 'confirm',
              content: '解绑会导致设备定位出现偏移，进行此操作请先确认设备电源关闭。',
              icon: 'cubeic-alert',
              onConfirm: () => {
                let searchParam = new URLSearchParams()
                searchParam.set('dsk', item.accountId)
                searchParam.set('deviceId', item.deviceId)
                searchParam.set('deviceType', '111111')
                this.request({
                  url: '/crops-platform/api/wxqianxun/unbind',
                  method: 'post',
                  params: searchParam,
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
                      content: '解绑成功',
                      icon: 'cubeic-alert',
                      onConfirm: () => {
                        this.getQxList()
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
              }
            }).show()
          }
        } else {
          this.$createDialog({
            type: 'confirm',
            content: '解绑会导致设备定位出现偏移，进行此操作请先确认设备电源关闭。',
            icon: 'cubeic-alert',
            onConfirm: () => {
              let searchParam = new URLSearchParams()
              searchParam.set('dsk', item.accountId)
              searchParam.set('deviceId', item.deviceId)
              searchParam.set('deviceType', '111111')
              this.request({
                url: '/crops-platform/api/wxqianxun/unbind',
                method: 'post',
                params: searchParam,
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
                    content: '解绑成功',
                    icon: 'cubeic-alert',
                    onConfirm: () => {
                      this.getQxList()
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
            }
          }).show()
        }
      }
    },
    /* 返回首页 */
    goBack () {
      this.$router.push('/index')
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #qx-list
    height 100%
    width 100%
    background-color $color-background-grey
    overflow-y auto
    .qx_account
      margin 0 .3rem
      padding-top .3rem
      .qx_header
        width 100%
        height 2.4rem
        border-radius 20px 20px 0 0
        background url("../../common/img/qxaccount/qx_bg@3x.png") center center no-repeat
        background-size cover
        position relative
        .qxcode
          position absolute
          top 1.05rem
          left .5rem
          color $color-font-white
          font-size 16px
        .qxtime
          display flex
          position absolute
          bottom .12rem
          left .3rem
          color $color-font-white
          font-size 12px
        .ybd
          display flex
          justify-content center
          position absolute
          bottom 0
          right 0
          width 2.7rem
          height .48rem
          line-height .48rem
          background linear-gradient(134deg,rgba(5,153,246,1) 0%,rgba(4,91,222,1) 100%)
          border-radius 4px 4px 0px 4px
          color $color-font-white
          font-size 12px
      .qx_header_sx
        width 100%
        height 2.4rem
        border-radius 20px 20px 0 0
        background url("../../common/img/qxaccount/sx_bg@3x.png") center center no-repeat
        background-size cover
        position relative
        .qxcode
          position absolute
          top 1.05rem
          left .5rem
          color $color-font-white
          font-size 16px
        .qxtime
          display flex
          position absolute
          bottom .12rem
          left .3rem
          color $color-font-white
          font-size 12px
        .ybd
          display flex
          justify-content center
          position absolute
          bottom 0
          right 0
          width 2.4rem
          height .48rem
          line-height .48rem
          background linear-gradient(134deg,rgba(5,153,246,1) 0%,rgba(4,91,222,1) 100%)
          border-radius 4px 4px 0px 4px
          color $color-font-white
          font-size 12px
    .qx_footer
      height 1rem
      background-color $color-background-white
      box-shadow 0px 4px 10px 0px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.05)
      border-radius 0px 0px 20px 20px
      .bindUav
        display flex
        height inherit
        align-items center
        justify-content center
        img
          height .5rem
          width .5rem
        p
          font-size 14px
          color #969696
          margin-left .08rem
      .ubindUav
        display flex
        height inherit
        align-items center
        position relative
        img
          height .5rem
          width .5rem
          margin-left .3rem
        p
          color $color-font-black-new
          font-size 12px
          margin-left .2rem
        div
          width 1.8rem
          height .6rem
          line-height .6rem
          text-align center
          font-size 12px
          color $color-font-grey
          border 1px solid #969696
          border-radius 24px
          position absolute
          right .3rem
    .addUav
      height 48px
      width 48px
      background url("../../common/img/uavplan/add_icon@3x.png") center center no-repeat
      background-size contain
      position fixed
      bottom .4rem
      right .3rem
      z-index 99
    .backIndex
      height 36px
      line-height 36px
      width 72px
      color #ffffff
      background-color #000000
      opacity 0.7
      position fixed
      top 1.2rem
      right 0
      border-radius 6px 0 0 6px
      z-index 99
      font-size 14px
      text-align center
</style>
