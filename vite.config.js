import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        '@safe-globalThis/safe-ethers-adapters',
        '@safe-globalThis/safe-core-sdk',
        '@safe-globalThis/safe-ethers-lib',
        '#alloc',
        '#util/as-uint8array'
      ]
    },
    target: 'esnext'
  },
  clearScreen: false,
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
}));