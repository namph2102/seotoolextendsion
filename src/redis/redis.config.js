import { createClient } from "redis";
const RedisServer = createClient({
  password: "uVP2uQwxrDZVVPbcwWXY5aumdYezo5QM",
  socket: {
    host: "redis-13027.c292.ap-southeast-1-1.ec2.cloud.redislabs.com",
    port: 13027,
  },
});
const handleShowLogin = (message) => {
  console.log("--------------------REDIS-------------------------");
  console.log(message);
  console.log("---------------------END REDIS------------------------");
};

RedisServer.connect()
  .then(() => handleShowLogin("Connect Redis successfully"))
  .catch(() => handleShowLogin("ERROR CONNECTING REDIS"));

export default RedisServer;
