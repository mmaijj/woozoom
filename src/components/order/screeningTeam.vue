<template>
    <div id="screen-team" v-show="visible">
      <div class="eppoTeam">
        <div class="eppoTitle">选择团队</div>
        <div class="allEppo">所有团队</div>
        <div v-for="(item, index) in eppoList" :key="index" class="eppoList" :class="{'selectActive':activeIndex===index}" @click="searchEppoNum(index)">
          <img :src="item.otherurl">
          <div>{{item.name}}</div>
        </div>
      </div>
      <div class="eppoNum">
        <div class="numTitle">选择成员</div>
        <div class="allNum">所有成员</div>
        <div v-for="(item, index) in numList" :key="index" class="numList" @click="searchTask(item)">
          <img src="../../common/img/eppoteam/caption@3x.png" v-if="item.isCaption === true">
          <div>{{item.name}}</div>
        </div>
      </div>
    </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
// eslint-disable-next-line no-unused-vars
const EVENT_LEAVE = 'leave'
export default {
  name: 'screeningTeam',
  mixins: [popupMixin],
  props: {
    orderId: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      eppoList: [], // 植保队
      numList: [], // 植保队员
      teamId: '',
      activeIndex: ''
    }
  },
  mounted () {
    this.searchEppo()
  },
  methods: {
    /* 查找植保队 */
    searchEppo () {
      let searchParams = new URLSearchParams()
      searchParams.set('orderId', this.orderId)
      this.request({
        url: '/crops-platform/api/order_v3/getOrderTaskTeamList',
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
          let ss = {
            name: '所有团队',
            otherurl: require('../../common/img/manger/planPlayer@3x.png')
          }
          this.eppoList = response.data.data
          this.eppoList.splice(0, 0, ss)
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    /* 查找植保队员 */
    searchEppoNum (index) {
      if (index === 0) {
        let info = {}
        info.teamId = ''
        info.userId = ''
        info.userName = '所有团队'
        this.$emit(EVENT_LEAVE, info)
      } else {
        this.activeIndex = index
        this.teamId = this.eppoList[index].id
        let numParams = new URLSearchParams()
        numParams.set('teamId', this.teamId)
        this.request({
          url: '/crops-platform/api/order_v3/getTeamUserList',
          method: 'get',
          params: numParams,
          headers: {
            'clientType': 'weixin',
            'deviceId': '11654325'
          }
        }).then(response => {
          let res = response.data.status
          // eslint-disable-next-line no-unused-vars
          let { code, reasonPhrase } = res
          if (code === 0) {
            let ss = {
              userId: '',
              name: '所有成员'
            }
            this.numList = response.data.data
            this.numList.splice(0, 0, ss)
            for (let i = 0; i < this.numList.length; i++) {
              if (this.numList[i].avatar !== undefined) {
                this.numList[i].isCaption = false
              } else {
                this.numList[i].isCaption = false
              }
            }
          } else {
            this.$createDialog({
              type: 'alert',
              content: reasonPhrase,
              icon: 'cubeic-alert'
            }).show()
          }
        })
      }
    },
    /* 查找相应的任务 */
    searchTask (item) {
      let info = {}
      info.teamId = this.teamId
      info.userId = item.userId
      info.userName = item.name
      this.$emit(EVENT_LEAVE, info)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #screen-team
    position fixed
    z-index 100
    top 0
    left 0
    width 100%
    height 100%
    color #fff
    background-color $color-background-grey
    display flex
    .eppoTeam
      width 60%
      height 100%
      .eppoTitle
        color $color-font-disabled
        font-size 12px
        text-align center
        height .8rem
        line-height .8rem
        border-bottom 1px solid #DCDCDC
      .allEppo
        color #b4b4b4
        font-size 16px
        text-align center
        height 1.2rem
        line-height 1.2rem
        position relative
        border-bottom 1px solid #DCDCDC
      .allEppo:before
        content ''
        position absolute
        top 50%
        background #b4b4b4
        width 2%
        height 2px
        left 32%
      .allEppo:after
        content ''
        position absolute
        top 50%
        background #b4b4b4
        width 2%
        height 2px
        right 32%
      .eppoList
        height 1.2rem
        line-height 1.2rem
        font-size 16px
        color $color-font-black-new
        text-align center
        display flex
        align-items center
        padding-left .3rem
        img
          height .8rem
          width .8rem
          margin-right .2rem
      .selectActive
        background-color $color-background-blue
        color $color-font-white
    .eppoNum
      width 40%
      height 100%
      background-color #f0f0f0
      .numTitle
        color $color-font-disabled
        font-size 12px
        text-align center
        height .8rem
        line-height .8rem
        border-bottom 1px solid #DCDCDC
      .allNum
        color #b4b4b4
        font-size 16px
        text-align center
        height 1.2rem
        line-height 1.2rem
        background-color #E6E6E6
        position relative
        border-bottom 1px solid #DCDCDC
      .allNum:before
        content ''
        position absolute
        top 50%
        background #b4b4b4
        width 3%
        height 2px
        left 22%
      .allNum:after
        content ''
        position absolute
        top 50%
        background #b4b4b4
        width 3%
        height 2px
        right 22%
      .numList
        height 1.2rem
        line-height 1.2rem
        font-size 16px
        color $color-font-black-new
        text-align center
        display flex
        align-items center
        padding-left .3rem
        img
          height .4rem
          width .4rem
          margin-right .2rem
</style>
