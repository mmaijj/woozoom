<template>
    <div id="add-task">
      <div class="searchHeader">
        <cube-input
          :placeholder="searchText"
          v-model="taskName"
          :clearable="clearable"
          @input="searchTaskByName"
        >
          <template v-slot:prepend>
            <div class="cubeic-search ml12"></div>
          </template>
        </cube-input>
      </div>
      <div class="checkTask">
        <cube-scroll
          ref="scroll"
          :data="taskList"
          :options="options"
          @pulling-down="onPullingDown"
          @pulling-up="onPullingUp"
        >
          <div class="taskList" v-for="(item, index) in taskList" :key="index">
            <div class="taskDetail">
              <p>{{item.taskName}}</p>
              <div class="titleBot">
                <div>
                  <label class="cubeic-aim"></label>
                  <span v-if="item.land !== undefined">{{item.land.position}}</span>
                </div>
                <div class="creatTime">
                  <label class="cubeic-calendar"></label>
                  <span>{{item.createDate}}</span>
                </div>
              </div>
              <div class="taskContent">
                <div>
                  <img src="../../common/img/order/createIcon@3x.png">
                  <span>{{item.createUserName}}</span>
                </div>
                <div>
                  <img src="../../common/img/order/areaIcon@3x.png">
                  <span>{{item.acre}}亩</span>
                </div>
                <div>
                  <img src="../../common/img/order/percentIcon@3x.png">
                  <span v-if="item.percent !== undefined">{{item.percent}}%</span>
                  <span v-if="item.percent === undefined">0%</span>
                </div>
              </div>
            </div>
            <div :class="[item.check === false?'noChoose':'chooseTask']" @click="chooseTask(index)"></div>
          </div>
        </cube-scroll>
      </div>
      <div class="checkBtn">
        <img :src="iconClass">
        <p>已选{{checkedTask}}任务</p>
        <div :class="btnClass" @click="dealTask">{{checkTxt}}</div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'addTask',
  data () {
    return {
      clearable: true,
      taskList: [],
      pageNo: 1, // 当前页数
      pageSize: 10, // 每页个数
      isLast: 0, // 是否最后一页0：不是 1：是
      checked: true,
      checkTxt: '添加',
      checkedTask: 0,
      searchText: '搜索任务',
      btnClass: 'addBtn',
      canDeal: true, // 是否能删除任务（true：能 false：不能）
      iconClass: require('../../common/img/order/rectIcon@3x.png'),
      option: {
        label: '',
        value: '',
        disabled: false
      }, // 多选框配置
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
      orderId: '', // 订单id
      taskName: '', // 任务名称
      userId: '', // 用户id
      userQx: '', // 用户权限
      onLine: navigator.onLine, // 当前网络状况
      createId: '', // 订单创建者id
      teamId: '' // 植保队id
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    // let order = JSON.parse(sessionStorage.getItem('orderContent'))
    // if (order !== '') {
    //   this.orderId = order.id
    // }
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.userId = localStorage.getItem('userId') // 当前用户id
    this.teamId = localStorage.getItem('teamId')
    this.userQx = localStorage.getItem('userQx')
    this.orderId = this.$route.query.orderId
    this.createId = localStorage.getItem('createId')
    this.searchTask()
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
    /* 选择任务 */
    chooseTask (index) {
      this.canDeal = true
      let check = this.taskList[index].check
      let checkNum = 0
      if (check === true) {
        this.taskList[index].check = false
      } else {
        this.taskList[index].check = true
      }
      for (let i = 0; i < this.taskList.length; i++) {
        if (this.taskList[i].check === true) {
          checkNum++
        }
      }
      this.checkedTask = checkNum
      this.$forceUpdate()
    },
    /* 模糊查询任务列表 */
    searchTaskByName () {
      this.pageNo = 1
      this.taskList = []
      this.searchTask()
    },
    /* 查询任务列表 */
    searchTask () {
      let searchParams = new URLSearchParams()
      // searchParams.set('orderId', this.orderId)
      searchParams.set('isMeFlag', 1)
      searchParams.set('orderByFlag', '1')
      searchParams.set('startTime', '2000-12-12')
      searchParams.set('endTime', '2022-11-27')
      searchParams.set('pageNo', this.pageNo)
      searchParams.set('pageSize', this.pageSize)
      searchParams.set('name', this.taskName)
      this.request({
        url: '/crops-platform/api/task_v3/list',
        method: 'post',
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
            this.taskList.push.apply(this.taskList, result.list)
            if (this.taskList.length > 0) {
              for (let i = 0; i < this.taskList.length; i++) {
                this.taskList[i].check = false
                if (this.taskList[i].percent !== undefined && this.taskList[i].percent !== '0') {
                  if (this.taskList[i].percent.indexOf('.') !== -1) {
                    this.taskList[i].percent = this.taskList[i].percent.substring(0, this.taskList[i].percent.indexOf('.'))
                  }
                  if (this.taskList[i].percent === '0') {
                    this.taskList[i].chArea = this.taskList[i].acre
                  } else {
                    this.taskList[i].chArea = (this.taskList[i].acre / this.taskList[i].percent) * 100
                  }
                } else {
                  this.taskList[i].chArea = this.taskList[i].acre
                }
                if (this.taskList[i].acre !== undefined) {
                  this.taskList[i].acre = Math.round(this.taskList[i].acre * 1000) / 1000
                }
                if (this.taskList[i].createDate !== undefined) {
                  this.taskList[i].createDate = this.taskList[i].createDate.substring(0, 10)
                }
              }
            }
          } else {
            this.taskList = []
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
    /* 操作任务 */
    dealTask () {
      let chooseTask = []
      let chooseId = [] // 所选任务的创建人id
      for (let i = 0; i < this.taskList.length; i++) {
        if (this.taskList[i].check === true) {
          chooseTask.push(this.taskList[i].id)
          chooseId.push(this.taskList[i].user.id)
        }
      }
      if (chooseTask.length > 0) {
        for (let a = 0; a < chooseId.length; a++) {
          if (chooseId[a] !== this.userId) {
            this.canDeal = false
          }
        }
        if (this.canDeal) {
          let addParams = new URLSearchParams()
          addParams.set('orderId', this.orderId)
          addParams.set('tIds', chooseTask.toString())
          this.request({
            url: '/crops-platform/api/order_v3/saveOrderTask',
            method: 'post',
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
                content: '添加成功',
                icon: 'cubeic-alert',
                onConfirm: () => {
                  this.$router.push('/OrderDetail')
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
        } else {
          this.$createDialog({
            type: 'alert',
            content: '只能添加自己的任务',
            icon: 'cubeic-alert'
          }).show()
        }
      } else {
        this.$createDialog({
          type: 'alert',
          content: '请选择你要添加的任务',
          icon: 'cubeic-alert'
        }).show()
      }
    },
    /* 上拉加载 */
    onPullingUp () {
      if (this.isLast === 0) {
        setTimeout(() => {
          this.pageNo = this.pageNo + 1
          this.searchTask()
        }, 1000)
      } else {
        this.$refs.scroll.forceUpdate()
      }
    },
    /* 下拉刷新 */
    onPullingDown () {
      this.pageNo = 1
      this.taskList = []
      this.searchTask()
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #add-task
    height 100%
    width 100%
    background-color $color-background-grey
    overflow-y auto
    /*display flex*/
    /*flex-direction column*/
    .searchHeader
      padding 0 .3rem
      margin-top .1rem
    .checkTask
      margin-top .28rem
      height 85%
      .taskList
        display flex
        margin 0 .3rem
        margin-top .12rem
        position relative
        .taskDetail
          padding 0 .3rem .28rem .3rem
          background-color $color-background-white
          box-shadow 0px 4px 10px 0px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.05)
          border-radius 6px
          width 80%
          p
            font-size 16px
            color $color-font-black-new
            padding-top .2rem
        .titleBot
          height .24rem
          display flex
          align-items center
          margin-top .32rem
          div
            display flex
            align-items center
          img
            width .16rem
            height .22rem
          span
            font-size 12px
            color $color-font-disabled-new
            margin-left .14rem
          .creatTime
            margin-left .6rem
        .taskContent
          margin-top .36rem
          display flex
          height .6rem
          align-items center
          justify-content space-around
          background-color #F8F8F8
          div
            /*width 33%*/
            text-align center
          img
            height .2rem
            width .2rem
          span
            font-size 12px
            color $color-font-grey
            margin-left .2rem
      .taskList:first-of-type
        margin-top 0
      .noChoose
        height .6rem
        width .6rem
        background url("../../common/img/order/noChoose@3x.png") center center no-repeat
        background-size contain
        position absolute
        right 0
        top .9rem
      .chooseTask
        height .6rem
        width .6rem
        background url("../../common/img/order/chooseIcon@3x.png") center center no-repeat
        background-size contain
        position absolute
        right 0
        top .9rem
    .checkBtn
      display flex
      height 1.4rem
      align-items center
      background-color #fff
      position: fixed
      /* width: 100%; */
      bottom 0
      left 0
      right 0
      z-index 99
      img
        height .06rem
        width .06rem
        margin-left .3rem
      p
        font-size 16px
        color $color-font-grey
        margin-left .3rem
      div
        height .44rem
        width 1.56 rem
        line-height .44rem
        color #ffffff
        text-align center
        border-radius 22px
        font-size 15px
        position absolute
        right .3rem
      .addBtn
        background-color $color-font-blue
</style>
