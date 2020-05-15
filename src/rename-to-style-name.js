import sketch from 'sketch';
import rename from './rename';
// documentation: https://developer.sketchapp.com/reference/api/

// export function onApplySharedLayerStyle(context) {
//   context.actionContext.document.showMessage('ApplySharedLayerStyle');
// }

// export function onDetachSharedStyle(context) {
//   context.actionContext.document.showMessage('DetachSharedStyle');
// }

// export function onDocumentSaved(context) {
//   context.actionContext.document.showMessage('DocumentSaved');
// }

export default function (context) {
  try {
    const pages = context.document.pages();

    const getAllLayers = function (layer) {
      const layers = [];
      layer.layers().forEach((_layer) => {
        layers.push(_layer);
        if (_layer.class() === MSLayerGroup) {
          layers.push(...getAllLayers(_layer));
        }
      });
      return layers;
    };

    const layers = [];
    pages.forEach((page) => {
      page.artboards().forEach((artboard) => {
        layers.push(...getAllLayers(artboard));
      });
    });

    // 修改名称
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
  } catch (e) {
    context.document.showMessage(e.message);
  }
}
