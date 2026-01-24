import timelineData from '$lib/data/timeline_data.json';

/**
 * PHASE 3: DATA INJECTION (Production Loader)
 * Source: src/lib/data/timeline_data.json (Wide/Pivoted)
 * Target: +page.svelte (Flat Archive Array)
 */
export const load = async () => {
    let archive = [];
    let decades = new Set();

    // 1. Iterate through the raw source
    timelineData.forEach((row) => {
        // Destructure metadata, remaining keys are Venues
        const { Year, Month, DateStr, ...venues } = row;

        const yearInt = parseInt(Year);
        // Calculate Decade (e.g., 1978 -> 1970)
        const decade = Math.floor(yearInt / 10) * 10;
        decades.add(decade);

        // 2. Flatten Venues (Convert Object Keys to "venue" property)
        Object.entries(venues).forEach(([venueName, gigs]) => {
            if (Array.isArray(gigs)) {
                gigs.forEach((gig) => {
                    // 3. Inject into Master Archive
                    archive.push({
                        id: gig.mbid || `${DateStr}-${venueName}-${gig.artist}`.replace(/\s+/g, '-').toLowerCase(),
                        date: DateStr,
                        year: yearInt,
                        month: Month,
                        decade: decade,
                        venue: venueName, // CRITICAL: This connects to the Venue Filter
                        artist: gig.artist,
                        has_songs: gig.has_songs || false,
                        songs: gig.songs || [],
                        url: gig.url || '',
                        notes: gig.notes || ''
                    });
                });
            }
        });
    });

    // 4. Sort Descending (Newest first)
    archive.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
        archive,
        decades: Array.from(decades).sort((a, b) => a - b)
    };
};
