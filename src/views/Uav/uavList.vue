<template>
  <div id="uav-list">
    <cube-scroll
      ref="scroll"
      :data="uavlist"
      :options="options"
      @pulling-down="onPullingDown"
      @pulling-up="onPullingUp"
    >
      <div  v-for="(item, index) in uavlist" :key="index" class="uavList" :class="item.class" @click="goDetail(item)">
        <span class="uavName">{{item.name}}</span>
        <span class="uavId">{{item.sn}}</span>
        <span class="uavIcon"></span>
      </div>
    </cube-scroll>
    <span class="addUav" @click="addEquipment">
    </span>
  </div>
</template>

<script>
const PAGE_SIZE = '10'
export default {
  name: 'uavList',
  data () {
    return {
      uavlist: [],
      pageNo: 1,
      isLast: 0, // 是否最后一页0：不是 1：是
      onLine: navigator.onLine, // 当前网络状况
      options: {
        pullDownRefresh: {
          threshold: 60,
          stop: 60,
          txt: '更新成功'
        },
        pullUpLoad: {
          threshold: 60,
          stop: 60,
          txt: '加载成功'
        }
      }
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.getUavList()
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
    getUavList () {
      let searchParam = new URLSearchParams()
      searchParam.set('pageNo', this.pageNo)
      searchParam.set('pageSize', PAGE_SIZE)
      this.request({
        url: '/crops-platform/api/uav_v3/list',
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
          this.isLast = response.data.data.lastPageInt
          if (response.data.data.count !== 0) {
            let result = response.data.data
            let resultList = result.list
            for (let i = 0; i < resultList.length; i++) {
              if (resultList[i].isRecycleBin === '0') {
                resultList[i].class = 'uavlist'
              } else {
                resultList[i].class = 'uavRecycle'
              }
            }
            this.uavlist.push.apply(this.uavlist, resultList)
          } else {
            this.$createDialog({
              type: 'alert',
              content: '请添加设备',
              icon: 'cubeic-alert'
            }).show()
          }
        } else if (code === 5003 || code === 5000) {
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
    /* 上拉加载 */
    onPullingUp () {
      if (this.isLast === 0) {
        setTimeout(() => {
          this.pageNo = this.pageNo + 1
          this.getUavList()
        }, 1000)
      } else {
        this.$refs.scroll.forceUpdate()
      }
    },
    /* 下拉刷新 */
    onPullingDown () {
      this.pageNo = 1
      this.uavlist = []
      this.getUavList()
    },

    addEquipment () {
      this.addEquipComp = this.addEquipComp || this.$createAddEquipment({
        $events: {
          leave: () => {
            this.pageNo = 1
            this.uavlist = []
            this.getUavList()
          }
        }
      })
      this.addEquipComp.show()
    },
    goDetail (item) {
      let uavSn = item.sn
      let isRecycle = item.isRecycleBin
      if (isRecycle === '0') {
        this.$router.push({ path: '/UavDetail', query: { snId: uavSn } })
      } else {
        this.$router.push({ path: '/UavRecycleDetail', query: { snId: uavSn } })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #uav-list
    height 100%
    width 100%
    overflow-y auto
    background-color $color-background-grey
    .uavList
      height 1.9rem
      background-color $color-background-white
      margin .16rem .3rem 0 .3rem
      border-radius 6px
      box-shadow 0px 4px 10px 0px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.05)
      position relative
    span
      display block
    .uavName
      font-size 16px
      font-weight 500
      padding-top .28rem
      padding-left .4rem
    .uavId
      font-size 12px
      padding-top .66rem
      padding-left .4rem
    .uavlist
      .uavName
        color $color-font-black-new
      .uavId
        color $color-font-grey
      .uavIcon
        height 36px
        width 36px
        background url("../../common/img/uavplan/uavPlan@3x.png") center center no-repeat
        background-size contain
        position absolute
        right .4rem
        bottom .7rem
    .uavRecycle
      .uavName
        color $color-font-disabled
      .uavId
        color $color-font-disabled
      .uavIcon
        height 56px
        width 68px
        background url("../../common/img/uavplan/del_icon@3x.png") center center no-repeat
        background-size contain
        position absolute
        right 0
        bottom 0
    .addUav
        height 48px
        width 48px
        background url("../../common/img/uavplan/add_icon@3x.png") center center no-repeat
        background-size contain
        position fixed
        bottom .4rem
        right .3rem
        z-index 99
</style>
