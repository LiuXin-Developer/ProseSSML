import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'ProseSSML',
  description: 'SSML',
  head: [
    // 添加图标
    ['link', { rel: 'icon', href: '/img/logo.png' }],
  ],
  themeConfig: {
    logo: '/img/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    // nav: [
    //   { text: 'Home', link: '/' },
    //   { text: 'Examples', link: '/markdown-examples' }
    // ],
    footer: {
      message:
        '豫ICP备<a target="_blank" href="https://beian.miit.gov.cn/">2023012476</a>号',
      copyright:
        'Copyright © 2023-present <a target="_blank" href="https://github.com/LiuXIn011">LiuXin</a>',
    },
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: '目录',
        items: [
          { text: '写在前面', link: '/befor' },
          { text: '开始', link: '/start' },
          { text: '构建编辑器', link: '/createEditor' },
          { text: '停顿标记 break', link: '/break' },
          { text: '文本类型标记 say-as', link: '/sayAs' },
          { text: 'SSML和HTML互相转换', link: '/SSMLtoHTML' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LiuXin-Developer/ProseSSML.git' },
    ],
  },
});
