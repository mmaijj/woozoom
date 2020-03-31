<template>
  <div id="my-order">
    <div class="search-header" v-show="!isShowSearch">
      <p class="orderByTime">按时间排序</p>
<!--      <span class="cubeic-pulldown"></span>-->
      <div :class="myCreate" @click="searchMyCreate">我创建的</div>
      <img src="../../common/img/task/searchTask@3x.png" @click="showSearch">
    </div>
    <div class="search-header" v-show="isShowSearch">
      <div class="searchText">
        <cube-input
          :placeholder="searchVal"
          v-model="taskName"
          @input="searchByName"
        >
          <template v-slot:prepend>
            <div class="cubeic-search ml12"></div>
          </template>
        </cube-input>
      </div>
      <span class="cancerBtn" @click="cancerBtn">取消</span>
    </div>
    <div class="orderList">
      <cube-scroll
        ref="scroll"
        :data="taskList"
        :options="options"
        @pulling-down="onPullingDown"
        @pulling-up="onPullingUp"
      >
        <div class="taskDetail" v-for="(item, index) in taskList" :key="index" @click="goToDetail(item)">
          <p>{{item.taskName}}</p>
          <div class="titleBot">
            <div>
              <label class="cubeic-aim"></label>
              <span v-if="item.land !== undefined">{{item.land.position}}</span>
            </div>
            <div class="creatTime">
              <label class="cubeic-calendar"></label>
              <span>{{item.taskId}}</span>
            </div>
            <div class="beTeam">
              <img src="../../common/img/task/beTeam.png">
              <span v-if="item.office !== undefined">{{item.office.name}}</span>
            </div>
          </div>
          <div class="taskContent">
            <div>
              <img src="../../common/img/order/createIcon@3x.png">
              <span v-if="item.createUserName !== undefined">{{item.createUserName}}</span>
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
      </cube-scroll>
    </div>
  </div>
</template>

<script>
import countDown from 'common/mixins/common'
export default {
  name: 'task',
  mixins: [countDown],
  data () {
    return {
      searchText: '搜索订单',
      activeIndex: '',
      pageNo: 1, // 当前页数
      pageSize: 10, // 每页个数
      isMeFlag: 0, // 是否我创建的
      startTime: '2010-12-12', // 开始时间
      endTime: '2020-12-20', // 结束时间
      orderByFlag: '1',
      myCreate: 'myCreate',
      searchVal: '搜索任务',
      taskName: '', // 任务名称
      isLast: 0, // 是否最后一页0：不是 1：是
      isShowSearch: false, // 是否展示搜索框
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
      taskList: [] // 订单列表
    }
  },
  mounted () {
    let mychoose = localStorage.getItem('myChoose')
    if (mychoose !== null) {
      if (mychoose === 'myCreate') {
        this.isMeFlag = 0
        this.myCreate = 'myCreate'
      } else if (mychoose === 'myCreateActive') {
        this.isMeFlag = 1
        this.myCreate = 'myCreateActive'
      }
    } else {
      this.myCreate = 'myCreate'
    }
    this.searchTask()
  },
  methods: {
    /* 根据名字查询 */
    searchByName () {
      // 当展示搜索框时才会执行
      if (this.isShowSearch) {
        this.pageNo = 1
        this.taskList = []
        this.$refs.scroll.scrollTo(0, 0)
        this.searchTask()
      }
      // this.isShowSearch = false
    },
    /* 我创建的订单 */
    searchMyCreate () {
      this.taskList = []
      let className = this.myCreate
      if (className === 'myCreate') {
        this.pageNo = 1
        this.myCreate = 'myCreateActive'
        this.isMeFlag = 1
        localStorage.setItem('myChoose', this.myCreate)
        this.searchTask()
      } else {
        this.pageNo = 1
        this.myCreate = 'myCreate'
        this.isMeFlag = 0
        localStorage.setItem('myChoose', this.myCreate)
        this.searchTask()
      }
    },
    /* 获取任务列表 */
    searchTask () {
      let searchParams = new URLSearchParams()
      searchParams.set('isMeFlag', this.isMeFlag)
      searchParams.set('pageNo', this.pageNo)
      searchParams.set('pageSize', this.pageSize)
      searchParams.set('orderByFlag', this.orderByFlag)
      searchParams.set('startTime', this.startTime)
      searchParams.set('endTime', this.endTime)
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
            for (let i = 0; i < this.taskList.length; i++) {
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
              if (this.taskList[i].taskId !== undefined) {
                if (this.taskList[i].taskId.length > 10) {
                  this.taskList[i].taskId = this.formatDate(Number(this.taskList[i].taskId)).substring(0, 10)
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
        }
      })
    },
    /* 展示搜索框 */
    showSearch () {
      this.isShowSearch = true
    },
    cancerBtn () {
      this.isShowSearch = false
      this.taskName = ''
      this.taskList = []
      this.searchTask()
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
    },
    /* 查看订单详情 */
    goToDetail (item) {
      let taskData = item
      localStorage.setItem('tabPage', 'task')
      sessionStorage.setItem('taskContent', JSON.stringify(taskData))
      this.$router.push('/taskDetail')
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
    .search-header
      height 1rem
      margin 0 .3rem
      display flex
      align-items center
      position relative
      .searchText
        width 5.8rem
      .cancerBtn
        position absolute
        right .3rem
        font-size 12px
      .orderByTime
        font-size 15px
        color $color-font-grey
        margin-left .4rem
      span
        margin-left .16rem
      img
        position absolute
        right .3rem
        height .4rem
        width .4rem
      .myCreate
        width 1.6rem
        height .6rem
        background-color #E6E6E9
        border-radius 15px
        line-height .6rem
        text-align center
        font-size 12px
        color #8C8C91
        margin-left .3rem
      .myCreateActive
        width 1.6rem
        height .6rem
        border-radius 15px
        line-height .6rem
        text-align center
        font-size 12px
        color #ffffff
        background-color #4388FF
        margin-left .3rem
    .orderList
      height 90%
      margin 0 .3rem
      .taskDetail
        padding 0 .3rem .28rem .3rem
        background-color $color-background-white
        box-shadow 0px 4px 10px 0px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.05)
        border-radius 6px
        margin-top .12rem
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
          width 17px
          height 15px
        span
          font-size 12px
          color $color-font-disabled-new
          margin-left .14rem
        .creatTime
          margin-left .3rem
        .beTeam
          margin-left .3rem
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
    .addOrder
      height 48px
      width 48px
      background url("../../common/img/uavplan/add_icon@3x.png") center center no-repeat
      background-size contain
      position fixed
      bottom .4rem
      right .3rem
      z-index 99
</style>
