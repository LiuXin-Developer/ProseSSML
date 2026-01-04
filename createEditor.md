# 开始构建
vue项目的构建就不赘述。我们直接创建一个最简单的编辑器。
## 创建编辑器

使用你熟悉的包管理器安装如下插件：

::: code-group

```sh [npm]
npm install prosemirror-model prosemirror-state prosemirror-view prosemirror-keymap prosemirror-history prosemirror-dropcursor prosemirror-gapcursor prosemirror-schema-basic
```

```sh [pnpm]
pnpm install prosemirror-model prosemirror-state prosemirror-view prosemirror-keymap prosemirror-history prosemirror-dropcursor prosemirror-gapcursor prosemirror-schema-basic
```

```sh [yarn]
yarn add prosemirror-model prosemirror-state prosemirror-view prosemirror-keymap prosemirror-history prosemirror-dropcursor prosemirror-gapcursor prosemirror-schema-basic
```

:::

使用如下代码创建一个最简单的富文本编辑器

```vue
<template>
  <div ref="editorRef" class="editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { undo, redo, history } from 'prosemirror-history';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { schema as basicSchema } from 'prosemirror-schema-basic';

const editorRef = ref();
let editor: EditorView | null = null;
const mySchema = new Schema({
  nodes: basicSchema.spec.nodes,
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
  editor?.destroy()
  editor = null
})
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
</style>
<style lang="scss">
@use 'prosemirror-view/style/prosemirror.css';
.ProseMirror:focus {
  outline: none; /* 移除焦点时的轮廓 */
}
</style>
```

此时你就获得了一个最简单的富文本编辑器了。他有简单的功能，如撤销、重做、拖拽光标美化等功能。
