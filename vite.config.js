import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // named import 방식으로 수정
import tailwindcss from "tailwindcss";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Service Worker 자동 업데이트
      manifest: {
        name: 'tasteofkorea', // 앱 이름
        short_name: 'tok', // 앱의 짧은 이름
        description: 'korea taste awesome PWA App', // 앱 설명
        theme_color: '#FFFFFF', // 앱의 테마 색상
        icons: [
          {
            src: '/android-chrome-192x192.png', // 동일한 아이콘 경로
            sizes: '192x192', // 작은 크기 아이콘
            type: 'image/png', // 파일 타입을 jpg로 수정
          },
          {
            src: '/android-chrome-512x512.png', // 동일한 아이콘 경로
            sizes: '512x512', // 큰 크기 아이콘
            type: 'image/png', // 파일 타입을 jpg로 수정
          },
        ],
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
