import { defineConfig } from 'vite'
import react from '@vitejs/react-swc' // or '@vitejs/plugin-react' depending on what is on line 2

export default defineConfig({
  plugins: [react()],
  base: '/TravelRoom-App/', // Must match your exact repository name from the image!
})
