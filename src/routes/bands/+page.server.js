import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export const load = async () => {
    // Fetch all gigs ordered by date
    const { data: gigs, error } = await supabaseAdmin
        .from('gigs')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('Supabase load error:', error);
        return { archive: [] };
    }

    let archive = [];

    // ETL: Transform Flat DB Rows -> Timeline Application Shape
    // The DB rows are already close to what we need, but we need to calculate Decade/Year/Month
    // and ensure the shape matches what the Grid expects.

    gigs.forEach((gig) => {
        const dateObj = new Date(gig.date);
        const year = dateObj.getFullYear();
        const monthIndex = dateObj.getMonth();
        const monthName = dateObj.toLocaleString('default', { month: 'long' });
        const decade = Math.floor(year / 10) * 10;

        archive.push({
            id: gig.id,
            date: gig.date, // "YYYY-MM-DD"
            year: year,
            month: monthName,
            decade: decade,
            venue: gig.venue,
            artist: gig.artist,
            genre: gig.genre,
            has_songs: gig.has_songs,
            songs: gig.songs || [],
            url: gig.url || '',
            notes: gig.notes || ''
        });
    });

    // The frontend `groupedArtists` logic sorts by Artist, so we don't need timeline sorting here?
    // Wait, the Timeline Grid (`group by date`) loop needs chronological.
    // We fetched `order by date ups`, so it's good.

    return {
        archive
    };
};
