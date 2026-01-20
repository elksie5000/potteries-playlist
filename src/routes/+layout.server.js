import timelineData from '$lib/data/timeline_data.json';

export const load = async () => {
    try {
        // Use imported JSON directly
        const rawData = timelineData;
        const gigs = [];

        rawData.forEach((row) => {
            const { Year, Month, DateStr, ...venues } = row;
            const year = typeof Year === 'number' ? Year : new Date(DateStr).getFullYear();
            const decade = Math.floor(year / 10) * 10;

            Object.entries(venues).forEach(([venueName, venueGigs]) => {
                if (Array.isArray(venueGigs)) {
                    venueGigs.forEach((g, idx) => {
                        gigs.push({
                            id: `${DateStr}-${venueName}-${idx}`,
                            date: DateStr,
                            year: year,
                            month: Month,
                            decade: decade,
                            venue: venueName,
                            artist: g.artist,
                            has_songs: g.has_songs || false,
                            url: g.url || '',
                            mbid: g.mbid || '',
                            full_lineup: g.artist
                        });
                    });
                }
            });
        });

        const decades = [...new Set(gigs.map((g) => g.decade))].sort((a, b) => a - b);

        return {
            archive: gigs.sort((a, b) => a.date.localeCompare(b.date)),
            decades,
            meta: {
                totalGigs: gigs.length
            }
        };
    } catch (e) {
        console.error('Failed to load Timeline Data:', e);
        return { archive: [], decades: [] };
    }
};
