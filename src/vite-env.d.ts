/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // เพิ่ม environment variables อื่นๆ ที่คุณใช้นอกจาก VITE_ ที่นี่
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 