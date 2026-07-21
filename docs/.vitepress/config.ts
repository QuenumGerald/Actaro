import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Actaro",
  description: "Verify that AI agent actions produced their intended real-world effects.",
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'API Docs', link: '/api/' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/QuenumGerald/Actaro' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Actaro Contributors'
    }
  }
})
