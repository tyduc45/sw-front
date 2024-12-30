/**
 * 校验 18 位身份证号码，并返回错误信息或通过
 * @param {string} idCard
 * @returns {object} { valid: boolean, message: string }
 */
export function validateID(idCard) {
  // 正则先判断基本结构
  const reg = /^\d{17}[\dX]$/;
  if (!reg.test(idCard) && idCard !== undefined) {
    this.$message.error('身份证长度或格式不正确')
    return { valid: false, message: '身份证长度或格式不正确' };
  }

  let raw_DOB    = idCard.substring(6,14)

  // 提取年份、月份和日期
  const year  = parseInt(raw_DOB.substring(0, 4),10)
  const month = parseInt(raw_DOB.substring(4, 6),10)
  const day   = parseInt(raw_DOB.substring(6, 8),10)

  let date = new Date();

  if (year < 1900 || year > date.getFullYear()) {
    this.$message.error('出生年份不合法')
    return { valid: false, message: '出生年份不合法' };
  }
  if (month < 1 || month > 12) {
    this.$message.error('出生月份不合法')
    return { valid: false, message: '出生月份不合法' };
  }
  /**if (day < 1 || day > 31) {
    this.$message.error('出生日期不合法')
    return { valid: false, message: '出生日期不合法' };
  }*/
  if(month === 2 && year % 4 === 0)
  {
    if(day < 1 || day > 29)
    {
      this.$message.error('出生日期不合法')
      return { valid: false, message: '出生日期不合法' };
    }
  }
  else if(month === 2 && year % 4 !== 0)
  {
    if(day < 1 || day > 28)
    {
      this.$message.error('出生日期不合法')
      return { valid: false, message: '出生日期不合法' };
    }
  }
  else
  {
    if (day < 1 || day > 31) {
      this.$message.error('出生日期不合法')
      return { valid: false, message: '出生日期不合法' };
    }
  }

  // 加权因子、校验码
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codeMap = ['1','0','X','9','8','7','6','5','4','3','2'];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard.charAt(i), 10) * factor[i];
  }
  const remainder = sum % 11;
  const checkCode = codeMap[remainder];
  const lastChar = idCard.charAt(17);

  if (checkCode !== lastChar) {
    this.$message.error('校验码错误')
    return { valid: false, message: '校验码错误' };
  }

  // 如果通过所有检验
  return { valid: true, message: '身份证号码合法' };
}
