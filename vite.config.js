import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/megaion_client_3/",
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
});
