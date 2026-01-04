# 停顿标记 `<break>`

## 创建自定义节点

```javascript
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
```

toDOM 还可以使用 jsx 构建，具体扩展由大家开发

## 注册自定义节点

在构建 mySchema 的地方，追加注册 breakNode

```javascript
const mySchema = new Schema({
  nodes: basicSchema.spec.nodes.addBefore('paragraph', 'break', breakNode),
});
```

## 插入节点函数

在页面新增一个按钮，点击按钮时调用此函数

```javascript
const insertBreak = () => {
  const selection = editor!.state.selection
  const { from, to } = selection
  const transaction = editor!.state.tr
  const newNode = mySchema.node('break', { time: '0.5' }, [])
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
.break-elem {
  background-color: red;
  color: #fff;
  margin: 0 4px;
}
```

## 得到结果

在页面编辑内容，点击获取 SSML 按钮，控制台会打印出生成的 SSML 字符串。字符串类似于：

`<speak>1231231<break time="0.5"></break>2123</speak>`

至此我们完成了一个简单的停顿标记功能。

## 完整代码

```vue
<template>
  <div ref="editorRef" class="editor-container"></div>
  <div class="btn-view">
    <button @click="insertBreak">停顿</button>
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
const mySchema = new Schema({
  nodes: basicSchema.spec.nodes.addBefore('paragraph', 'break', breakNode),
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
</style>
```
