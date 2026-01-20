import { writable } from 'svelte/store';

export const activeGig = writable(null);

export function openGig(gig) {
    activeGig.set(gig);
}

export function closeGig() {
    activeGig.set(null);
}
