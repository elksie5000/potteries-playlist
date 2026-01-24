import { writable } from 'svelte/store';

// Navigation State
// activeDrawer: { type: 'gig' | 'band' | 'classic', data: any } | null
export const activeDrawer = writable(null);

export function openDrawer(type, data) {
    activeDrawer.set({ type, data });
}

export function closeDrawer() {
    activeDrawer.set(null);
}
