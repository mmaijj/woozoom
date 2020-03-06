const PI = 3.14159265358979324
// const x_pi = 3.14159265358979324 * 3000.0 / 180.0
export default {
  methods: {
    delta  (lat, lon) {
      // Krasovsky 1940
      //
      // a = 6378245.0, 1/f = 298.3
      // b = a * (1 - f)
      // ee = (a^2 - b^2) / a^2;
      let a = 6378245.0 //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
      let ee = 0.00669342162296594323 //  ee: 椭球的偏心率。
      let dLat = this.transformLat(lon - 105.0, lat - 35.0)
      let dLon = this.transformLon(lon - 105.0, lat - 35.0)
      let radLat = lat / 180.0 * PI
      let magic = Math.sin(radLat)
      magic = 1 - ee * magic * magic
      let sqrtMagic = Math.sqrt(magic)
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI)
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI)
      return { 'lat': dLat, 'lon': dLon }
    },

    // GPS---高德
    gcj_encrypt (wgsLat, wgsLon) {
      if (this.outOfChina(wgsLat, wgsLon)) { return { 'lat': wgsLat, 'lon': wgsLon } }

      let d = this.delta(wgsLat, wgsLon)
      return { 'lat': wgsLat + d.lat, 'lon': wgsLon + d.lon }
    },
    outOfChina (lat, lon) {
      if (lon < 72.004 || lon > 137.8347) { return true }
      if (lat < 0.8293 || lat > 55.8271) { return true }
      return false
    },
    transformLat (x, y) {
      let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
      ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0
      ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0
      ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0
      return ret
    },
    transformLon  (x, y) {
      let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
      ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0
      ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0
      ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0
      return ret
    }
  }
}
