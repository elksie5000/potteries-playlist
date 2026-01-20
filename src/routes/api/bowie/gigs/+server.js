import { json } from '@sveltejs/kit';
import { SETLIST_API_KEY } from '$env/static/private';

export async function GET({ url }) {
    const venueId = url.searchParams.get('venueId');
    
    const response = await fetch(
        `https://api.setlist.fm/rest/1.0/venue/${venueId}/setlists?p=1`, 
        {
            headers: {
                'x-api-key': SETLIST_API_KEY,
                'Accept': 'application/json'
            }
        }
    );

    const data = await response.json();
    // This returns the 'Haystack'. We will filter this in the UI.
    return json(data.setlist || []);
}