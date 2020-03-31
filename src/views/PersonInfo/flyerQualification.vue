<template>
  <div id="fly-qualification">
    <div class="noAssociated" v-show="!hasQua">
      <div class="tipContent">
        <img src="../../common/img/editperinfo/idCard.png">
        <p>无关联证件</p>
      </div>
      <div class="associatedBtn" @click="setIdCard">
        <cube-button :primary="true">关联证件</cube-button>
      </div>
    </div>
    <div class="hasAssociated" v-show="hasQua">
      <div :class="item.quaBg" v-for="(item, index) in quaList" :key="index">
        <div class="title">
          <span>{{item.quaName}}</span>
          <p>有效期：{{item.effectiveDate}}</p>
        </div>
        <div class="bottomDetail">
          <span>{{item.name}}</span>
          <p>ID:{{item.certificateNumber}}</p>
        </div>
      </div>
      <div class="goAssociated" @click="setIdCard">
        <cube-button :primary="true">关联证件</cube-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'flyerQualification',
  data () {
    return {
      quaCount: 0,
      hasQua: false,
      quaList: [],
      certificateType: '维修员合格证', // 证件类型
      effectiveDate: '2020-12-20'
    }
  },
  mounted () {
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
            this.hasQua = true
            for (let i = 0; i < this.quaList.length; i++) {
              if (this.quaList[i].isInvalid === '1') {
                if (this.quaList[i].certificateType === '1') {
                  this.quaList[i].quaName = '植保无人机驾驶员合格证'
                  this.quaList[i].quaBg = 'quaBlue'
                } else if (this.quaList[i].certificateType === '2') {
                  this.quaList[i].quaName = '植保无人机维修员合格证'
                  this.quaList[i].quaBg = 'quaRed'
                }
              } else if (this.quaList[i].isInvalid === '0') {
                if (this.quaList[i].certificateType === '1') {
                  this.quaList[i].quaName = '植保无人机驾驶员合格证'
                } else if (this.quaList[i].certificateType === '2') {
                  this.quaList[i].quaName = '植保无人机维修员合格证'
                }
                this.quaList[i].quaBg = 'quaOut'
              }
              if (this.quaList[i].effectiveDate === '1') {
                this.quaList[i].effectiveDate = '2年'
              } else if (this.quaList[i].effectiveDate === '2') {
                this.quaList[i].effectiveDate = '永久'
              }
            }
          } else {
            this.hasQua = false
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
    .noAssociated
      height: 100%;
      width: 100%;
      .tipContent
        text-align center
        padding-top 3.4rem
        img
          width 2.9rem
          height 2.6rem
        p
          font-size 18px
          color $color-font-disabled-new
          margin-top .2rem
      .associatedBtn
        width 4rem
        margin 0 auto
        margin-top .54rem
    .quaBlue
      background url("../../common/img/editperinfo/uavDriving.png") center center no-repeat
      background-size contain
      /* margin: 0 30px; */
      height 3.6rem
      width 6.6rem
      border-radius 26px
      margin 0 auto
      color #FFFFFF
      position relative
    .quaGreen
      background url("../../common/img/editperinfo/uavMaintenance.png") center center no-repeat
      background-size contain
      /* margin: 0 30px; */
      height 3.6rem
      width 6.6rem
      border-radius 26px
      margin 0 auto
      color #FFFFFF
      position relative
    .quaOut
      background url("../../common/img/editperinfo/invalid.png") center center no-repeat
      background-size contain
      /* margin: 0 30px; */
      height 3.6rem
      width 6.6rem
      border-radius 26px
      margin 0 auto
      color #FFFFFF
      position relative
    .title
      position absolute
      top 0.5rem
      left .8rem
      span
        font-size 18px
      p
        font-size 14px
        margin-top .1rem
    .bottomDetail
      position absolute
      bottom .6rem
      left .8rem
      span
        font-size 18px
      p
        font-size 14px
        margin-top .1rem
    .goAssociated
      width: 5rem;
      margin: 0 auto;
      position: absolute;
      bottom: 1rem;
      left: 0;
      right: 0;
</style>
