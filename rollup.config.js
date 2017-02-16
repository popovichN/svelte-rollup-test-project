import svelte from 'rollup-plugin-svelte';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: './app/main.js',
	dest: './app/bundle.js',
	format: 'iife',
	plugins: [
		svelte(),
		nodeResolve()
	]
};
