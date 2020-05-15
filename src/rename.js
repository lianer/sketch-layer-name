const rename = function (name, styleName) {
  const leftLimit = '# ';
  const rightLimit = ' # ';
  const leftIndex = name.indexOf(leftLimit);
  const rightIndex = name.indexOf(rightLimit, leftIndex + 1);

  if (leftIndex > -1 && rightIndex > -1) {
    return (
      leftLimit +
      styleName +
      rightLimit +
      name.slice(rightIndex + rightLimit.length)
    );
  }
  return leftLimit + styleName + rightLimit + name;
};

// 文本1  =>  // # core1 # 文本1
// console.log(rename('文本1', 'core1'));
// console.log(rename('//neu9//按钮2', 'core1'));
// console.log(rename('//core1//图片3', 'core1'));

export default rename;
