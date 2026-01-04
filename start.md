## 前期准备

了解[SSML](https://www.w3.org/TR/speech-synthesis11)规范。

查看[Prosemirror](https://prosemirror.net/)文档，了解 prosemirror 的基础安装、使用方法。

熟悉[阿里云](https://help.aliyun.com/zh/isi/developer-reference/ssml-overview)TTS 服务的 SSML 语法规范。

## 标签分类

我们将介绍如下几种有代表意义的 SSML 标签，其他标签可以举一反三，处理逻辑是一样的：

#### 根标签 `<speak> <speak/>`

整个 SSML 文档必须以此包裹。我们开发过程中不必理会，在输出结果的时候字符串拼接就行了。

#### 无需选择文本标签： `<break time='0.5s'><break/>`

break是停顿标记，此类标签的特点是：无需选择文本，直接插入标签。可在文档任何位置插入标签

#### 需选择文本标签： `<say-as interpret-as='cardinal'><say-as/>`

say-as是文本类型标记，需要用户框选到文本，获取文本内容后插入标记，且有属性。

## 实现思路
使用Prosemirror的自定义节点机制，创建一个节点，在网页中始终以HTML进行编辑，导出的时候通过js将HTML转换成SSML
![实现思路](/img/hao.png)
