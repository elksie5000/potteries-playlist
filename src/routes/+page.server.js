import { stokeVenues } from '$lib/config/music-config';
import timelineData from '$lib/data/timeline_data.json';

export async function load() {
    // 1. Define Columns matching the JSON keys
    const targetIds = [
        "63d27eaf", // Golden Torch
        "73d490f1", // Victoria Hall (Config ID - OLD, but we map to Name below)
        "63d76a7f", // Shelleys
        "33d490f1", // Sugarmill (Config ID)
        "3bd490f1", // Wheatsheaf (Config ID)
        "bingley",  // Bingley Hall (Mock ID)
        "6bd6ee66", // Trentham (Config ID - OLD)
        "port-vale",
        "harold-clowes",
        "the-place"
    ];

    const venues = stokeVenues.filter(v => targetIds.includes(v.id));

    // 2. Transform JSON -> Component Data
    // Name -> ID Map
    // CRITICAL: The python script found NEW IDs for some venues, but the JSON keys are still the Venue NAMES ("Trentham Gardens").
    // We just need to map "Trentham Gardens" -> "6bd6ee66" (the ID our frontend uses to identify the column).
    // The mismatch of REAL IDs doesn't matter for the frontend column key, as long as we map Name -> FrontendID.

    const nameToId = {};
    venues.forEach(v => {
        nameToId[v.name] = v.id;
    });

    // Explicit Overrides to ensure matches with Python "Name" keys
    nameToId["Bingley Hall"] = "bingley";
    nameToId["Shelleys Laserdrome"] = "63d76a7f";
    nameToId["Port Vale Stadium"] = "port-vale";
    nameToId["Harold Clowes Hall"] = "harold-clowes";
    nameToId["The Place"] = "the-place";
    nameToId["The Golden Torch"] = "63d27eaf";
    nameToId["Trentham Gardens"] = "6bd6ee66";
    nameToId["Victoria Hall"] = "73d490f1";
    nameToId["The Wheatsheaf"] = "3bd490f1";
    nameToId["The Sugarmill"] = "33d490f1";

    const timeline = timelineData.map(row => {
        const entries = {};

        Object.keys(row).forEach(key => {
            const mappedId = nameToId[key];
            if (mappedId && row[key]) {
                entries[mappedId] = row[key];
            }
        });

        let monthInt = 1;
        if (typeof row.Month === 'string') {
            const d = new Date(`${row.Month} 1, 2000`);
            if (!isNaN(d)) monthInt = d.getMonth() + 1;
        } else {
            monthInt = row.Month || 1;
        }

        return {
            year: row.Year,
            month: monthInt,
            dateStr: row.DateStr,
            entries
        };
    });

    return {
        venues,
        timeline
    };
}
