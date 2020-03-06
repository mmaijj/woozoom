/**
 * 各种画echarts图表的方法都封装在这里
 * 注意：这里echarts没有采用按需引入的方式，只是为了方便学习
 */

import echarts from 'echarts'
const install = function (Vue) {
  Object.defineProperties(Vue.prototype, {
    $chart: {
      get () {
        return {
          // 画一条简单的线
          line1: function (id, yAxis, xAxis) {
            this.chart = echarts.init(document.getElementById(id))
            this.chart.clear()

            const optionData = {
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
              },
              yAxis: {
                type: 'value'
              },
              grid: {
                left: '3%',
                containLabel: true
              },
              tooltip: {
                trigger: 'axis',
                formatter: '作业面积 : {c}亩'
              },
              series: [{
                data: yAxis,
                type: 'line',
                smooth: true,
                lineStyle: {
                  color: '#4388ff'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: '#4388ff' // 0% 处的颜色
                    }, {
                      offset: 1, color: '#ffffff' // 100% 处的颜色
                    }],
                    global: false
                  }
                }
              }]
            }
            this.chart.setOption(optionData)
          },
          bar1: function (id, yAxis, xAxis) {
            this.chart = echarts.init(document.getElementById(id))
            this.chart.clear()

            const optionData = {
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow'
                }
              },
              grid: {
                left: '3%',
                containLabel: true
              },
              xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01]
              },
              yAxis: {
                type: 'category',
                inverse: true,
                data: xAxis
              },
              series: [
                {
                  type: 'bar',
                  data: yAxis,
                  barWidth: 20,
                  itemStyle: {
                    color: '#4388ff'
                  }
                }
              ]
            }
            this.chart.setOption(optionData)
          }
        }
      }
    }
  })
}

export default {
  install
}
