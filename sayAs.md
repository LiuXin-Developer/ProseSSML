# 文本类型标记 `<say-as>`

## 创建自定义节点

与 break 标签类似，区别在于标签属性，break 的属性是 time，say-as 的属性是 interpret-as(标记类型)、original(原始文本)

```javascript
const sayAsNode = {
  inline: true,
  group: 'inline',
  content: 'inline*',
  selectable: false,
  draggable: false,
  attrs: {
    original: { default: '' },
    interpret: { default: '' },
  },

  // 定义如何将自定义的phoneme节点渲染成DOM元素
  toDOM(node: any) {
    // 父盒子
    const parentNode = document.createElement('span');
    parentNode.classList.add('sayAs-elem');
    parentNode.setAttribute('data-original', node.attrs.original);
    parentNode.setAttribute('data-interpret', node.attrs.interpret);
    parentNode.setAttribute('contenteditable', 'false');
    // 文字盒子
    const textNode = document.createElement('span');
    textNode.classList.add('sayAs-text-elem');
    textNode.innerText = node.attrs.original;
    // 读法盒子
    const pinyinNode = document.createElement('span');
    pinyinNode.classList.add('sayAs-interpret-elem');
    pinyinNode.innerText = node.attrs.interpret;
    // 添加进去
    parentNode.appendChild(textNode);
    parentNode.appendChild(pinyinNode);
    // 绑定事件
    parentNode.onclick = () => {
      console.log(node);
    };
    return parentNode;
  },
  // 定义如何从DOM中解析出自定义的phoneme节点
  parseDOM: [
    {
      tag: 'say-as',
      getAttrs: (dom: any) => ({
        original: dom.getAttribute('data-original'),
        interpret: dom.getAttribute('data-interpret'),
      }),
    },
  ],
};
```

## 注册自定义节点

在构建 mySchema 的地方，追加注册 breakNode

```javascript
const mySchema = new Schema({
  nodes: basicSchema.spec.nodes
    .addBefore('paragraph', 'break', breakNode)
    .addBefore('paragraph', 'sayAs', sayAsNode),
});
```

## 插入节点函数

与停顿标记不同的是，需要判断文档是否存在选中的文本。

```javascript
const getSelection = () => {
  const selection = editor!.state.selection
  const { from, to, empty } = selection
  const selectedText = editor!.state.doc.textBetween(from, to)
  const selectedNodes = [] as any[]
  editor!.state.doc.nodesBetween(from, to, (node) => {
    selectedNodes.push(node)
  })
  return {
    from,
    to,
    empty,
    selectedText,
    selectedNodes,
  }
}
const customerTag = ['break', 'sayAs']
const insertSayAsNode = () => {
  const { empty, selectedText, selectedNodes } = getSelection()
  // 是否包含自定义节点
  if (selectedNodes.some((item) => customerTag.includes(item.type.name))) {
    alert('请勿重复添加自定义标签')
    return
  }
  // 是否空选区
  if (empty || !selectedNodes || !selectedNodes.length || selectedNodes.length <= 1) {
    alert('请选择需要添加自定义标签的文本')
    return
  }
  const selection = editor!.state.selection
  const { from, to } = selection
  const transaction = editor!.state.tr
  const newNode = mySchema.node('sayAs', { original: selectedText, interpret: 'cardinal' }, [
    mySchema.text(selectedText),
  ])
  transaction.replaceWith(from, to, newNode)
  // 更新选区
  const newSelection = TextSelection.create(transaction.doc, from + newNode.nodeSize)
  // 创建事务并设置选区
  transaction.setSelection(newSelection)
  // 发布更新
  editor!.dispatch(transaction)
}
```

## 获取 SSML 字符函数

在页面新增一个按钮，点击按钮时调用此函数

```javascript
const getSSML = () => {
  if (!editor) return;
  const content = editor.state.doc.content.content;
  let ssml = '';
  content.forEach((node) => {
    if (node.type.name === 'paragraph') {
      node.content.content.forEach((child) => {
        if (child.type.name === 'text') {
          ssml += child.text;
        } else if (child.type.name === 'break') {
          ssml += `<break time="${child.attrs.time}"></break>`;
        } else if (child.type.name === 'sayAs') {
          ssml += `<say-as interpret-as="${child.attrs.interpret}">${child.attrs.original}</say-as>`;
        }
      });
    }
  });
  ssml = `<speak>${ssml}</speak>`;
  console.log(ssml);
};
```

## 增加停顿节点的 css

```css
.sayAs-elem {
  margin: 0 6px;
  vertical-align: top; /* 垂直居中 */
  font-size: 16px;
  white-space: nowrap;
  word-break: keep-all;
  position: relative;
  user-select: text;
  .sayAs-text-elem {
    position: relative;
    &::after {
      content: '';
      width: 100%;
      height: 2px;
      position: absolute;
      bottom: -2.5px;
      left: 0;
      right: 0;
      margin: 0 auto;
      background-color: #06a106;
      border-radius: 1px;
    }
  }
  .sayAs-interpret-elem {
    margin-left: 6px;
    padding: 2px 6px;
    color: #06a106;
    font-size: 12px;
    border-radius: 2px;
    background: #eeffec;
  }
}
```

## 得到结果

在页面编辑内容，点击获取 SSML 按钮，控制台会打印出生成的 SSML 字符串。字符串类似于：

`<speak>asd<break time="0.5"></break>asda<break time="0.5"></break>sda<say-as interpret-as="cardinal">da</say-as>sd</speak>`

至此我们完成了一个简单的文本类型标记功能。

## 完整代码

```vue
<template>
  <div ref="editorRef" class="editor-container"></div>
  <div class="btn-view">
    <button @click="insertBreak">停顿</button>
    <button @click="insertSayAsNode">文本类型</button>
    <button @click="getSSML">获取SSML</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Schema } from 'prosemirror-model';
import { EditorState, Plugin, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { undo, redo, history } from 'prosemirror-history';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { schema as basicSchema } from 'prosemirror-schema-basic';

const editorRef = ref();
let editor: EditorView | null = null;

const breakNode = {
  inline: true,
  group: 'inline',
  content: 'inline*',
  selectable: false,
  draggable: false,
  attrs: {
    time: { default: '' }, // 记录停顿时间
  },

  // 定义如何将自定义的phoneme节点渲染成DOM元素
  toDOM(node: any) {
    // 父盒子
    const parentNode = document.createElement('span');
    parentNode.classList.add('break-elem');
    parentNode.setAttribute('data-time', node.attrs.time);
    parentNode.setAttribute('contenteditable', 'false');
    parentNode.innerText = node.attrs.time;
    // 绑定事件
    parentNode.onclick = () => {
      console.log(node);
    };
    return parentNode;
  },
  // 定义如何从DOM中解析出自定义的phoneme节点
  parseDOM: [
    {
      tag: 'break',
      getAttrs: (dom: any) => ({
        time: dom.getAttribute('data-time'),
      }),
    },
  ],
};

const insertBreak = () => {
  const selection = editor!.state.selection;
  const { from, to } = selection;
  const transaction = editor!.state.tr;
  const newNode = mySchema.node('break', { time: '0.5' }, []);
  transaction.replaceWith(from, to, newNode);
  // 更新选区
  const newSelection = TextSelection.create(
    transaction.doc,
    from + newNode.nodeSize
  );
  // 创建事务并设置选区
  transaction.setSelection(newSelection);
  // 发布更新
  editor!.dispatch(transaction);
};
const getSSML = () => {
  if (!editor) return;
  const content = editor.state.doc.content.content;
  let ssml = '';
  content.forEach((node) => {
    if (node.type.name === 'paragraph') {
      node.content.content.forEach((child) => {
        if (child.type.name === 'text') {
          ssml += child.text;
        } else if (child.type.name === 'phoneme') {
          ssml += `<phoneme alphabet="py" ph="${child.attrs.phoneme}">${child.attrs.original}</phoneme>`;
        } else if (child.type.name === 'break') {
          ssml += `<break time="${child.attrs.time}"></break>`;
        } else if (child.type.name === 'sayAs') {
          ssml += `<say-as interpret-as="${child.attrs.interpret}">${child.attrs.original}</say-as>`;
        }
      });
    }
  });
  ssml = `<speak>${ssml}</speak>`;
  console.log(ssml);
};
const sayAsNode = {
  inline: true,
  group: 'inline',
  content: 'inline*',
  selectable: false,
  draggable: false,
  attrs: {
    original: { default: '' },
    interpret: { default: '' },
  },

  // 定义如何将自定义的phoneme节点渲染成DOM元素
  toDOM(node: any) {
    // 父盒子
    const parentNode = document.createElement('span');
    parentNode.classList.add('sayAs-elem');
    parentNode.setAttribute('data-original', node.attrs.original);
    parentNode.setAttribute('data-interpret', node.attrs.interpret);
    parentNode.setAttribute('contenteditable', 'false');
    // 文字盒子
    const textNode = document.createElement('span');
    textNode.classList.add('sayAs-text-elem');
    textNode.innerText = node.attrs.original;
    // 读法盒子
    const pinyinNode = document.createElement('span');
    pinyinNode.classList.add('sayAs-interpret-elem');
    pinyinNode.innerText = node.attrs.interpret;
    // 添加进去
    parentNode.appendChild(textNode);
    parentNode.appendChild(pinyinNode);
    // 绑定事件
    parentNode.onclick = () => {
      console.log(node);
    };
    return parentNode;
  },
  // 定义如何从DOM中解析出自定义的phoneme节点
  parseDOM: [
    {
      tag: 'say-as',
      getAttrs: (dom: any) => ({
        original: dom.getAttribute('data-original'),
        interpret: dom.getAttribute('data-interpret'),
      }),
    },
  ],
};
const getSelection = () => {
  const selection = editor!.state.selection;
  const { from, to, empty } = selection;
  const selectedText = editor!.state.doc.textBetween(from, to);
  const selectedNodes = [] as any[];
  editor!.state.doc.nodesBetween(from, to, (node) => {
    selectedNodes.push(node);
  });
  return {
    from,
    to,
    empty,
    selectedText,
    selectedNodes,
  };
};
const customerTag = ['break', 'sayAs'];
const insertSayAsNode = () => {
  const { empty, selectedText, selectedNodes } = getSelection();
  // 是否包含自定义节点
  if (selectedNodes.some((item) => customerTag.includes(item.type.name))) {
    alert('请勿重复添加自定义标签');
    return;
  }
  // 是否空选区
  if (
    empty ||
    !selectedNodes ||
    !selectedNodes.length ||
    selectedNodes.length <= 1
  ) {
    alert('请选择需要添加自定义标签的文本');
    return;
  }
  const selection = editor!.state.selection;
  const { from, to } = selection;
  const transaction = editor!.state.tr;
  const newNode = mySchema.node(
    'sayAs',
    { original: selectedText, interpret: 'cardinal' },
    [mySchema.text(selectedText)]
  );
  transaction.replaceWith(from, to, newNode);
  // 更新选区
  const newSelection = TextSelection.create(
    transaction.doc,
    from + newNode.nodeSize
  );
  // 创建事务并设置选区
  transaction.setSelection(newSelection);
  // 发布更新
  editor!.dispatch(transaction);
};
const mySchema = new Schema({
  nodes: basicSchema.spec.nodes
    .addBefore('paragraph', 'break', breakNode)
    .addBefore('paragraph', 'sayAs', sayAsNode),
});
const plugins: Plugin[] = [
  // 启用历史记录
  history(),
  // 基础键绑定
  keymap({
    'Mod-z': undo,
    'Mod-y': redo,
    'Mod-Shift-z': redo,
  }),

  // 历史记录
  keymap({ 'Mod-z': undo, 'Mod-y': redo }),

  // 拖拽光标美化
  dropCursor(),

  // Gap cursor（允许在块节点前后点击）
  gapCursor(),
];
onMounted(() => {
  editor = new EditorView(editorRef.value, {
    state: EditorState.create({
      schema: mySchema,
      plugins,
    }),
    dispatchTransaction(transaction) {
      const newState = editor!.state.apply(transaction);
      editor!.updateState(newState);
    },
  });
});

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<style scoped>
.editor-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 20px;
  width: 800px;
  height: 400px;
  margin: 50px auto;
  background: #fff;
  font-family: Georgia, serif;
}
.btn-view {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
</style>
<style lang="scss">
@use 'prosemirror-view/style/prosemirror.css';
.ProseMirror:focus {
  outline: none; /* 移除焦点时的轮廓 */
}
.break-elem {
  margin: 0 6px;
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  user-select: text;
  display: inline-block;
  vertical-align: middle; /* 垂直居中 */
  padding: 0 6px;
  font-size: 12px;
  background: rgba(55, 57, 219, 0.1);
  color: var(--el-color-primary);
  border-radius: 2px;
  font-weight: bold;
}
.sayAs-elem {
  margin: 0 6px;
  vertical-align: top; /* 垂直居中 */
  font-size: 16px;
  white-space: nowrap;
  word-break: keep-all;
  position: relative;
  user-select: text;
  .sayAs-text-elem {
    position: relative;
    &::after {
      content: '';
      width: 100%;
      height: 2px;
      position: absolute;
      bottom: -2.5px;
      left: 0;
      right: 0;
      margin: 0 auto;
      background-color: #06a106;
      border-radius: 1px;
    }
  }
  .sayAs-interpret-elem {
    margin-left: 6px;
    padding: 2px 6px;
    color: #06a106;
    font-size: 12px;
    border-radius: 2px;
    background: #eeffec;
  }
}
</style>
```
