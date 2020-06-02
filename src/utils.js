export const log = function (...args) {
  const d = new Date();
  const f = (v) => (v < 10 ? '0' + v : String(v));
  const t = `${f(d.getHours())}:${f(d.getMinutes())}:${f(d.getSeconds())}`;
  console.log(t, ...args);
};

export const isFunction = function (fn) {
  return typeof fn === 'function';
};

export const isLayer = function (obj) {
  if (!obj) {
    return false;
  }
  return isFunction(obj.sharedStyle);
};

// 递归查找所有子图层（包含入参 layer 本身）
export const getAllSubLayers = function (layer) {
  const layers = [];
  const recursionFindLayers = function (layer) {
    layers.push(layer);
    // 判断是否有子图层
    // 1. 可根据类判断（但这样判断容易缺少类型，未来 Sketch 如果有新增加类型，则兼容性会不太好）
    //    layer.class() === MSLayerGroup || layer.class() === MSArtboardGroup || layer.class() === MSShapeGroup
    // 2. 也可根据是否有 layers 函数判断
    //    typeof layer.layers === 'function'
    if (isFunction(layer.layers)) {
      layer.layers().forEach(recursionFindLayers);
    }
  };
  recursionFindLayers(layer);
  return layers;
};

// 文本重命名，e.g: 请选择 => # Reg/14/neu7 # 请选择
export const rename = function (name, styleName) {
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

// 检查所有图层的共享样式和名称并修改图层名称
export const checkLayerName = function (layer) {
  if (isLayer(layer)) {
    const sharedStyle = layer.sharedStyle();
    if (sharedStyle) {
      const oldLayerName = layer.name();
      const newLayerName = rename(oldLayerName, sharedStyle.name());
      if (newLayerName !== oldLayerName) {
        layer.name = newLayerName;
      }
    }
  }
};
