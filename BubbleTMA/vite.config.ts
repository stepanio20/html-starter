import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import inject from '@rollup/plugin-inject'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  define: {
    global: 'window',
  },
  build: {
		rollupOptions: {
			plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
		},
	},
})