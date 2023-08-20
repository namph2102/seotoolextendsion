import RequestPattern from "./handlerequest";
// ErrorHandler.js
const ErrorHandler = (err, req, res, next) => {
  try {
    const errStatus = err.statusCode || 404;
    const errMsg = err.message || "Something went wrong";

    res.status(203).json({
      status: false,
      statusCode: errStatus,
      message: errMsg,
      stack:
        process.env.NODE_ENV == "development"
          ? JSON.stringify(err.stack)
          : "Error Stack",
    });
  } catch {}
};
class MiddleWare {
  static async HandleLimitRequest(req, res, next) {
    const ip = res.header["x-forwarded-for"] || res.connection.remoteAddress;
    try {
      if (ip) {
        const data = await new RequestPattern(ip, 60).handleResquet();
        if (data.status) {
          next();
          return;
        } else {
          throw new Error(data.message);
        }
      }
      throw new Error("Dữ liệu không tồn tại");
    } catch (error) {
      ErrorHandler(error, req, res);
    }
  }
}
export default MiddleWare;
