import { supabaseAdmin } from '$lib/server/supabaseAdmin';

/**
 * PHASE 3: DATA INJECTION (Production Loader)
 * Source: Supabase 'gigs' table
 * Target: +page.svelte (Flat Archive Array)
 */
export const load = async () => {
    // Fetch all gigs ordered by date (descending for timeline? No, maybe descending is better for initial view, 
    // but the timeline loop sorts it or expects specific order? 
    // The previous loader did: archive.sort((a, b) => new Date(b.date) - new Date(a.date)); (DESC)
    const { data: gigs, error } = await supabaseAdmin
        .from('gigs')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Supabase load error:', error);
        return { archive: [], decades: [] };
    }

    let archive = [];
    let decades = new Set();

    // ETL: Transform Flat DB Rows -> Timeline Application Shape
    gigs.forEach((gig) => {
        const dateObj = new Date(gig.date);
        const year = dateObj.getFullYear();
        // Month name from date
        const monthName = dateObj.toLocaleString('default', { month: 'long' });
        const decade = Math.floor(year / 10) * 10;

        decades.add(decade);

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

    return {
        archive,
        decades: Array.from(decades).sort((a, b) => a - b)
    };
};
