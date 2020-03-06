<template>
  <div id="bind-uav">
    <div class="bindHeader">
      <div v-for="(item, index) in searchList" :key="index" class="bindTitle" :class="{'selectActive':searchIndex===index}" @click="searchDetail(index)">
        <p>{{item}}</p>
      </div>
    </div>
    <div class="bindDetail">
      <cube-scroll
        ref="scroll"
        :data="uavlist"
        :options="options"
        v-show="isUav"
        @pulling-down="onPullingDown"
        @pulling-up="onPullingUp"
      >
      <div class="uavList" @click="bindRtk(item)" v-for="(item, index) in uavlist" :key="index">
        <span class="uavName">{{item.name}}</span>
        <span class="uavId">{{item.sn}}</span>
      </div>
      </cube-scroll>
      <div class="bindRtk" v-show="!isUav">
        <label>RTK设备Id</label>
        <cube-input
          :placeholder="setId"
          v-model="rtkId"
        ></cube-input>
        <div class="bindBtn" @click="bindRtk()">绑定</div>
      </div>
    </div>
    <bind-confirm v-show="bindUavCon" :uavName="uavName" :uavId="uavId" :qxNum="qxNum" @hide="hide"></bind-confirm>
  </div>
</template>

<script>
import BindConfirm from 'components/promptBox/bindConfirm'
const PAGE_SIZE = '10'
export default {
  name: 'bindUav',
  data () {
    return {
      searchList: ['绑定无人机', '绑定RTK'],
      searchIndex: 0,
      pageNo: 1,
      isLast: 0, // 是否最后一页0：不是 1：是
      setId: '请输入要绑定RTK的设备ID',
      rtkId: '',
      uavlist: [], // 无人机列表
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
      },
      qxId: '',
      onLine: navigator.onLine, // 当前网络状况
      bindUavCon: false,
      uavName: '', // 飞机名称
      uavId: '', // 飞机id
      qxNum: '', // 剩余绑定次数
      deviceId: '',
      typeId: '', // 0:机载rtk 1:一体化rtk
      isUav: true
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.qxNum = localStorage.getItem('qxNum')
    this.searchIndex = 0
    this.qxId = this.$route.query.qxId
    this.searchDetail(0)
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
    searchDetail (index) {
      this.uavlist = []
      this.bindUavCon = false
      this.searchIndex = index
      if (index === 0) {
        this.queryUavRtk()
      } else if (index === 1) {
        this.isUav = false
      }
    },
    /* 上拉加载 */
    onPullingUp () {
      if (this.isLast === 0) {
        setTimeout(() => {
          this.pageNo = this.pageNo + 1
          this.queryUavRtk()
        }, 1000)
      } else {
        this.$refs.scroll.forceUpdate()
      }
    },
    /* 下拉刷新 */
    onPullingDown () {
      this.pageNo = 1
      this.uavlist = []
      this.queryUavRtk()
    },
    /* 查询飞机列表（机载RTK） */
    queryUavRtk () {
      this.isUav = true
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
            this.uavlist.push.apply(this.uavlist, resultList)
          } else {
            this.$createDialog({
              type: 'alert',
              content: '请添加设备',
              icon: 'cubeic-alert'
            }).show()
          }
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
    bindRtk (item) {
      if (this.searchIndex === 0) {
        this.typeId = '0'
        if (item.sn !== undefined) {
          this.deviceId = item.sn
        }
        this.uavName = item.name
        this.uavId = item.sn
        this.bindUavCon = true
      } else if (this.searchIndex === 1) {
        this.typeId = '1'
        this.deviceId = this.rtkId
        this.goBind()
      }
    },
    /* 绑定 */
    goBind () {
      let searchParam = new URLSearchParams()
      searchParam.set('dsk', this.qxId)
      searchParam.set('deviceId', this.deviceId)
      searchParam.set('deviceType', '111111')
      searchParam.set('bindType', this.typeId)
      this.request({
        url: '/crops-platform/api/wxqianxun/bind',
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
            content: '绑定成功',
            icon: 'cubeic-alert',
            onConfirm: () => {
              this.$router.push('/QxList')
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
    hide (val) {
      this.bindUavCon = false
      if (val === '2') {
        this.goBind()
      }
    }
  },
  components: {
    BindConfirm
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #bind-uav
    height 100%
    width 100%
    background-color $color-background-grey
    overflow-y auto
    .bindHeader
      height .88rem
      display flex
      .bindTitle
        width 50%
        text-align center
        height .88rem
        line-height .88rem
        font-size 14px
        color $color-font-black-new
      .selectActive
        background-color $color-background-white
    .bindDetail
      height 100%
      width 100%
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
      .bindRtk
        height 2rem
        background-color $color-background-white
        position relative
        label
          display block
          color $color-font-black-new
          font-size 18px
          padding-left .3rem
          padding-top .5rem
        .bindBtn
          width 1.6rem
          height .6rem
          background-color $color-background-blue
          text-align center
          line-height .6rem
          color $color-font-white
          font-size 12px
          border-radius 24px
          position absolute
          right .4rem
          top .7rem
</style>
