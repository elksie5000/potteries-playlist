import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

export async function GET({ url }) {
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return json({ error: 'No URL provided' }, { status: 400 });
    }

    try {
        // Fetch the Setlist.fm page
        // We need headers to look like a browser to avoid 403 blocks sometimes
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            return json({ error: `Failed to fetch setlist.fm: ${response.status}` }, { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const songs = [];

        // Parse Standard Setlist.fm structure
        // Songs are usually in <li class="setlistList-song"> or similar
        // Selectors vary, but commonly: .setlistList a.songLabel

        // Try selecting the song links/spans within the main setlist
        $('.setlistList .songLabel').each((i, el) => {
            const songName = $(el).text().trim();
            if (songName) songs.push(songName);
        });

        // Encores often have their own sections, but usually .setlistList covers them if we just grab all songLabels?
        // Let's also check for covers: "Song Name (Artist Cover)"
        // The text often includes the cover info.

        // If empty, try fallback selectors if setlist.fm changed layout
        if (songs.length === 0) {
            // Sometimes flat list?
            // Just return empty array let client handle it
        }

        return json({ songs });

    } catch (err) {
        console.error('Setlist scrape error:', err);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
