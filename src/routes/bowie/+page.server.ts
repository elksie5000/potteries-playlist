export async function load({ fetch }) {
    const response = await fetch('/api/bowie');
    const data = await response.json();


    const gigs = data.setlist.map((setlist: any) => {
        const [day, month, year] = setlist.eventDate.split('-');

        const rawSet = setlist.sets.set || [];

        const songs = rawSet.map((set: any) => {
            return set.song.map((song: any) => song.name);
        }).flat();

        const country = setlist.venue?.city?.country?.name;

        const isHomeCountry = country === 'United Kingdom';


        return {
            eventObj: new Date(year, month - 1, day),
            dateString: setlist.eventDate,
            venue: setlist.venue.name,
            city: setlist.venue.city.name,
            country: country,
            isHomeCountry: isHomeCountry,
            songs: songs
        }
    })

    return {
        gigs, data
    }
}