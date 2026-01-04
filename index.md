---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: ProseSSML
titleTemplate: SSML Editor开发指南

hero:
  name: 'ProseSSML'
  text: 'SSML富文本编辑器'
  tagline: 基于prosemirror的SSML编辑器
  image:
    src: /img/logo.png
  actions:
    - theme: brand
      text: 开始
      link: /befor

features:
  - icon: 🧩
    title: 模块化开发
    details: 基于ProseMirror自定义节点，兼容常规SSML语法和各大厂商的专属语法，提供一个高度兼容的开发思路。自定义插拔插件，轻松实现功能扩展。
  - icon: 🔌
    title: 高度可扩展插件体系与自定义节点
    details: 继承ProseMirror强大插件机制，开发者可通过自定义NodeView、Plugin或Decoration轻松扩展功能。全扩展符合ProseMirror标准，无需修改核心，确保升级零风险。
  - icon: 🔄
    title: 双向序列化与多格式无缝互转
    details: 内置SSML↔HTML双向序列化器。开发者可快速实现与现有系统集成，如从JSON/HTML/Markdown导入生成SSML、导出为不同TTS平台变体，或对接后端存储。
---

<style> :root { --vp-home-hero-name-color: transparent; --vp-home-hero-name-background: -webkit-linear-gradient(-120deg, #1241b7 0%, #59e6f0 50%, #1241b7 100%); } @media (min-width: 640px) { :root { --vp-home-hero-image-filter: blur(56px); } } @media (min-width: 960px) { :root { --vp-home-hero-image-filter: blur(72px); } } </style>
