const axios = require('axios');
const tunnel = require('tunnel');

const validateProxies = async (req, res, next) => {
  const {proxies} = req.body;
  const MAX_CONCURRENT_REQUESTS = 20;
  const validProxies = [];
  const invalidProxies = [];
  let currentRequests = 0;
  const requestQueue = [...proxies];

  const checkProxy = async (proxy) => {
    const instance = axios.create({
      httpsAgent:
        proxy.host && proxy.port
          ? tunnel.httpsOverHttp({
              proxy: {
                host: proxy.host,
                port: proxy.port,
                proxyAuth: proxy.username && proxy.password ? `${proxy.username}:${proxy.password}` : undefined,
              },
            })
          : null,
    });

    try {
      const {data, status} = await instance.get('https://ipinfo.io/json');
      const {country, org} = data;
      status === 200 ? validProxies.push({...proxy, country, org}) : invalidProxies.push(proxy);
    } catch {
      invalidProxies.push(proxy);
    } finally {
      currentRequests--;
      processNextRequest();
    }
  };

  const processNextRequest = () => {
    while (requestQueue.length > 0 && currentRequests < MAX_CONCURRENT_REQUESTS) {
      currentRequests++;
      checkProxy(requestQueue.shift());
    }
  };

  processNextRequest();

  const waitForAllRequests = async () => {
    while (currentRequests > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  await waitForAllRequests();

  req.validProxies = validProxies;
  req.invalidProxies = invalidProxies;
  next();
};

module.exports = {validateProxies};
