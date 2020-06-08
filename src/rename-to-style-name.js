import sketch from "sketch";
import {
  log,
  info,
  isLayer,
  getAllSubLayers,
  checkLayerName,
  checkLayerNameForDeleteStyleName,
  isFunction,
} from "./utils";

/*
documentation: https://developer.sketchapp.com/reference/api/

1. 可以安装 Sketch 官方提供的 devTool 以方便调试，可以通过 devTool 查看用户行为触发了哪些事件
2. Sketch 官方的开发文档比较简陋，基本上无法只通过阅读文档开发出一个成品插件
3. 该插件参考了：https://github.com/tbrasington/rename-layers-based-on-textstyle
4. Sketch DOM 可以理解为 Sketch 的视图结构，依次分别是：document > page > artBoard > layer
5. 该插件需要读取共享的外观样式名称，并应用到图层名称上，因此需要通过 layer 找到 sharedStyle
6. document, page, artBoard, layer, sharedStyle 等都有一些自带的属性（比如：name、class），但获取它们并不能直接通过 layer.name 的方式来获取，而是要通过 layer.name() 的方式来获取（可以把 layer.name() 理解为一次 jsBridge 通信）
7. layer 是有嵌套关系的，是一个树结构，因此如果要获取一个 artBoard 中所有的 layer，应当递归遍历它们
8. layer.class() === MSLayerGroup 来判断 layer 是一个组还是一个图层
9. onDocumentChanged 是 Sketch 59 之后提供的 API，这一年来有过许多变更，因此也不能保证该插件可以兼容后期的 Sketch 版本
10. onDocumentChanged 事件返回的数据结构：context > actionContext(changes) > object, id, property...
*/

// 监听文档变化，Sketch 59 之后有的 API
// Document Changes：https://developer.sketch.com/plugins/document-changes
export function onDocumentChanged(context) {
  // console.time('onDocumentChanged');
  // log('------------ onDocumentChanged begin ------------');

  const changes = context.actionContext;
  const length = changes.length;
  // log('changes', changes);

  for (let i = 0; i < length; i++) {
    const change = changes[i];
    const obj = change.object();

    // 查看 change 的属性值
    // info(
    //   'change:',
    //   change,
    //   '\n',

    //   'change.propertyName:',
    //   (change.propertyName && change.propertyName()) || null,
    //   '\n',

    //   'change.property:',
    //   (change.property && change.property()) || null,
    //   '\n',

    //   'change.object:',
    //   obj,
    //   '\n',

    //   'object.sharedStyle:',
    //   obj.sharedStyle && obj.sharedStyle(),
    //   '\n',

    //   'object.description:',
    //   obj.description(),
    //   '\n',

    //   'String(change.propertyName()):',
    //   String(change.propertyName()),
    //   '\n'
    // );

    // 根据 change.propertyName === 'sharedStyleID' 精准判断，只有 sharedStyle （共享样式）发生变化的时候才做处理
    // fix: 解决使用该插件后 Sketch 无法撤销修改的问题
    // change.propertyName() 返回的是一个特殊的 Object，但可以转成字符串，比如：String(change.propertyName()) === 'sharedStyleID' 是成立的
    if (
      obj &&
      isFunction(change.propertyName) &&
      String(change.propertyName()) === "sharedStyleID" &&
      isLayer(obj)
    ) {
      // log('checkLayerName');
      checkLayerName(obj);
      break;
    }
  }

  // log('------------ onDocumentChanged end ------------');
  // console.timeEnd('onDocumentChanged');
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
    layers.forEach(checkLayerName);
  } catch (e) {
    document.showMessage(e.message);
    console.error(e);
  }
}

// 点击菜单 插件 -> sketch-layer-name -> 还原图层名称 按钮，执行 删除附加的 #图层名称#
export function deleteStyleName(context) {
  const { document } = context;
  try {
    const pages = document.pages();
    const layers = [];
    pages.forEach((page) => {
      page.artboards().forEach((artboard) => {
        layers.push(...getAllSubLayers(artboard));
      });
    });
    layers.forEach(checkLayerNameForDeleteStyleName);
  } catch (e) {
    document.showMessage(e.message);
    console.error(e);
  }
}


// 弃用，监听 ArtboardChanged.begin 事件，并执行重命名
// export function onArtboardChanged(context) {
//   // 如果是事件触发的函数，则需要读取 context.actionContext
//   context = context.actionContext;
//   const { document, oldArtboard, newArtboard } = context;
//   try {
//     // 经过测试，在两个 artBoard 之间切换的时候，oldArtboard 的值始终为 null
//     // 因此无法做到只更新 oldArtboard 的图层名称
//     const pages = document.pages();
//     const layers = [];
//     pages.forEach((page) => {
//       page.artboards().forEach((artboard) => {
//         layers.push(...getAllSubLayers(artboard));
//       });
//     });
//     layers.forEach(checkLayerName);
//   } catch (e) {
//     document.showMessage(e.message);
//     console.error(e);
//   }
// }
