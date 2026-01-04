# 写在前面

## 为什么选择 Prosemirror？

[Prosemirror](https://prosemirror.net/)是一个开源JavaScript工具包，专为构建强大富文本编辑器设计。它不是现成编辑器，而是提供模块化组件，让开发者完全自定义文档结构、行为和UI。核心优势在于文档模型严格可控，输出干净语义化内容，支持深度扩展和实时协作。开发者可定义Schema决定允许节点与标记，通过插件系统添加菜单、快捷键、输入规则等功能。相比Quill或CKEditor，它自定义能力更强，上手门槛稍高，但长期维护成本低。目前广泛用于Notion、New York Times编辑器等知名产品。

作者基于国内热门的WangEditor开发过SSML编辑器，参考[Github开源项目](https://github.com/mekumiao/ssml-editor)，出现过严重bug，且该开源项目自身也存在同样的Bug。WangEditor已经停止维护，出现问题不会得到修复。

## 为什么没有开箱即用的组件？

由于需求的差异和各大TTS厂商对SSML支持的差异，作者无法设计出通用的组件，本文档介绍的是一种通用型的开发思路，足以解决大部分问题。

