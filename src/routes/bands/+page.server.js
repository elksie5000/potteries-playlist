import timelineData from '$lib/data/timeline_data.json';

export const load = async () => {
    let archive = [];

    // ETL Logic (Same as Root)
    timelineData.forEach((row) => {
        const { Year, Month, DateStr, ...venues } = row;
        const yearInt = parseInt(Year);
        const decade = Math.floor(yearInt / 10) * 10;

        Object.entries(venues).forEach(([venueName, gigs]) => {
            if (Array.isArray(gigs)) {
                gigs.forEach((gig) => {
                    archive.push({
                        id: gig.mbid || `${DateStr}-${venueName}-${gig.artist}`.replace(/\s+/g, '-').toLowerCase(),
                        date: DateStr,
                        year: yearInt,
                        month: Month,
                        decade: decade,
                        venue: venueName,
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

    // Sort Alphabetically for the Bands List (Different from Timeline)
    archive.sort((a, b) => a.artist.localeCompare(b.artist));

    return {
        archive
    };
};
