import { SETLIST_API_KEY } from '$env/static/private';
import { stokeVenues } from '$lib/config/music-config';

export async function load() {
    const venueId = "63d76a7f"; // Shelleys
    const venue = stokeVenues.find(v => v.id === venueId);

    const res = await fetch(
        `https://api.setlist.fm/rest/1.0/venue/${venueId}/setlists?p=1`,
        {
            headers: {
                'x-api-key': SETLIST_API_KEY,
                'Accept': 'application/json'
            }
        }
    );

    const data = await res.json();
    const rawGigs = data.setlist || [];

    const gigs = rawGigs.map(gig => {
        return {
            id: gig.id,
            artist: gig.artist ? gig.artist.name : 'Unknown Artist',
            date: gig.eventDate,
            year: parseInt(gig.eventDate.split('-')[2]),
            sets: gig.sets && gig.sets.set ? gig.sets.set : [],
            url: gig.url
        };
    });

    return { venue, gigs };
}
