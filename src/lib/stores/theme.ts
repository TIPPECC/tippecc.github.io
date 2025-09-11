import { writable } from 'svelte/store';

type Theme = 'dark' | 'light';

// derive initial value safely (try localStorage, then existing html class, default to 'light')
function getInitialTheme(): Theme {
	try {
		const saved = localStorage.getItem('theme');
		if (saved === 'dark' || saved === 'light') return saved;
	} catch (e) {
		/* ignore */
	}
	if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
		return 'dark';
	}
	return 'light';
}

export const theme = writable<Theme>(getInitialTheme());

// keep DOM and localStorage in sync whenever the store changes
theme.subscribe((t) => {
	if (typeof document !== 'undefined') {
		if (t === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
	try {
		localStorage.setItem('theme', t);
	} catch (e) {
		/* ignore */
	}
});

// helpers for convenience
export function setTheme(t: Theme) {
	theme.set(t);
}

export function toggleTheme() {
	theme.update((v) => (v === 'dark' ? 'light' : 'dark'));
}

// ensure subscription runs once (useful to call from onMount)
export function initTheme() {
	const unsub = theme.subscribe(() => {});
	unsub();
}
