import sys, io, re, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import pypdf

reader = pypdf.PdfReader(r"C:\playground\footballke\docs\SquadLists-English.pdf")

# ── Collect all page text ─────────────────────────────────────────────────────
pages = []
for i, page in enumerate(reader.pages):
    text = page.extract_text() or ""
    pages.append(text)

full = "\n".join(pages)

# ── Split into per-country blocks ─────────────────────────────────────────────
# Country headers look like: "Algeria (ALG)" at the start of a page

# Build mapping: country_name → code
header_re = re.compile(r"^(.+?) \(([A-Z]{3})\)\s*$", re.MULTILINE)

# Find all headers with their positions in the full text
headers = list(header_re.finditer(full))

# Filter out "SQUAD LIST" artifacts
real_headers = [(m.start(), m.group(1).strip(), m.group(2))
                for m in headers
                if m.group(1).strip().upper() != "SQUAD LIST"]

# ── Parse each country block ──────────────────────────────────────────────────
# Player line pattern:
#   POS + rest including DOB (dd/mm/yyyy)
DOB_RE = re.compile(r"(\d{2}/\d{2}/\d{4})")

POSITION_MAP = {
    "GK": "Goalkeeper",
    "DF": "Defender",
    "MF": "Midfielder",
    "FW": "Forward",
}

def parse_players(block: str, country_name: str, country_code: str) -> list:
    lines = block.split("\n")
    players = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Must start with a position code
        pos_match = re.match(r"^(GK|DF|MF|FW)", line)
        if not pos_match:
            continue

        dob_match = DOB_RE.search(line)
        if not dob_match:
            continue

        pos_code = pos_match.group(1)
        dob_str = dob_match.group(1)
        dob_pos = dob_match.start()

        # Text before DOB: "GK LASTNAME Firstname ... LASTNAME SHIRNAME"
        pre_dob = line[:dob_pos].strip()
        # Text after DOB: "Club (CODE) HEIGHT CAPS GOALS"
        post_dob = line[dob_pos + len(dob_str):].strip()

        # Parse DOB
        dob_parts = dob_str.split("/")
        try:
            dob_iso = f"{dob_parts[2]}-{dob_parts[1]}-{dob_parts[0]}"
        except IndexError:
            continue

        # Parse post-DOB: "Club Name (CTY) HH CC GG" or "Club Name (CTY)HH CC GG"
        club_match = re.match(r"^(.+?\([A-Z]{3}\))\s*(\d{3})\s+(\d+)\s+(\d+)", post_dob)
        if not club_match:
            # try without country code in club
            club_match = re.match(r"^(.+?)\s+(\d{3})\s+(\d+)\s+(\d+)", post_dob)
        if not club_match:
            continue

        club = club_match.group(1).strip()
        height = int(club_match.group(2))
        caps = int(club_match.group(3))
        goals = int(club_match.group(4))

        # Extract name-on-shirt: last word(s) before DOB that are UPPERCASE
        # Pattern: POS SURNAME Firstname ... SURNAME NAME_ON_SHIRT
        # Simplest: NAME ON SHIRT is the last all-caps token(s) in pre_dob after pos
        after_pos = pre_dob[len(pos_code):].strip()

        # Find all-caps words at the end of after_pos
        shirt_match = re.search(r"([A-Z][A-Z\s]+)$", after_pos)
        name_on_shirt = shirt_match.group(1).strip() if shirt_match else ""

        # First name: everything between last_name block and name_on_shirt
        # In practice, just pick the most prominent display name
        # "LASTNAME Firstname" at start, then full names, then LAST, SHIRT
        # Just use name_on_shirt as display name if available, else build from tokens
        tokens = after_pos.split()

        # Display name: first token (LASTNAME) + second token (Firstname)
        display = " ".join(tokens[:2]) if len(tokens) >= 2 else after_pos

        players.append({
            "nameOnShirt": name_on_shirt or display,
            "displayName": display,
            "position": POSITION_MAP.get(pos_code, pos_code),
            "positionCode": pos_code,
            "dateOfBirth": dob_iso,
            "club": club,
            "height": height,
            "caps": caps,
            "goals": goals,
        })

    return players


teams = {}

for i, (pos, name, code) in enumerate(real_headers):
    end = real_headers[i + 1][0] if i + 1 < len(real_headers) else len(full)
    block = full[pos:end]
    players = parse_players(block, name, code)
    teams[code] = {
        "name": name,
        "code": code,
        "players": players,
    }
    print(f"  {code} ({name}): {len(players)} players")

# Write output
out_path = r"C:\playground\footballke\data\world-cup\squads_raw.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(teams, f, ensure_ascii=False, indent=2)

print(f"\nWrote {len(teams)} teams to {out_path}")
total_players = sum(len(t["players"]) for t in teams.values())
print(f"Total players: {total_players}")
