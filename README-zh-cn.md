# sketch-layer-name

重命名图层名称为共享样式名称。

## 开发流程

一、编译生成 .sketchplugin 文件，双击该文件安装到 Sketch 中

```bash
npm run build
```

二、启动开发服务，支持实时修改插件

```bash
npm run watch
```

三、安装 Sketch DevTools，便于调试

https://github.com/skpm/sketch-dev-tools

注意：
1. watch 模式下，如果修改 src/manifest.json 是不会实时生效的，需要在 Sketch 中重新启用一下插件
2. 该插件针对 Sketch 64 开发，其他版本不一定兼容

## 发包流程

一、提交代码

```bash
git add .
git commit -m 'feat: xxx'
npm version <major, minor, patch...>
npm run build
git push origin master --tag
```

二、上传压缩包

1. zip 压缩 sketch-layer-name.sketchplugin
2. 访问：https://github.com/lianer/sketch-layer-name/releases
3. 填写信息，上传 zip 包
4. 完成