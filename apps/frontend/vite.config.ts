import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => ({
	envDir: ".",
	envPrefix: "VITE_",
	build: {
		rollupOptions: isSsrBuild
			? {
					input: "./server/app.ts",
				}
			: undefined,
	},
	
	plugins: [reactRouter(), tsconfigPaths()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
