import { getValue } from '@/config/RedisConfig';

const checkCode = async (key, value) => {
  const redisData = await getValue(key);

  if (!redisData) return false;

  // 传递的二维码可能是大写或者小写
  if (redisData.toLowerCase() === value.toLowerCase()) {
    return true;
  } else {
    return false;
  }
};

export { checkCode };
