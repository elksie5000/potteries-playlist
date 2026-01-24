import { quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

export const [send, receive] = crossfade({
    duration: 400,
    easing: quintOut,
    fallback(node, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;

        return {
            duration: 300,
            easing: quintOut,
            css: (t) => `
                transform: ${transform} scale(${t});
                opacity: ${t};
            `
        };
    }
});
