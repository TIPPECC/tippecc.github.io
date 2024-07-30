// src/stores/content.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface Tempresult_selection {
	filename: string;
	foldertype: string;
}

export var content: any;
export var tempresult_selection: any;

if (browser) {
	// Get the value out of storage on load.
	const stored = localStorage.content;
	// or localStorage.getItem('content')

	// Set the stored value or a sane default.
	content = writable(stored || 'HELLO WORLD!');
	tempresult_selection = writable<Tempresult_selection>(
		JSON.parse(localStorage.getItem('tempresult_selection'))
	);

	tempresult_selection.subscribe(
		(value) => (localStorage.tempresult_selection = JSON.stringify(value))
	);

	// Anytime the store changes, update the local storage value.
	content.subscribe((value) => (localStorage.content = value));
	// or localStorage.setItem('content', value)
}
