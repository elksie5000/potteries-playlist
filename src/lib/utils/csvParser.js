
/**
 * Parse standard CSV string. Handles quoted fields.
 * @param {string} text 
 * @returns {string[]}
 */
function parseLine(text) {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuote) {
            if (c === '"') {
                if (i + 1 < text.length && text[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuote = false;
                }
            } else {
                cur += c;
            }
        } else {
            if (c === '"') {
                inQuote = true;
            } else if (c === ',') {
                result.push(cur);
                cur = '';
            } else {
                cur += c;
            }
        }
    }
    result.push(cur);
    return result;
}

/**
 * Split artist string by ", " separator used in Python script
 */
function splitArtists(str) {
    if (!str) return [];
    return str.split(', ').map(s => s.trim()).filter(s => s);
}

/**
 * Parses the timeline CSV into a flat array of gig objects.
 * @param {string} csvText 
 * @returns {Array<{date: string, year: number, month: string, decade: number, venue: string, artist: string, full_lineup: string}>}
 */
export function parseTimelineCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = parseLine(lines[0]);

    // Configuration based on current CSV structure
    // Headers: [Index/Empty, Venue1, Venue2... , Year, Month, DateStr]
    // Note: Python `to_csv` with index=True usually puts the index name or empty in col 0.

    let yearColIdx = -1;
    let monthColIdx = -1;
    let dateStrColIdx = -1;
    const venueCols = [];

    // Map headers
    headers.forEach((h, i) => {
        const header = h.trim();
        if (header === 'Year') yearColIdx = i;
        else if (header === 'Month') monthColIdx = i;
        else if (header === 'DateStr') dateStrColIdx = i;
        else if (i > 0 && !['Date', ''].includes(header)) {
            // Assume any other column is a venue
            // Note: Col 0 might be blank or 'Date', we skip usually unless it's the only date source
            venueCols.push({ index: i, name: header });
        }
    });

    const gigs = [];

    for (let i = 1; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        if (row.length < headers.length) continue;

        // Extract metadata
        const dateStr = (dateStrColIdx !== -1 ? row[dateStrColIdx] : row[0]).trim();
        const year = yearColIdx !== -1 ? parseInt(row[yearColIdx]) : new Date(dateStr).getFullYear();
        const month = monthColIdx !== -1 ? row[monthColIdx] : '';
        const decade = Math.floor(year / 10) * 10;

        // Iterate venues
        venueCols.forEach(vc => {
            const artistRaw = row[vc.index];
            if (artistRaw && artistRaw.trim()) {
                // We create ONE entry per "Gig" (Venue + Date), keeping full lineup
                // But Prompt asked to "flatten it into an array of gig objects... Note: Some cells contain multiple bands"
                // If we split, we have more rows. 
                // Let's SUPPORT both. 
                // We will flatten for the "Archive" table (so you can find the support act).
                // But maybe we keep a reference to the 'headliner' or full lineup?
                // Let's fully flatten as requested.

                const artists = splitArtists(artistRaw);
                artists.forEach((artist, idx) => {
                    gigs.push({
                        id: `${dateStr}-${vc.name}-${idx}`, // Composite ID
                        date: dateStr,
                        year,
                        month,
                        decade,
                        venue: vc.name,
                        artist: artist,
                        full_lineup: artistRaw // Keep context
                    });
                });
            }
        });
    }

    // Sort by Date
    return gigs.sort((a, b) => a.date.localeCompare(b.date));
}
