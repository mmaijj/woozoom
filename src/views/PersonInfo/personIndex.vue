<template>
  <div id="person-info">
    <div class="header-info" @click="changHeader">
      <label>头像</label>
      <cube-upload
        ref="upload"
        v-model="files"
        action="#"
        :auto="false"
        @files-added = "addBefore"
        @file-submitted="addedHandler"
        :process-file="processFile"
      ></cube-upload>
      <img :src="headerLogo" v-show="isImg">
      <span class="more-info"></span>
    </div>
    <div class="main-info">
      <div class="verCenter" @click="setPlanName">
        <label>姓名</label>
        <p>{{name}}</p>
        <span class="more-info"></span>
      </div>
      <div class="verCenter" @click="setPhoneNumber">
        <label>联系电话</label>
        <p>{{linePhone}}</p>
        <span class="more-info"></span>
      </div>
      <!-- 去掉实名认证 -->
<!--      <div class="verCenter" @click="setIdCardInfo">-->
<!--        <label>身份证号</label>-->
<!--        <p>已填写</p>-->
<!--        <span class="more-info"></span>-->
<!--      </div>-->
      <div class="verCenter" @click="lookQualification">
        <label>飞行资质</label>
        <p>{{quaCount}}个证件</p>
        <span class="more-info"></span>
      </div>
      <div class="verCenter" @click="setPassword">
        <label>修改密码</label>
        <span class="more-info"></span>
      </div>
    </div>
    <div class="signout-btn" @click="signOut">
      <cube-button :primary="true">退出登录</cube-button>
    </div>
  </div>
</template>
<script>
import compress from 'common/mixins/compress'
export default {
  name: 'personIndex',
  data () {
    return {
      linePhone: '',
      idNum: '',
      name: '',
      files: [],
      isImg: false,
      headerLogo: '',
      userId: '',
      zcPhone: '',
      quaCount: ''
    }
  },
  mounted () {
    this.getUserInfo()
  },
  methods: {
    changHeader () {
      // this.actionComp = this.actionComp || this.$createActionSheet({
      //   data: [
      //     {
      //       content: '相机拍摄'
      //     },
      //     {
      //       content: '从相册中选择'
      //     }
      //   ]
      // })
      // this.actionComp.show()
    },
    /* 获取用户信息 */
    getUserInfo () {
      this.userId = localStorage.getItem('userId') // 用户id
      this.name = localStorage.getItem('userName') // 用户昵称
      this.idNum = localStorage.getItem('userCard') // 用户身份证号码
      // this.linePhone = localStorage.getItem('linePhone') // 用户电话
      this.zcPhone = localStorage.getItem('userPhone') // 用户注册电话
      let phone = localStorage.getItem('linePhone') // 用户电话
      if (phone !== null && phone !== 'undefined') {
        this.linePhone = phone
      } else {
        this.linePhone = this.zcPhone
      }
      this.headerLogo = localStorage.getItem('userLogo') // 用户头像
      this.quaCount = localStorage.getItem('quaCount') // 飞行资质数
      /* 当没有头像的时候，该img隐藏，显示上传头像按钮 */
      if (this.headerLogo !== '') {
        this.isImg = true
      } else {
        this.isImg = false
      }
    },
    /* 更新身份证号 */
    setIdCardInfo () {
      this.idcardComp = this.idcardComp || this.$createIdCardInfo({
        $props: {
          idCard: this.idNum
        },
        $events: {
          leave: (val) => {
            this.idNum = val
            this.changeInfo('4', this.idNum)
          }
        }
      })
      this.idcardComp.show()
    },
    /* 更新电话 */
    setPhoneNumber () {
      this.phoneComp = this.phoneComp || this.$createPhoneNumber({
        $props: {
          phoneNum: this.linePhone
        },
        $events: {
          leave: (val) => {
            this.linePhone = val
            this.changeInfo('3', this.linePhone)
          }
        }
      })
      this.phoneComp.show()
    },
    /* 更新姓名 */
    setPlanName () {
      this.nameComp = this.nameComp || this.$createPlanName({
        $props: {
          playerName: this.name
        },
        $events: {
          leave: (val) => {
            this.name = val
            this.changeInfo('2', this.name)
          }
        }
      })
      this.nameComp.show()
    },
    /* 更新密码 */
    setPassword () {
      this.passComp = this.passComp || this.$createChangePassword({
        $events: {
          leave: (val) => {
            this.changePass(val)
          }
        }
      })
      this.passComp.show()
    },
    changePass (param) {
      let passParam = new URLSearchParams()
      passParam.set('password', param)
      this.request({
        url: '/crops-platform/api/user/userInfo_v3/updatePassword',
        method: 'get',
        params: passParam,
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
            content: '更新成功',
            icon: 'cubeic-alert'
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
    // 处理原始文件函数
    processFile (file, next) {
      compress(file, {
        compress: {
          width: 400,
          height: 300,
          quality: 0.92
        },
        type: 'file'
      }, (file) => {
        next(file)
      })
    },
    addBefore () {
      const file = this.files[0]
      file && this.$refs.upload.removeFile(file)
    },
    /* 上传头像 */
    addedHandler (files) {
      // const file = this.files[0]
      // file && this.$refs.upload.removeFile(file)
      let upFile = files.file
      let logoParams = new FormData()
      logoParams.append('file', upFile)
      this.request({
        url: '/crops-platform/api/base/file/upload',
        method: 'post',
        data: logoParams,
        headers: {
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          this.teamLogo = ''
          // this.files = []
          this.isImg = false // 当已上传头像了，隐藏该img
          this.changeInfo('1', response.data.data)
        } else {
          this.$createDialog({
            type: 'alert',
            content: reasonPhrase,
            icon: 'cubeic-alert'
          }).show()
        }
      })
    },
    /* 更改个人信息 */
    changeInfo (type, val) {
      // type： 1 头像 2 更改姓名 3 更改电话 4 更改身份证
      let updateParams = {}
      updateParams.id = this.userId
      switch (type) {
        case '1':
          updateParams.avator = val
          break
        case '2':
          updateParams.realName = val
          break
        case '3':
          updateParams.phone = val
          break
        case '4':
          updateParams.cardNo = val
          break
      }
      this.request({
        url: '/crops-platform/api/user/userInfo_v3/save',
        method: 'post',
        data: updateParams,
        headers: {
          'Content-Type': 'application/json',
          'clientType': 'weixin',
          'deviceId': '11654325'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          if (type === '1') {
            this.headerLogo = ''
            this.$createDialog({
              type: 'alert',
              content: '上传成功',
              icon: 'cubeic-alert'
            }).show()
          } else {
            this.$createDialog({
              type: 'alert',
              content: '更新成功',
              icon: 'cubeic-alert'
            }).show()
          }
        } else {
        }
      })
    },
    /* 查看飞行资质 */
    lookQualification () {
      this.$router.push('/flyQualification')
    },
    /* 退出登录 */
    signOut () {
      this.request({
        url: '/crops-platform/a/logout',
        method: 'get',
        headers: {
          'clientType': 'weixin',
          'deviceId': '1165465'
        }
      }).then(response => {
        let res = response.data.status
        // eslint-disable-next-line no-unused-vars
        let { code, reasonPhrase } = res
        if (code === 0) {
          localStorage.removeItem('userToken')
          localStorage.removeItem('myChoose')
          this.$router.push({ path: '/UserLogin', query: { 'flag': '1' } })
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  #person-info
    height 100%
    width 100%
    background-color $color-background-grey
    .cube-upload
      position absolute
      right .8rem
    label
      font-size 15px
      font-weight 600
      color $color-font-black-new
      margin-left: .3rem
      width 40%
    p
      width 60%
      text-align right
      margin-right .7rem
      font-size 15px
      font-weight 400
      color $color-font-grey
    .header-info
      display flex
      height 1.6rem
      align-items center
      background-color $color-background-white
      img
       height 60px
       width 60px
       position absolute
       right .8rem
    .main-info
      margin-top 6px
      background-color $color-background-white
      .verCenter
        display flex
        align-items center
        height 1.2rem
    .more-info
      display block
      height 14px
      width 14px
      background url("../../common/img/editperinfo/moreInfo@3x.png") center center no-repeat
      background-size contain
      position absolute
      right .3rem
    .signout-btn
      margin 2.5rem .3rem 0 .3rem
      .cube-btn-primary
        border-radius 22px
</style>
