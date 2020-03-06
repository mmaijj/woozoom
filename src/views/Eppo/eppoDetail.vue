<template>
  <div id="person-info">
    <div class="header-info" @click="changHeader">
      <label>植保队头像</label>
      <cube-upload
        ref="upload"
        v-model="files"
        action="#"
        :auto="false"
        v-show="isCaption"
        @files-added = "addBefore"
        @file-submitted="addedHandler"
        :process-file="processFile"
      ></cube-upload>
      <img :src="headerLogo" v-show="isImg">
      <span class="more-info"></span>
    </div>
    <div class="main-info">
      <div class="verCenter" @click="changeName">
        <label>植保队名称</label>
        <p>{{name}}</p>
        <span class="more-info"></span>
      </div>
      <div class="verCenter">
        <label>创建时间</label>
        <p style="color: #969696;">{{linePhone}}</p>
      </div>
      <!--去掉植保队认证-->
<!--      <div class="verCenter" @click="teamAppro">-->
<!--        <label>团队认证</label>-->
<!--        <p>未认证</p>-->
<!--        <span class="more-info"></span>-->
<!--      </div>-->
      <div class="verCenter">
        <label>队长</label>
        <p>{{captionName}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import compress from 'common/mixins/compress'
export default {
  name: 'eppoDetail',
  data () {
    return {
      linePhone: '2019/08/31',
      captionName: '安帕瓦',
      name: '老司机植保',
      teamId: '',
      headerLogo: '',
      files: [],
      userPermiss: '',
      isCaption: true,
      isImg: false,
      onLine: navigator.onLine // 当前网络状况
    }
  },
  destroyed () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  mounted () {
    this.userPermiss = localStorage.getItem('userQx')
    if (this.userPermiss === '2') {
      this.isCaption = false
    } else {
      this.isCaption = true
    }
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.getDetail()
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
    /* 更改头像 */
    changHeader () {
      if (this.userPermiss === '2') {
        this.$createDialog({
          type: 'alert',
          content: '植保队员不能修改植保队信息',
          icon: 'cubeic-alert'
        }).show()
      }
    },
    /* 获取用户详细信息 */
    getDetail () {
      this.name = localStorage.getItem('teamName') // 植保队名称
      this.headerLogo = localStorage.getItem('teamLogo') // 植保队头像
      this.linePhone = localStorage.getItem('createDate') // 创建时间
      this.captionName = localStorage.getItem('mangerName') // 队长名称
      this.teamId = localStorage.getItem('teamId') // 植保队id
      /* 当没有头像的时候，该img隐藏，显示上传头像按钮 */
      if (this.headerLogo !== '') {
        this.isImg = true
      } else {
        this.isImg = false
      }
    },
    /* 更改昵称 */
    changeName () {
      if (this.userPermiss === '2') {
        this.$createDialog({
          type: 'alert',
          content: '植保队员不能修改植保队信息',
          icon: 'cubeic-alert'
        }).show()
      } else {
        this.changeNameComp = this.changeNameComp || this.$createEppoName({
          $props: {
            eppoName: this.name
          },
          $events: {
            leave: (val) => {
              if (this.name !== val) {
                this.name = val
                let updateParams = {}
                updateParams.id = this.teamId
                updateParams.name = this.name
                updateParams.logo = this.headerLogo
                this.request({
                  url: '/crops-platform/api/protection_v3/captain/modify',
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
                    this.$createDialog({
                      type: 'alert',
                      content: '更新成功',
                      icon: 'cubeic-alert'
                    }).show()
                  }
                })
              }
            }
          }
        })
        this.changeNameComp.show()
      }
    },
    teamAppro () {
      this.approComp = this.approComp || this.$createEppoAppro({

      })
      this.approComp.show()
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
          this.headerLogo = 'http://223.100.24.135:12411/crops-platform' + response.data.data
          this.isImg = false // 当已上传头像了，隐藏该img
          let updateParams = {}
          updateParams.id = this.teamId
          updateParams.name = this.name
          updateParams.logo = response.data.data
          this.request({
            url: '/crops-platform/api/protection_v3/captain/modify',
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
              // this.headerLogo = ''
              this.$createDialog({
                type: 'alert',
                content: '上传成功',
                icon: 'cubeic-alert'
              }).show()
            }
          })
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
</style>
