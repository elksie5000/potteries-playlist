import { stokeVenues } from '$lib/config/music-config';

export async function load() {
    // Hardcoded for the narrative
    const venue = stokeVenues.find(v => v.id === "port-vale");

    // We might not find this exact gig in setlist.fm easily under a simple venue ID if it was a festival,
    // or if the venue ID is simulated. For now, we mock the specific data points requested.
    // "Heavy Metal Holocaust" details.

    return {
        venue,
        gigs: [
            {
                artist: "Ozzy Osbourne",
                date: "01-08-1981",
                year: 1981,
                specialNote: "Replaced Black Sabbath. The 'Substitution' Legend.",
                sets: [
                    { name: "Blizzard of Ozz Tour" }
                ],
                url: "https://www.setlist.fm/setlist/ozzy-osbourne/1981/vale-park-stoke-on-trent-england-3bd6e4a8.html"
            },
            {
                artist: "Motörhead",
                date: "01-08-1981",
                year: 1981,
                specialNote: "Co-headliners. The loudest band in the world.",
                url: "https://www.setlist.fm/setlist/motorhead/1981/vale-park-stoke-on-trent-england-33d6e4a9.html"
            }
        ]
    };
}
