import RedisServer from "../redis/redis.config";

class RequestPattern {
  _requestInSecond = 60; // số lượng request   chấp nhận trong _timeResquest
  _timeResquest = 60; // thời gian biến tồn tại
  _key = `${Math.floor(Math.random() * 2000 + 1)}`;
  constructor(key, requestInSecond = 60) {
    this._key = key;
    this._requestInSecond = requestInSecond;
  }
  async setExpire() {
    // Đặt thời gian cho biến
    return RedisServer.expire(this._key, this._timeResquest);
  }
  async getTTL() {
    // lấy tohi72 gian còn lại
    return RedisServer.ttl(this._key);
  }
  async setIncr() {
    return RedisServer.incr(this._key);
  }
  async handleResquet() {
    let ttl;
    let totalRequest;
    try {
      totalRequest = await this.setIncr();
      ttl;
      if (totalRequest == 1) {
        await this.setExpire();
        ttl = 60;
      } else {
        ttl = await this.getTTL();
        if (ttl < 0) {
          await this.setExpire();
          ttl = 60;
          totalRequest = 0;
        }
      }
      if (totalRequest <= this._requestInSecond) {
        return {
          status: true,
          totalRequest,
          ttl,
          message: "Có thể pass",
        };
      } else {
        throw new Error("Server busy");
      }
    } catch (error) {
      return {
        status: false,
        totalRequest,
        ttl,
        message: error.message,
      };
    }
  }
}
export default RequestPattern;
