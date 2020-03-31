<template>
    <div id="my-order" @click="hideMore" ref="myOrder">
      <div class="search-header">
        <div :class="userQx === '1' ? 'searchText':'searchTextN'">
          <cube-input
          ref="orderInput"
          :placeholder="searchText"
          v-model="orderName"
          @input="searchByName"
          >
            <template v-slot:prepend>
              <div class="cubeic-search ml12"></div>
            </template>
          </cube-input>
        </div>
        <div :class="myCreate" @click="searchMyCreate" v-if="userQx === '1'">我创建的</div>
      </div>
      <div class="orderList">
        <cube-scroll
          ref="scroll"
          :data="orderList"
          :options="options"
          @pulling-down="onPullingDown"
          @pulling-up="onPullingUp"
        >
          <div v-for="(item, index) in orderList" :key="index" class="orderContent" @click="goOrderDetail(item)">
            <div class="orderTitle">
              <label>{{item.orderName}}</label>
            </div>
            <div class="createTime">
              <img src="../../common/img/manger/planPlayer@3x.png">
              <div>
                <p>{{item.user.name}}</p>创建于<p>{{item.createDate}}</p>
              </div>
            </div>
            <div class="moreBtn">
              <div class="moreCz" @click.stop="showMore(index)" v-if="userQx === '1'"></div>
            </div>
            <div :class="item.otherSty ==='1' ? 'moreTextN':'moreText'" :id="index + 1" v-show="activeIndex === index">
              <ul>
                <li @click.stop="shareOrder(item)">分享订单</li>
                <li @click.stop="changeName(item)">重命名</li>
                <li @click.stop="delOrder(item)">删除</li>
              </ul>
            </div>
          </div>
        </cube-scroll>
      </div>
      <div class="backIndex" @click="goBack">返回首页</div>
      <span class="addOrder" @click="addOrder" v-if="userQx === '1'">
      </span>
    </div>
</template>

<script>
export default {
  name: 'orderList',
  data () {
    return {
      searchText: '搜索订单',
      activeIndex: '',
      pageNo: 1, // 当前页数
      pageSize: 10, // 每页个数
      isMeFlag: 0, // 是否我创建的
      orderName: '', // 订单名称
      myCreate: 'myCreate',
      isLast: 0, // 是否最后一页0：不是 1：是
      userQx: '', // 用户权限
      prompt: {
        value: '',
        placeholder: '给你的订单起个名字吧'
      },
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
      userId: '', // 登录的用户id
      onLine: navigator.onLine, // 当前网络状况
      orderList: [] // 订单列表
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.userQx = localStorage.getItem('userQx') // 0：未加入植保队 1:队长  2：队员
    this.userId = localStorage.getItem('userId') // 登录用户id
    this.searchOrder()
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
    /* 创建订单 */
    addOrder () {
      this.$router.push('CreateOrder')
    },
    /* 根据名字查询 */
    searchByName () {
      this.pageNo = 1
      this.orderList = []
      this.$refs.scroll.scrollTo(0, 0)
      this.searchOrder()
    },
    /* 我创建的订单 */
    searchMyCreate () {
      this.orderList = []
      let className = this.myCreate
      if (className === 'myCreate') {
        this.pageNo = 1
        this.myCreate = 'myCreateActive'
        this.isMeFlag = 1
        this.searchOrder()
      } else {
        this.pageNo = 1
        this.myCreate = 'myCreate'
        this.isMeFlag = 0
        this.searchOrder()
      }
    },
    /* 获取订单列表 */
    searchOrder () {
      let searchParams = new URLSearchParams()
      searchParams.set('isMeFlag', this.isMeFlag)
      searchParams.set('pageNo', this.pageNo)
      searchParams.set('pageSize', this.pageSize)
      searchParams.set('name', this.orderName)
      this.request({
        url: '/crops-platform/api/order_v3/list',
        method: 'get',
        params: searchParams,
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
            this.orderList.push.apply(this.orderList, result.list)
          } else {
            this.orderList = []
          }
          for (let i = 0; i < this.orderList.length; i++) {
            if (i > 1) {
              if (i === this.orderList.length - 1 || i === this.orderList.length - 2) {
                this.orderList[i].otherSty = '1'
              } else {
                this.orderList[i].otherSty = '0'
              }
            } else {
              this.orderList[i].otherSty = '0'
            }
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
    showMore (index) {
      this.$refs.orderInput.blur()
      if (this.activeIndex !== '') {
        this.activeIndex = ''
      } else {
        this.activeIndex = index
      }
    },
    /* 点击其他地方隐藏更多按钮 */
    hideMore () {
      this.activeIndex = ''
    },
    /* 上拉加载 */
    onPullingUp () {
      if (this.isLast === 0) {
        setTimeout(() => {
          this.pageNo = this.pageNo + 1
          this.searchOrder()
        }, 1000)
      } else {
        this.$refs.scroll.forceUpdate()
      }
    },
    /* 下拉刷新 */
    onPullingDown () {
      this.pageNo = 1
      this.orderList = []
      this.searchOrder()
    },
    /* 查看订单详情 */
    goOrderDetail (item) {
      this.$refs.orderInput.blur()
      let orderData = item
      localStorage.setItem('createId', item.user.id)
      sessionStorage.setItem('orderContent', JSON.stringify(orderData))
      this.$router.push('/OrderDetail')
    },
    /* 修改订单名称 */
    changeName (item) {
      this.$refs.orderInput.blur()
      let createId = item.user.id
      if (this.userId !== createId) {
        this.$createDialog({
          type: 'alert',
          content: '只有订单创建者能够重命名该订单',
          icon: 'cubeic-alert'
        }).show()
      } else {
        let orderName = item.orderName
        let orderId = item.id
        this.orderComp = this.orderComp || this.$createOrderName({
          $props: {
            ordername: orderName,
            orderId: orderId
          },
          $events: {
            leave: (val) => {
              this.activeIndex = ''
              this.changeOrderName(val)
            }
          }
        })
        this.orderComp.show()
      }
    },
    changeOrderName (val) {
      let newName = val.name
      let thisId = val.id
      let changeParams = new URLSearchParams()
      changeParams.set('orderId', thisId)
      changeParams.set('name', newName)
      this.request({
        url: '/crops-platform/api/order_v3/updateOrderName',
        method: 'get',
        params: changeParams,
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
            content: '更改成功',
            icon: 'cubeic-alert',
            onConfirm: () => {
              this.activeIndex = ''
              this.orderList = []
              this.searchOrder()
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
    /* 分享订单 */
    shareOrder (item) {
      let orderDetail = {}
      orderDetail.orderName = item.orderName
      orderDetail.createTime = item.createDate
      orderDetail.userName = item.user.name
      orderDetail.orderId = item.id
      sessionStorage.setItem('orderDetail', JSON.stringify(orderDetail))
      this.$router.push('/ShareOrder')
    },
    /* 删除订单 */
    delOrder (item) {
      let createId = item.user.id
      if (this.userId !== createId) {
        this.$createDialog({
          type: 'alert',
          content: '只有订单创建者能够删除该订单',
          icon: 'cubeic-alert'
        }).show()
      } else {
        this.$createDialog({
          type: 'confirm',
          icon: 'cubeic-alert',
          content: '确定删除订单？',
          confirmBtn: {
            text: '确定'
          },
          cancelBtn: {
            text: '取消'
          },
          onConfirm: () => {
            let thisId = item.id
            let delParams = new URLSearchParams()
            delParams.set('orderId', thisId)
            this.request({
              url: '/crops-platform/api/order_v3/delOrder',
              method: 'get',
              params: delParams,
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
                  content: '删除成功',
                  icon: 'cubeic-alert',
                  onConfirm: () => {
                    this.activeIndex = ''
                    this.orderList = []
                    this.searchOrder()
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
  #my-order
    height 100%
    width 100%
    background-color $color-background-grey
    overflow-y auto
    /*.cube-input-field*/
    /*  color red*/
    .search-header
      height 1rem
      margin 0 .3rem
      display flex
      align-items center
      position relative
      .searchText
        width 4.8rem
      .searchTextN
        width 100%
      .myCreate
        width 1.6rem
        height .6rem
        background-color #E6E6E9
        border-radius 15px
        line-height .6rem
        text-align center
        font-size 12px
        color #8C8C91
        position absolute
        right 0
      .myCreateActive
        width 1.6rem
        height .6rem
        border-radius 15px
        line-height .6rem
        text-align center
        font-size 12px
        color #ffffff
        position absolute
        right 0
        background-color #4388FF
    .orderList
      height 90%
      margin 0 .3rem
      .orderContent
        height 1.8rem
        background-color $color-background-white
        margin-top .2rem
        padding 0 .3rem
        border-radius 6px
        position relative
        .orderTitle
          padding-top .2rem
          font-size 16px
          color $color-font-black-new
        .createTime
          display flex
          height .48rem
          align-items center
          position absolute
          bottom .2rem
          img
            height 24px
            width 24px
          div
            display flex
            align-items center
            font-size 12px
            color $color-font-grey
            margin-left .12
        .moreBtn
          height 60px
          width 80px
          position absolute
          right .3rem
          display flex
          align-items center
          justify-content center
        .moreCz
          height 20px
          width 20px
          background url("../../common/img/eppoteam/moreIcon@3x.png") center center no-repeat
          background-size contain
    .addOrder
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
    .moreText
      position absolute
      top 1.2rem
      right .3rem
      z-index 10
      ul
        background-color $color-background-white
        box-shadow 0px 2px 20px 0px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.1)
        border-radius 6px
        width 3.6rem
        li
          height 1.2rem
          line-height 1.2rem
          width 3.6rem
          text-align center
          font-size 16px
          color $color-font-black-new
    .moreTextN
      position absolute
      top -3rem
      right .3rem
      z-index 10
      ul
        background-color $color-background-white
        box-shadow 0px 2px 20px 0px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.1)
        border-radius 6px
        width 3.6rem
        li
          height 1.2rem
          line-height 1.2rem
          width 3.6rem
          text-align center
          font-size 16px
          color $color-font-black-new
</style>
