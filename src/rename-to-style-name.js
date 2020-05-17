import sketch from 'sketch';
import rename from './rename';
// documentation: https://developer.sketchapp.com/reference/api/

/*
1. 可以安装 Sketch 官方提供的 devTool 以方便调试，可以通过 devTool 查看用户行为触发了哪些事件
2. Sketch 官方的开发文档比较简陋，基本上无法只通过阅读文档开发出一个成品插件
3. 该插件参考了：https://github.com/tbrasington/rename-layers-based-on-textstyle
4. Sketch DOM 可以理解为 Sketch 的视图结构，依次分别是：document > page > artBoard > layer
5. 该插件需要读取共享的外观样式名称，并应用到图层名称上，因此需要通过 layer 找到 sharedStyle
6. document, page, artBoard, layer, sharedStyle 等都有一些自带的属性（比如：name、class），但获取它们并不能直接通过 layer.name 的方式来获取，而是要通过 layer.name() 的方式来获取（可以把 layer.name() 理解为一次 jsBridge 通信）
7. layer 是有嵌套关系的，是一个树结构，因此如果要获取一个 artBoard 中所有的 layer，应当递归遍历它们
8. layer.class() === MSLayerGroup 来判断 layer 是一个组还是一个图层
*/

// 递归查找所有子图层（包含入参 layer 本身）
const getAllSubLayers = function (layer) {
  const recursionFindLayers = function (layer) {
    const layers = [layer];
    layer.layers().forEach((_layer) => {
      layers.push(_layer);
      if (_layer.class() === MSLayerGroup) {
        layers.push(...recursionFindLayers(_layer));
      }
    });
    return layers;
  };
  return recursionFindLayers(layer);
};

// 检查所有图层的共享样式和名称并修改图层名称
const checkLayersName = function (layers) {
  layers.forEach((layer, i) => {
    const sharedStyle = layer.sharedStyle();
    const oldName = layer.name();
    if (sharedStyle) {
      const styleName = sharedStyle.name();
      const newName = rename(oldName, styleName);
      if (newName !== oldName) {
        layer.name = newName;
      }
    }
  });
};

// 监听文档变化，Sketch 59 之后有的 API
// TODO: 这个函数主要用于优化性能，理论上来说提供用户主动触发和 ArtboardChanged 两个途径基本已满足使用，如果视觉那边确定推动摹客了，那再继续完善此处的逻辑
// Document Changes：https://developer.sketch.com/plugins/document-changes
export function onDocumentChanged(context) {
  const changes = context.actionContext;
  changes.forEach((change) => {
    const type = change.type();
    // 1 - 属性变化
    if (type === 1) {
      // const properties = change.propertyName;
      // console.log(
      //   change,
      //   change.propertyName(),
      //   change.object(),
      //   change.object().sharedStyle()
      // );
    }
  });
}

// 监听 ArtboardChanged 事件，并执行重命名
export function onArtboardChanged(context) {
  // 如果是事件触发的函数，则需要读取 context.actionContext
  context = context.actionContext;
  const { document, oldArtboard, newArtboard } = context;
  try {
    // 经过测试 oldArtboard 不是太准确，在两个 artBoard 之间切换的时候，oldArtboard 的值始终为 null
    // 因此无法做到只更新 oldArtboard 的图层名称
    // console.log('oldArtboard:', oldArtboard);
    // console.log('newArtboard:', newArtboard);
    const pages = document.pages();
    const layers = [];
    pages.forEach((page) => {
      page.artboards().forEach((artboard) => {
        layers.push(...getAllSubLayers(artboard));
      });
    });
    checkLayersName(layers);
  } catch (e) {
    document.showMessage(e.message);
    console.error(e);
  }
}

// 点击菜单 插件 -> sketch-layer-name -> rename-to-style-name 按钮，执行重命名
export function renameToStyleName(context) {
  const { document } = context;
  try {
    const pages = document.pages();
    const layers = [];
    pages.forEach((page) => {
      page.artboards().forEach((artboard) => {
        layers.push(...getAllSubLayers(artboard));
      });
    });
    checkLayersName(layers);
  } catch (e) {
    document.showMessage(e.message);
    console.error(e);
  }
}
