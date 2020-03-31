<template>
  <div id="search-info">
    <div class="appoTeam">
      <div class="appo-header" @click="goToDetail">
        <img :src="teamLogo">
        <p>{{teamName}}</p>
      </div>
      <!-- 去掉加入团队审批 -->
<!--      <div class="joinApply" @click="lookApply">-->
<!--        <span>加入团队申请</span>-->
<!--        <div class="applyNum">3</div>-->
<!--        <div class="lookApply"></div>-->
<!--      </div>-->
      <div class="appo-detail" @click="hideButton">
        <div class="detail-header">
          <span>团队成员（{{teamCount}}）</span>
          <div class="add-icon" @click.stop="showAdd" id="add" v-show="isLeader" ref="add"></div>
          <div class="more-icon" @click.stop="showMore" id="more" ref="more"></div>
          <invitation-icon :size=0 v-show="isShowAdd" @hideIcon="hideIcon"></invitation-icon>
          <invitation-icon :size=1 v-show="isShowMore" @hideIcon="hideIcon" :memberCount="memberCount"></invitation-icon>
        </div>
        <div class="teamNum">
          <div class="team-num" v-for="(item, index) in teamNums" :key="index" @click.stop="goNumDetail(item)">
            <div>
              <img :src="item.avatar">
              <div class="teamCaption" v-show="item.protectionRole === 1"></div>
            </div>
            <label v-if="item.userName !== undefined">{{item.userName}}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import popupMixin from 'common/mixins/popup'
import InvitationIcon from 'components/invitationIcon/invitationIcon'
export default {
  name: 'eppoMain',
  mixins: [popupMixin],
  props: {
    searchRes: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      teamNums: [],
      isShowAdd: false,
      isShowMore: false,
      teamName: '', // 团队名称
      teamCount: '', // 团队成员数
      memberCount: 0, // 该团队拥有的队员数
      teamLogo: '', // 团队logo
      createDate: '',
      teamNumLogo: '', // 团队成员头像
      isLeader: true, // 是否为队长
      userPermiss: '', // 用户权限
      onLine: navigator.onLine // 当前网络状况
    }
  },
  created () {
    /* 获取植保队详情 */
    this.getEppoDetail()
    /* 获取植保队列表 */
    this.getTeamlist()
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
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
    /* 获取植保队详情 */
    getEppoDetail () {
      this.userPermiss = localStorage.getItem('userQx')
      if (this.userPermiss === '1') {
        this.isLeader = true
      } else {
        this.isLeader = false
      }
      this.request({
        url: '/crops-platform/api/protection_v3/captain/detail',
        method: 'get',
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        let details = response.data.data
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.teamCount = details.flyerCount
          this.teamName = details.name
          let isHave = details.logo.indexOf('api')
          if (isHave !== -1) {
            this.teamLogo = details.logo
          } else {
            this.teamLogo = require('../../common/img/manger/planPlayer@3x.png')
          }
          this.createDate = details.createDate
          localStorage.setItem('teamName', this.teamName)
          localStorage.setItem('teamLogo', this.teamLogo)
          localStorage.setItem('createDate', this.createDate)
          localStorage.setItem('mangerName', details.managerName)
          localStorage.setItem('teamId', details.id)
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
    lookApply () {
      this.lookComp = this.lookComp || this.$createLookMoreApply({
      })
      this.lookComp.show()
    },
    showAdd () {
      this.isShowMore = false
      if (this.isShowAdd) {
        this.isShowAdd = false
      } else {
        this.isShowAdd = true
      }
    },
    showMore () {
      this.isShowAdd = false
      if (this.isShowMore) {
        this.isShowMore = false
      } else {
        this.isShowMore = true
      }
    },
    /* 隐藏操作按钮 */
    hideButton () {
      this.isShowAdd = false
      this.isShowMore = false
    },
    hideIcon () {
      this.teamNums = []
      this.hideButton()
      this.getTeamlist()
      this.getEppoDetail()
    },
    /* 获取团队成员列表 */
    getTeamlist () {
      this.memberCount = 0
      this.request({
        url: '/crops-platform/api/protection_v3/captain/flyerList',
        method: 'get',
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          /* 获取列表，渲染到页面 */
          this.teamNums = response.data.data
          let ss = {}
          for (let i = 0; i < this.teamNums.length; i++) {
            if (this.teamNums[i].protectionRole === 2) {
              this.memberCount++
            }
            if (this.teamNums[i].protectionRole === 1) {
              ss = this.teamNums[i]
              this.teamNums.splice(i, 1)
              break
            }
          }
          console.log(this.memberCount)
          this.teamNums.unshift(ss)
        }
      })
    },
    /* 查看队员详情 */
    goNumDetail (item) {
      // let qx = item.protectionRole
      let numDetail = item
      // if (qx === 2) {
      this.LeaderOperationComp = this.LeaderOperationComp || this.$createLeaderOperation({
        $props: {
          numDet: numDetail
        },
        $events: {
          leave: () => {
            this.teamNums = []
            this.getTeamlist()
            this.getEppoDetail()
          }
        }
      })
      this.LeaderOperationComp.show()
      // }
    },
    goToDetail () {
      this.$router.push('/EppoDetail')
    }
  },
  components: {
    InvitationIcon
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #search-info
    width 100%
    height 100%
    background-color $color-background-grey
    color $color-font-white
    .appoTeam
      margin 0 .3rem
      .appo-header
        height 2.4rem
        background url("../../common/img/eppoteam/header_bg@3x.png") center center no-repeat
        background-size cover
        display flex
        img
          height 60px
          width 60px
          margin .6rem 0 0 .4rem
        p
          margin 1rem 0 0 .3rem
          font-size 18px
      .joinApply
        height 1.2rem
        display flex
        align-items center
        color $color-font-black-new
        background-color $color-background-white
        span
          font-size 14px
          font-weight 500
          margin-left .3rem
        .applyNum
          width 32px
          height 22px
          line-height 22px
          text-align center
          font-size 14px
          color $color-font-white
          background-color $color-background-red
          border-radius 15px
          position absolute
          right 1rem
        .lookApply
          height 14px
          width 14px
          background url("../../common/img/editperinfo/moreInfo@3x.png") center center no-repeat
          background-size contain
          position absolute
          right .6rem
      .appo-detail
        height 10rem
      .detail-header
        height 1.4rem
        color $color-font-black
        display flex
        align-items center
        position relative
        .add-icon
          height 20px
          width 20px
          background url("../../common/img/eppoteam/addIcon@3x.png") center center no-repeat
          background-size contain
          position absolute
          right 1.4rem
        .more-icon
          height 20px
          width 20px
          background url("../../common/img/eppoteam/moreIcon@3x.png") center center no-repeat
          background-size contain
          position absolute
          right .3rem
      .teamNum
        margin-left .6rem
        .team-num
          height 1.6rem
          width 2rem
          float left
          text-align center
          margin-right 1rem
          margin-top .2rem
          position relative
          img
            height 50px
            width 50px
          label
            font-size 15px
            color $color-font-black
          .teamCaption
            height 20px
            width 20px
            background url("../../common/img/eppoteam/caption@3x.png") center center no-repeat
            background-size contain
            position absolute
            top 0
            right .16rem
</style>
