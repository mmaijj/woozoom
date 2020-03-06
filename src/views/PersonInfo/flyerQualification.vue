<template>
  <div id="fly-qualification">
    <div class="fly-header">
      <div class="fly_logo">
        <img :src="aopaLogo">
      </div>
      <div class="searchQua" @click="setIdCard">
        <label>身份证号</label>
        <span>{{tipText}}</span>
        <div class="more-info"></div>
      </div>
    </div>
    <div class="showAopa" v-show="!hasQua">
      <label>我的证件/执照</label>
      <div v-for="(item, index) in quaList" :class="item.quaBg" :key="index">
        <p class="quaName">{{item.quaName}}</p>
        <p class="quaNum">{{item.certificateNumber}}</p>
        <div class="yxq">
          <span>有效期</span>
          <p>{{item.effectiveDate}}</p>
        </div>
      </div>
    </div>
    <div class="noAopa" v-show="hasQua">
      <div>
        <img src="../../common/img/editperinfo/noCard@3x.png">
        <span>没有证件/执照信息</span>
        <p>参加学习、培训、考试获得证书证件吧</p>
      </div>
    </div>
    <div class="setIdCard" v-show="!hasQua">
      <span>请填写身份证号关联执照信息</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'flyerQualification',
  data () {
    return {
      aopaLogo: '',
      tipText: '用于关联证件信息', // 当有身份证号时候显示身份证，没有时候显示提示信息
      quaCount: 0,
      hasQua: false,
      quaBg: '',
      quaList: []
    }
  },
  mounted () {
    this.quaCount = localStorage.getItem('quaCount')
    if (this.quaCount === 0) {
      this.hasQua = true
      this.aopaLogo = require('../../common/img/editperinfo/aopaGreylogo@3x.png')
    } else {
      this.hasQua = false
      this.aopaLogo = require('../../common/img/editperinfo/aopoLogo@3x.png')
    }
  },
  methods: {
    /* 填写身份证号 */
    setIdCard () {
      this.cardComp = this.cardComp || this.$createIdCardInfo({
        $events: {
          leave: (val) => {
            this.tipText = val
            this.searchQua(val)
          }
        }
      })
      this.cardComp.show()
    },
    /* 根据身份证号查询资质 */
    searchQua (item) {
      let idCard = item
      let searchParam = new URLSearchParams()
      searchParam.set('idCard', idCard)
      this.request({
        url: '/crops-platform/api/flyer/flyerInfo_v3/qualificationsList',
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
          // alert('312')
          if (response.data.data !== undefined) {
            this.quaList = response.data.data
            this.hasQua = false
            this.aopaLogo = require('../../common/img/editperinfo/aopoLogo@3x.png')
            for (let i = 0; i < this.quaList.length; i++) {
              if (this.quaList[i].certificateType === '1') {
                this.quaList[i].quaName = '无人机驾驶培训资格证'
                this.quaList[i].quaBg = 'quaBlue'
              } else if (this.quaList[i].certificateType === '2') {
                this.quaList[i].quaName = '民用无人机驾驶员合格证'
                this.quaList[i].quaBg = 'quaRed'
              }
            }
          } else {
            this.hasQua = true
            this.aopaLogo = require('../../common/img/editperinfo/aopaGreylogo@3x.png')
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
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #fly-qualification
    height 100%
    width 100%
    background-color $color-background-grey
    .fly-header
      margin 0 .3rem
      .fly_logo
        height 1.8rem
        background-color $color-background-white
        border-radius 20px 20px 0 0
        display flex
        align-items center
        justify-content center
        border-bottom 1px solid $color-bottom-line
        img
          width 2.8rem
          height .8rem
      .searchQua
        height 1.2rem
        background-color $color-background-white
        display flex
        align-items center
        position relative
        label
          font-size 15px
          color $color-font-black-new
          margin-left .3rem
        span
          font-size 15px
          color #969696
          position absolute
          right .6rem
    .noAopa
      width 100%
      display flex
      align-items center
      justify-content center
      position absolute
      top 5rem
      div
        text-align center
      img
        width 156px
        height 110px
      span
        display block
        font-size 16px
        color $color-font-black-new
        margin-top 12px
      p
        font-size 12px
        color #4B473D
        margin-top 10px
    .showAopa
      margin-top .5rem
      text-align center
      label
        font-size 14px
        color $color-font-black-new
      .quaBlue
        width 6.6rem
        height 3rem
        background url("../../common/img/editperinfo/cardBlue@3x.png") center center no-repeat
        background-size cover
        margin 0 auto
        margin-top .3rem
        position relative
      .quaRed
        width 6.6rem
        height 3rem
        background url("../../common/img/editperinfo/cardRed@3x.png") center center no-repeat
        background-size cover
        margin 0 auto
        margin-top .3rem
        position relative
      .quaName
        position absolute
        left .6rem
        top .4rem
        font-size 16px
        color #ffffff
      .quaNum
        position absolute
        bottom .6rem
        left .6rem
        font-size 18px
        color #ffffff
      .yxq
        position absolute
        bottom .6rem
        right .6rem
        color #ffffff
        span
          font-size 9px
        p
          font-size 12px
          margin-top 4px
    .more-info
      width 13px
      height 14px
      background url("../../common/img/editperinfo/moreInfo@3x.png") center center no-repeat
      background-size contain
      position absolute
      right .3rem
    .setIdCard
      width 100%
      font-size 12px
      color #4B473D
      display flex
      justify-content center
      position absolute
      bottom .4rem
</style>
