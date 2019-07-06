<template>
  <div class="details">
    <mt-header fixed title="地址详情"></mt-header>
    <main class="main">
      <div class="pos-name border-bottom">
        <span class="name">地址名称</span>
        <span class="price">{{ posname }}</span>
      </div>
      <div class="date border-bottom" @click="dateClick">
        <span class="txt">日期</span>
        <p class="time-frame">
          <span class="time">{{ search.startDate }} 至 {{ search.endDate }}</span>
          <span class="icon"></span>
        </p>
      </div>
      <div ref="content" style="overflow-y: scroll;">
        <mt-loadmore
          :top-method="loadTop"
          :bottom-method="loadBottom"
          :bottom-all-loaded="allLoaded"
          :auto-fill="false"
          ref="loadmore">
          <div class="list">
            <div class="item" v-for="item in listDate" :key="item.pt_id">
                <div class="chunk-line border-bottom">
                  <span class="price">{{ item.check_time | formatDate }}</span>
                  <span class="price">{{ item.user_name }}</span>
                </div>
              <div class="chunk" v-for="chunk in item.isd" :key="chunk.isd_id">
                <div class="chunk-line border-bottom">
                  <span class="name">检查项</span>
                  <span class="price">{{ chunk.ins_name }}</span>
                </div>
                <div class="chunk-line border-bottom">
                  <span class="name">检查方法</span>
                  <span class="price">{{ chunk.method }}</span>
                </div>
                <div class="chunk-line border-bottom">
                  <span class="name">检查内容及要求</span>
                  <span class="price">{{ chunk.check_content }}</span>
                </div>
                <div class="chunk-line border-bottom">
                  <span class="name">检查结果</span>
                  <span class="price" v-if="chunk.task_state === 0">未巡查</span>
                  <span class="price" v-else-if="chunk.task_state === 1">正常</span>
                  <span class="price" v-else-if="chunk.task_state === 2">异常</span>
                </div>
                <div class="chunk-region">
                  <span class="name">备注：</span>
                  <span class="price">{{ chunk.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <p class="load-hint" v-show="allLoaded">没有更多了！</p>
        </mt-loadmore>
      </div>
    </main>
    <mt-datetime-picker
      ref="startPicker"
      type="date"
      :start-date="startDate"
      :end-date="nowDate"
      v-model="nowSearch.startDate"
      @confirm="startDateConfirm">
    </mt-datetime-picker>
    <mt-datetime-picker
      ref="endPicker"
      type="date"
      :start-date="startDate"
      :end-date="nowDate"
      v-model="nowSearch.endDate"
      @confirm="endDateConfirm">
    </mt-datetime-picker>
  </div>
</template>

<script>
export default{
  name: 'Details',
  data () {
    return {
      proid: '',
      posid: '',
      startDate: new Date('2018/01/01'),
      nowDate: new Date(),
      search: {
        startDate: '',
        endDate: ''
      },
      nowSearch: {
        startDate: new Date(),
        endDate: new Date()
      },
      posname: '',
      pageIndex: 0,
      pageSize: 20,
      hasMore: true,
      listDate: [],
      allLoaded: false
    }
  },
  created () {
    const nowHref = window.location.href
    if (nowHref.indexOf('?') !== -1) {
      let hrefArr = nowHref.split('?')
      let parArr = hrefArr[1].split('&')
      let parObj = {}
      parArr.forEach((item, index, array) => {
        let objItem = item.split('=')
        parObj[objItem[0]] = objItem[1]
      })
      this.proid = parObj.proid || ''
      this.posid = parObj.posid || ''
    }
  },
  mounted () {
    let mydate = new Date()
    let year = mydate.getFullYear()
    let month = mydate.getMonth() + 1 + ''
    month = month.padStart(2, '0')
    let day = mydate.getDate() + ''
    day = day.padStart(2, '0')
    const nowDate = year + '-' + month + '-' + day
    this.search = {
      startDate: nowDate,
      endDate: nowDate
    }
    const domHeight = document.documentElement.clientHeight - 125
    this.$refs.content.style.height = domHeight + 'px'
    // 获取列表
    if (this.proid && this.posid) {
      this.getListData()
    }
  },
  methods: {
    // 获取列表数据
    getListData () {
      this.pageIndex = this.pageIndex + 1
      let params = {
        project_id: this.proid,
        position_id: this.posid,
        start_date: this.search.startDate,
        end_date: this.search.endDate,
        page: this.pageIndex,
        limit1: this.pageSize
      }
      params = this.$qs.stringify(params)
      this.$Indicator.open({
        text: '加载中...',
        spinnerType: 'fading-circle'
      })
      this.$axios({
        method: 'post',
        url: '/ezx_syset/v1.0/selQRCodePosition',
        data: params
      }).then((res) => {
        this.$Indicator.close()
        if (res.data.result === 'Sucess') {
          // 条数
          const totalCount = Number.parseInt(res.data.data1.total)
          const allLoaded = this.pageIndex * this.pageSize >= totalCount
          this.allLoaded = allLoaded
          // 点位名称
          this.posname = res.data.data1.position_name || ''
          // 列表数据
          this.listDate = this.listDate.concat(res.data.data1.message)
        } else {
          const code = res.data.error_code
          if (code === 10127) {
            this.$Toast({
              message: '操作过于频繁，请五分钟之后再试！'
            })
          } else if (code === 10128) {
            this.$Toast({
              message: '今日查询次数已达到上限！'
            })
          } else {
            this.$Toast({
              message: '加载失败'
            })
          }
        }
      }).catch(() => {
        this.$Indicator.close()
        this.$Toast({
          message: '加载失败'
        })
      })
    },
    /* 日期选择器 */
    dateClick () {
      this.$refs.startPicker.open()
    },
    startDateConfirm () {
      this.$refs.endPicker.open()
    },
    endDateConfirm () {
      // 判断跨度
      const dateState = this.getDateDiff(this.nowSearch.startDate, this.nowSearch.endDate)
      // 当前时间选择器
      let startDate = this.search.startDate
      startDate = new Date(startDate.replace(/-/g, '/'))
      let endDate = this.search.endDate
      endDate = new Date(endDate.replace(/-/g, '/'))
      this.nowSearch = {
        startDate: startDate,
        endDate: endDate
      }
      if (dateState) {
        this.$Toast({
          message: '日期跨度不能超过90天'
        })
        return
      }
      this.pageIndex = 0
      this.allLoaded = false
      this.listDate = []
      // 获取列表数据
      this.getListData()
    },
    formatDatePicker (str) {
      if (!str) { return '' }
      let value = new Date(str)
      let year = value.getFullYear()
      let month = value.getMonth() + 1 + ''
      month = month.padStart(2, '0')
      let day = value.getDate() + ''
      day = day.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 获取跨越天数
    getDateDiff (date1, date2) {
      let startTime = ''
      let endTime = ''
      let seaDuration = ''
      let time1 = date1.getTime()
      let time2 = date2.getTime()
      if (time1 <= time2) {
        startTime = time1
        endTime = time2
        seaDuration = time2 - time1
      } else {
        startTime = time2
        endTime = time1
        seaDuration = time1 - time2
      }
      const maxDuration = 1000 * 60 * 60 * 24 * 90
      if (seaDuration > maxDuration) {
        return true
      } else {
        const startDate = this.formatDatePicker(startTime)
        const endDate = this.formatDatePicker(endTime)
        this.search = {
          startDate: startDate,
          endDate: endDate
        }
        return false
      }
    },
    /* 下拉刷新 */
    loadTop () {
      this.pageIndex = 0
      this.allLoaded = false
      this.listDate = []
      // 获取列表数据
      this.getListData()
      this.$refs.loadmore.onTopLoaded()
    },
    /* 上拉加载 */
    loadBottom () {
      // 获取列表数据
      this.getListData()
      this.$refs.loadmore.onBottomLoaded()
    }
  },
  filters: {
    formatDate (str) {
      if (!str) { return '' }
      let value = new Date(str)
      let year = value.getFullYear()
      let month = value.getMonth() + 1 + ''
      month = month.padStart(2, '0')
      let day = value.getDate() + ''
      day = day.padStart(2, '0')
      let hour = value.getHours() + ''
      hour = hour.padStart(2, '0')
      let minutes = value.getMinutes() + ''
      minutes = minutes.padStart(2, '0')
      let seconds = value.getSeconds() + ''
      seconds = seconds.padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
    }
  }
}
</script>

<style lang="less" scoped>
  .details{
    .mint-header{
      height: 45px;
      font-size: 16px;
      background: #5fa0fe;
    }
    .main{
      padding-top: 45px;
      background: #f0f0f0;
      .date{
        display: flex;
        height: 40px;
        padding-left: 15px;
        padding-right: 15px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        .txt{
          font-size: 14px;
          color: #646565;
        }
        .time-frame{
          .time{
            font-size: 14px;
            color: #5fa0fe;
          }
          .icon{
            display: inline-block;
            width: 10px;
            height: 10px;
            border-top: 1px solid #646565;
            border-right: 1px solid #646565;
            transform: rotate(45deg);
            -webkit-transform: rotate(45deg);
          }
        }
      }
      .pos-name{
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        padding-left: 15px;
        padding-right: 15px;
        background: #ffffff;
        .name{
          font-size: 14px;
          color: #646565;
        }
        .price{
          max-width: 220px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          font-size: 14px;
          color: #272727;
        }
      }
      .list{
        .item{
          margin-bottom: 10px;
          background: #ffffff;
          .chunk-line{
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 40px;
            padding-left: 15px;
            padding-right: 15px;
            padding-top: 10px;
            padding-bottom: 10px;
            .name{
              font-size: 14px;
              color: #646565;
            }
            .price{
              max-width: 220px;
              /*white-space: nowrap;*/
              /*text-overflow: ellipsis;*/
              /*overflow: hidden;*/
              font-size: 14px;
              color: #272727;
            }
          }
          .chunk-region{
            display: flex;
            flex-direction: column;
            padding: 5px 15px;
            .name{
              height: 30px;
              line-height: 30px;
              font-size: 14px;
              color: #646565;
            }
            .price{
              text-indent: 2em;
              line-height: 25px;
              font-size: 14px;
              color: #272727;
            }
          }
          .chunk{
            border-bottom: 2px solid #f0f0f0;
            &:last-of-type{
              border-bottom: none;
            }
          }
        }
      }
      .load-hint{
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        text-align: center;
        color: #797979;
      }
    }
  }
</style>
