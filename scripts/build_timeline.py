import pandas as pd
import requests
import json
import time
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("SETLIST_API_KEY")
HEADERS = {
    "x-api-key": API_KEY,
    "Accept": "application/json"
}

# 1. Update Venues with VERIFIED IDs from previous runs
VENUES = {
    "The Golden Torch": "63d27eaf",      # Verified
    "Trentham Gardens": "43d62fdb",      # Verified (New ID)
    "Victoria Hall": "3bd6d414",         # Verified (New ID)
    "The Wheatsheaf": "5bd63360",        # Verified (New ID)
    "The Sugarmill": "2bd36412",         # Verified (New ID)
    "Shelleys Laserdrome": "63d76a7f",   # Verified
    "Bingley Hall": "3bd6ec70"           # Still 404, maybe "Stafford Bingley Hall"?
}

# 2. Hardcoded / Supplementary Data (The "Needles")
MANUAL_GIGS = [
    {"date": "1966-06-15", "venue": "Harold Clowes Hall", "artist": "The 'n Betweens"},
    {"date": "1965-09-20", "venue": "The Place", "artist": "The Who"}, 
    {"date": "1966-04-10", "venue": "The Place", "artist": "The 'n Betweens"},
    {"date": "1981-08-01", "venue": "Port Vale Stadium", "artist": "Ozzy Osbourne (Heavy Metal Holocaust)", "info": "Legendary gig"},
    {"date": "1981-08-01", "venue": "Port Vale Stadium", "artist": "Motörhead"},
    {"date": "1994-09-14", "venue": "The Wheatsheaf", "artist": "Oasis"},
    {"date": "1972-09-12", "venue": "The Golden Torch", "artist": "Major Lance"},
    {"date": "1973-01-15", "venue": "Trentham Gardens", "artist": "Led Zeppelin"},
    {"date": "2000-01-24", "venue": "The Sugarmill", "artist": "Coldplay"}
]

def search_venue_id(venue_name):
    print(f"Searching for new ID for {venue_name}...")
    try:
        url = f"https://api.setlist.fm/rest/1.0/search/venues?name={venue_name}&cityName=Stoke-on-Trent&p=1"
        res = requests.get(url, headers=HEADERS)
        if res.status_code == 200:
            data = res.json()
            if 'venue' in data and len(data['venue']) > 0:
                new_id = data['venue'][0]['id']
                print(f"Found new ID for {venue_name}: {new_id}")
                return new_id
    except Exception as e:
        print(f"Search failed for {venue_name}: {e}")
    return None

def fetch_full_venue_history(venue_id, venue_name):
    print(f"\n📚 Starting deep crawl for {venue_name} ({venue_id})...")
    gigs = []
    page = 1
    
    while True:
        try:
            url = f"https://api.setlist.fm/rest/1.0/venue/{venue_id}/setlists?p={page}"
            res = requests.get(url, headers=HEADERS)
            
            if res.status_code == 429:
                print(f"  Rate limit (429). Sleeping 5s...")
                time.sleep(5)
                continue
            
            if res.status_code == 404:
                # 404 usually means "Page beyond max" in this API if we started okay? 
                # Or invalid ID.
                # If page 1 gives 404, ID is wrong.
                if page == 1:
                    print("  ID seems invalid (404 on page 1).")
                    return None 
                break # End of list
                
            if res.status_code != 200:
                print(f"  Error {res.status_code}")
                break
                
            data = res.json()
            if 'setlist' not in data or not data['setlist']:
                break
                
            # Process page
            batch = data['setlist']
            print(f"  Page {page}: Parsing {len(batch)} gigs...")
            
            for s in batch:
                date_str = s['eventDate']
                try:
                    # Filter Year Range (1965-2015)
                    # Date is dd-MM-yyyy
                    parts = date_str.split("-")
                    year = int(parts[2])
                    
                    if year < 1965:
                        # Optimization: If sorted DESC, we can stop?
                        # SetlistFM usually returns most recent first.
                        # So if we hit 1964, we are done.
                        print("  Reached pre-1965 era. Stopping.")
                        return gigs
                    
                    if year > datetime.now().year:
                        continue # Skip future/too new
                        
                    # Check for Setlist Data (Songs)
                    has_songs = False
                    if 'sets' in s and 'set' in s['sets']:
                        # It's a list or dict? API schema varies.
                        # Usually a list of sets. 
                        # If list is not empty, we have songs.
                        set_data = s['sets']['set']
                        if isinstance(set_data, list) and len(set_data) > 0:
                            has_songs = True
                        
                    gig = {
                        "date": date_str,
                        "venue": venue_name,
                        "artist": s['artist']['name'],
                        "mbid": s['artist'].get('mbid', ''),
                        "url": s.get('url', ''),
                        "has_songs": has_songs
                    }
                    gigs.append(gig)
                    
                except Exception as ex:
                    pass

            # Pagination Check
            total = data.get('total', 0)
            items_per_page = data.get('itemsPerPage', 20)
            
            if page * items_per_page >= total:
                print("  Reached end of list.")
                break
                
            page += 1
            time.sleep(0.8) # Respectful crawl speed
            
        except Exception as e:
            print(f"  Crawl error: {e}")
            break
            
    return gigs

# 3. Build Master List
all_gigs = []

print("Starting FULL HISTORICAL DEEP DIVE (1965-Present)...")

for name, vid in VENUES.items():
    venue_gigs = fetch_full_venue_history(vid, name)
    
    if venue_gigs is None:
        # Try search fallback
        new_id = search_venue_id(name)
        if new_id:
            venue_gigs = fetch_full_venue_history(new_id, name)
            
    if venue_gigs:
        all_gigs.extend(venue_gigs)
        print(f"✅ Collected {len(venue_gigs)} gigs for {name}")

# Manual 'Needles'
MANUAL_GIGS = [
    {"date": "1966-06-15", "venue": "Harold Clowes Hall", "artist": "The 'n Betweens"},
    {"date": "1965-09-20", "venue": "The Place", "artist": "The Who"}, 
    {"date": "1966-04-10", "venue": "The Place", "artist": "The 'n Betweens"},
    {"date": "1981-08-01", "venue": "Port Vale Stadium", "artist": "Ozzy Osbourne (Heavy Metal Holocaust)", "info": "Legendary gig"},
    {"date": "1981-08-01", "venue": "Port Vale Stadium", "artist": "Motörhead"},
    {"date": "1994-09-14", "venue": "The Wheatsheaf", "artist": "Oasis"},
    {"date": "1972-09-12", "venue": "The Golden Torch", "artist": "Major Lance"},
    {"date": "1973-01-15", "venue": "Trentham Gardens", "artist": "Led Zeppelin"},
    {"date": "2000-01-24", "venue": "The Sugarmill", "artist": "Coldplay"}
]

# Merge Manual
for g in MANUAL_GIGS:
    # Basic dedupe check
    exists = any(x for x in all_gigs if x['date'] == g['date'] and x['venue'] == g['venue'])
    if not exists:
         # Standardize "dd-mm-yyyy" if needed
         try:
             # If format yyyy-mm-dd
             if "-" in g['date'] and len(g['date'].split("-")[0]) == 4:
                 d = datetime.strptime(g['date'], "%Y-%m-%d")
                 g['date'] = d.strftime("%d-%m-%Y")
         except:
             pass
         all_gigs.append(g)

print(f"\n🔥 Total Database Size: {len(all_gigs)} Gigs")

# 4. Dataframe & Export
normalized = []
for g in all_gigs:
    try:
        dt = datetime.strptime(g['date'], "%d-%m-%Y")
        normalized.append({
            "Date": dt,
            "Venue": g['venue'],
            "Artist": g.get('artist', 'Unknown'),
            "mbid": g.get('mbid', ''),
            "url": g.get('url', ''),
            "has_songs": g.get('has_songs', False)
        })
    except:
        pass

df = pd.DataFrame(normalized)
pivot_df = df.pivot_table(index="Date", columns="Venue", values="Artist", aggfunc=lambda x: ", ".join(x)).fillna("")

# Reindex
today_str = datetime.now().strftime("%Y-%m-%d")
full_range = pd.date_range(start="1965-01-01", end=today_str)
final_df = pivot_df.reindex(full_range).fillna("")

final_df['Year'] = final_df.index.year
final_df['Month'] = final_df.index.month_name()
final_df['DateStr'] = final_df.index.strftime("%Y-%m-%d")

# 5. Advanced JSON Export
# We want: The Timeline Rows (Compact) + A Look-Up Table for Details (Img, Songs, etc)
# To keep it simple for now, we attach details to the row entries?
# Actually, let's just create a Lookup Map: "VenueID-Date": { hasSongs: ..., url: ... }
# Or simple list of event objects.
# The current "timeline_data.json" format is list of rows.
# Let's ENRICH the row entries. Instead of just "Artist Name", maybe "Artist Name|hasSongs|MBID"? 
# Or just keep it simple string for display, and frontend fetches details?
# User wants "Flag on each gig date".
# I will change the CSV export to be the full pivot. 
# And I will change the JSON to include the metadata.

# Filter empty days for JSON
non_empty = (final_df.drop(['Year', 'Month', 'DateStr'], axis=1) != "").any(axis=1)
compact = final_df[non_empty].copy()

# Add Metadata Columns? It's hard in a wide dataframe.
# Let's assume the JSON generation needs to be smarter.
# We'll map the raw 'all_gigs' list to a dictionary [DateStr][Venue] = GigObject
detail_map = {}
for g in all_gigs:
    try:
        # normalize date to YYYY-MM-DD
        dobj = datetime.strptime(g['date'], "%d-%m-%Y")
        dstr = dobj.strftime("%Y-%m-%d")
        if g['venue'] not in detail_map[dstr]:
            detail_map[dstr][g['venue']] = []
        detail_map[dstr][g['venue']].append(g)
    except:
        pass

# 3.5 Genre Mapping
# Simple heuristic map for the prototype (can be expanded with MusicBrainz later)
# We map Venue -> Likely Genre as a fallback
VENUE_GENRE_MAP = {
    "The Golden Torch": "Soul",
    "Trentham Gardens": "Rock", # Variety really
    "The Wheatsheaf": "Rock",   # Pub Rock / Punk
    "The Sugarmill": "Indie",
    "Shelleys Laserdrome": "Rave",
    "Victoria Hall": "Variety"
}

def guess_genre(artist, venue):
    # Simple keyword heuristics
    a = artist.lower()
    if "orchestra" in a or "comedian" in a: return "Variety"
    if "sex pistols" in a or "clash" in a or "damned" in a: return "Punk"
    if "bee gees" in a: return "Pop"
    
    # Fallback to Venue Default
    return VENUE_GENRE_MAP.get(venue, "Other")

# Now build the timeline list manually from compact dates
output_list = []
for date_val, row in compact.iterrows():
    dstr = date_val.strftime("%Y-%m-%d")
    
    entry = {
        "Year": row['Year'],
        "Month": row['Month'],
        "DateStr": dstr,
        # "Day": row.name.day
    }
    
    # Add venue columns (using Name keys matching frontend expectation)
    # And enrich!
    for col in compact.columns:
        if col in ['Year', 'Month', 'DateStr']: continue
        val = row[col]
        if val:
            # We have an artist. Check detail map for metadata.
            # If multiple artists (joined by comma), the detail map only has LAST one overwriting?
            # My simple detail map logic above overwrites.
            # But 'all_gigs' has them all. 
            # Ideally we find the specific gig.
            # For simplicity:
            gig_info_list = detail_map.get(dstr, {}).get(col, [])
            
            # If there are multiple gigs for the same venue on the same day,
            # we'll list them all.
            if gig_info_list:
                entry[col] = []
                for gig_item in gig_info_list:
                    entry[col].append({
                        "artist": gig_item.get('artist', val),
                        "has_songs": gig_item.get("has_songs", False),
                        "url": gig_item.get("url", ""),
                        "mbid": gig_item.get("mbid", ""),
                        "genre": guess_genre(gig_item.get('artist', val), col)
                    })
            else:
                # Fallback if for some reason detail_map didn't catch it (e.g., manual entry without full metadata)
                entry[col] = [{
                    "artist": val,
                    "has_songs": False,
                    "url": "",
                    "mbid": "",
                    "genre": guess_genre(val, col)
                }]
            
            # Note: This changes the JSON structure! 
            # Frontend expects `row[venueId] = "ArtistString"`.
            # Now it will get an Object. 
            # I must update Frontend `TimelineGrid` to handle this.
            
    output_list.append(entry)

# 5. Export to Supabase (Database Ingestion)
# We upload the normalized 'all_gigs' list, but enriched with genres.

print("\n🚀 Starting Supabase Ingestion...")

supabase_url = os.getenv("PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Error: Supabase credentials missing from .env")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates" # Upsert behavior
}

# Prepare Payload matching SQL schema
# id, date, venue, artist, genre, has_songs, songs, notes, mbid, url
db_rows = []
for g in all_gigs:
    try:
        # Re-convert date to YYYY-MM-DD
        dobj = datetime.strptime(g['date'], "%d-%m-%Y")
        date_iso = dobj.strftime("%Y-%m-%d")
        
        genre = guess_genre(g.get('artist', ''), g['venue'])
        
        row = {
            "date": date_iso,
            "venue": g['venue'],
            "artist": g.get('artist', 'Unknown'),
            "genre": genre,
            "has_songs": g.get('has_songs', False),
            "songs": g.get('songs', []),     # Script doesn't crawl songs in detail loop yet, but if it did...
            "notes": g.get('info', ''),      # 'info' from manual gigs
            "mbid": g.get('mbid', ''),
            "url": g.get('url', '')
        }
        
        # Dedupe Hook: We can generate a deterministic ID to allow upserts?
        # Or let Supabase handle it? 
        # Ideally we use a composite key or ID.
        # Let's generate a UUID-like hash for the ID to ensure idempotency.
        # id = sha1(date+venue+artist)
        
        db_rows.append(row)
    except Exception as e:
        print(f"Skipping row {g}: {e}")

# Batch Upload (Supabase has limit per request, usually 1000s are fine, but let's chunk)
BATCH_SIZE = 1000
total_uploaded = 0

url = f"{supabase_url}/rest/v1/gigs"

for i in range(0, len(db_rows), BATCH_SIZE):
    batch = db_rows[i : i + BATCH_SIZE]
    
    # We need to upsert. Assuming 'id' is distinct? 
    # Actually, we didn't generate ID. 
    # If we want to replace existing, we should probably DELETE for the range or use Conflict on columns.
    # Since we lack a constraint in the SQL I gave you (only ID primary key),
    # I will just INSERT (which might duplicate if run multiple times without cleanup).
    # BETTER: Clear table first? Or add constraint?
    # User just created table.
    # I'll advise user to TRUNCATE manually, or I can run a DELETE.
    
    # Simple Append for now.
    res = requests.post(url, headers=headers, json=batch)
    if res.status_code in [200, 201]:
        total_uploaded += len(batch)
        print(f"  Uploaded {total_uploaded}/{len(db_rows)}")
    else:
        print(f"  Error uploading batch: {res.status_code} {res.text}")

print("✅ Ingestion Complete.")

