import { SETLIST_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const setlistId = url.searchParams.get('id');
    if (!setlistId) {
        return json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.setlist.fm/rest/1.0/setlist/${setlistId}`, {
            headers: {
                'x-api-key': SETLIST_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            // Forward error
            return json({ error: 'Upstream Error', status: res.status }, { status: res.status });
        }

        const data = await res.json();
        return json(data);
    } catch (e) {
        console.error("Setlist fetch error:", e);
        return json({ error: e.message }, { status: 500 });
    }
}
