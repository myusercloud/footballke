"""
Generate all data/world-cup/*.json files from real 2026 FIFA World Cup data.
Sources:
  - Squad data: docs/SquadLists-English.pdf (via squads_raw.json)
  - Fixtures: ESPN / FIFA schedule
  - Groups: deduced from matchday 1-3 fixture pairings
Run: python scripts/generate_wc_data.py
"""
import sys, io, json, re, os, unicodedata
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = os.path.join(os.path.dirname(__file__), "..")
DATA = os.path.join(ROOT, "data", "world-cup")

# ── Load raw squad data ───────────────────────────────────────────────────────
with open(os.path.join(DATA, "squads_raw.json"), encoding="utf-8") as f:
    squads_raw = json.load(f)

def fix_name(s: str) -> str:
    """Remove duplicate tokens like PICFORDPICKFORD → PICKFORD"""
    s = s.strip()
    # Handle doubled name: WORDWORD → WORD (when exactly doubled)
    m = re.match(r"^([A-Z][A-Z\- ]+)\1$", s)
    if m:
        return m.group(1).strip()
    # Fix encoding artifacts: attempt to fix latin1-as-utf8
    try:
        return s.encode("latin-1").decode("utf-8")
    except Exception:
        return s

# ── Team master data ──────────────────────────────────────────────────────────
TEAMS = {
    # code: { slug, name, shortName, abbreviation, flag, colors, confederation, fifaRanking }
    "MEX": {"slug":"mexico","name":"Mexico","shortName":"Mexico","abbreviation":"MEX","flag":"/flags/mx.svg","colors":{"primary":"#006847","secondary":"#FFFFFF"},"confederation":"CONCACAF","fifaRanking":15},
    "KOR": {"slug":"korea-republic","name":"Korea Republic","shortName":"Korea Rep.","abbreviation":"KOR","flag":"/flags/kr.svg","colors":{"primary":"#C60C30","secondary":"#003478"},"confederation":"AFC","fifaRanking":22},
    "CZE": {"slug":"czechia","name":"Czechia","shortName":"Czechia","abbreviation":"CZE","flag":"/flags/cz.svg","colors":{"primary":"#D7141A","secondary":"#11457E"},"confederation":"UEFA","fifaRanking":37},
    "RSA": {"slug":"south-africa","name":"South Africa","shortName":"South Africa","abbreviation":"RSA","flag":"/flags/za.svg","colors":{"primary":"#007A4D","secondary":"#FFB612"},"confederation":"CAF","fifaRanking":67},
    "CAN": {"slug":"canada","name":"Canada","shortName":"Canada","abbreviation":"CAN","flag":"/flags/ca.svg","colors":{"primary":"#FF0000","secondary":"#FFFFFF"},"confederation":"CONCACAF","fifaRanking":38},
    "BIH": {"slug":"bosnia-herzegovina","name":"Bosnia & Herzegovina","shortName":"Bosnia-Herz","abbreviation":"BIH","flag":"/flags/ba.svg","colors":{"primary":"#002395","secondary":"#FFCF00"},"confederation":"UEFA","fifaRanking":64},
    "QAT": {"slug":"qatar","name":"Qatar","shortName":"Qatar","abbreviation":"QAT","flag":"/flags/qa.svg","colors":{"primary":"#8D1B3D","secondary":"#FFFFFF"},"confederation":"AFC","fifaRanking":58},
    "SUI": {"slug":"switzerland","name":"Switzerland","shortName":"Switzerland","abbreviation":"SUI","flag":"/flags/ch.svg","colors":{"primary":"#FF0000","secondary":"#FFFFFF"},"confederation":"UEFA","fifaRanking":19},
    "USA": {"slug":"usa","name":"United States","shortName":"USA","abbreviation":"USA","flag":"/flags/us.svg","colors":{"primary":"#002868","secondary":"#BF0A30"},"confederation":"CONCACAF","fifaRanking":13},
    "PAR": {"slug":"paraguay","name":"Paraguay","shortName":"Paraguay","abbreviation":"PAR","flag":"/flags/py.svg","colors":{"primary":"#D52B1E","secondary":"#FFFFFF"},"confederation":"CONMEBOL","fifaRanking":55},
    "AUS": {"slug":"australia","name":"Australia","shortName":"Australia","abbreviation":"AUS","flag":"/flags/au.svg","colors":{"primary":"#00843D","secondary":"#FFD520"},"confederation":"AFC","fifaRanking":24},
    "TUR": {"slug":"turkiye","name":"Türkiye","shortName":"Türkiye","abbreviation":"TUR","flag":"/flags/tr.svg","colors":{"primary":"#E30A17","secondary":"#FFFFFF"},"confederation":"UEFA","fifaRanking":26},
    "BRA": {"slug":"brazil","name":"Brazil","shortName":"Brazil","abbreviation":"BRA","flag":"/flags/br.svg","colors":{"primary":"#009C3B","secondary":"#FFDF00"},"confederation":"CONMEBOL","fifaRanking":5},
    "MAR": {"slug":"morocco","name":"Morocco","shortName":"Morocco","abbreviation":"MAR","flag":"/flags/ma.svg","colors":{"primary":"#C1272D","secondary":"#006233"},"confederation":"CAF","fifaRanking":14},
    "HAI": {"slug":"haiti","name":"Haiti","shortName":"Haiti","abbreviation":"HAI","flag":"/flags/ht.svg","colors":{"primary":"#00209F","secondary":"#D21034"},"confederation":"CONCACAF","fifaRanking":83},
    "SCO": {"slug":"scotland","name":"Scotland","shortName":"Scotland","abbreviation":"SCO","flag":"/flags/gb-sct.svg","colors":{"primary":"#003DA5","secondary":"#FFFFFF"},"confederation":"UEFA","fifaRanking":39},
    "GER": {"slug":"germany","name":"Germany","shortName":"Germany","abbreviation":"GER","flag":"/flags/de.svg","colors":{"primary":"#000000","secondary":"#FFFFFF"},"confederation":"UEFA","fifaRanking":16},
    "CUW": {"slug":"curacao","name":"Curaçao","shortName":"Curaçao","abbreviation":"CUW","flag":"/flags/cw.svg","colors":{"primary":"#002B7F","secondary":"#F9E00C"},"confederation":"CONCACAF","fifaRanking":85},
    "CIV": {"slug":"cote-divoire","name":"Côte d'Ivoire","shortName":"Ivory Coast","abbreviation":"CIV","flag":"/flags/ci.svg","colors":{"primary":"#F77F00","secondary":"#FFFFFF"},"confederation":"CAF","fifaRanking":30},
    "ECU": {"slug":"ecuador","name":"Ecuador","shortName":"Ecuador","abbreviation":"ECU","flag":"/flags/ec.svg","colors":{"primary":"#FFD100","secondary":"#003087"},"confederation":"CONMEBOL","fifaRanking":44},
    "NED": {"slug":"netherlands","name":"Netherlands","shortName":"Netherlands","abbreviation":"NED","flag":"/flags/nl.svg","colors":{"primary":"#FF6600","secondary":"#003087"},"confederation":"UEFA","fifaRanking":7},
    "JPN": {"slug":"japan","name":"Japan","shortName":"Japan","abbreviation":"JPN","flag":"/flags/jp.svg","colors":{"primary":"#BC002D","secondary":"#FFFFFF"},"confederation":"AFC","fifaRanking":22},
    "SWE": {"slug":"sweden","name":"Sweden","shortName":"Sweden","abbreviation":"SWE","flag":"/flags/se.svg","colors":{"primary":"#006AA7","secondary":"#FECC02"},"confederation":"UEFA","fifaRanking":25},
    "TUN": {"slug":"tunisia","name":"Tunisia","shortName":"Tunisia","abbreviation":"TUN","flag":"/flags/tn.svg","colors":{"primary":"#E70013","secondary":"#FFFFFF"},"confederation":"CAF","fifaRanking":28},
    "ESP": {"slug":"spain","name":"Spain","shortName":"Spain","abbreviation":"ESP","flag":"/flags/es.svg","colors":{"primary":"#AA151B","secondary":"#F1BF00"},"confederation":"UEFA","fifaRanking":6},
    "CPV": {"slug":"cabo-verde","name":"Cabo Verde","shortName":"Cabo Verde","abbreviation":"CPV","flag":"/flags/cv.svg","colors":{"primary":"#003893","secondary":"#CF2027"},"confederation":"CAF","fifaRanking":76},
    "KSA": {"slug":"saudi-arabia","name":"Saudi Arabia","shortName":"Saudi Arabia","abbreviation":"KSA","flag":"/flags/sa.svg","colors":{"primary":"#006C35","secondary":"#FFFFFF"},"confederation":"AFC","fifaRanking":56},
    "URU": {"slug":"uruguay","name":"Uruguay","shortName":"Uruguay","abbreviation":"URU","flag":"/flags/uy.svg","colors":{"primary":"#75AADB","secondary":"#FFFFFF"},"confederation":"CONMEBOL","fifaRanking":17},
    "BEL": {"slug":"belgium","name":"Belgium","shortName":"Belgium","abbreviation":"BEL","flag":"/flags/be.svg","colors":{"primary":"#ED2939","secondary":"#FDDA24"},"confederation":"UEFA","fifaRanking":4},
    "EGY": {"slug":"egypt","name":"Egypt","shortName":"Egypt","abbreviation":"EGY","flag":"/flags/eg.svg","colors":{"primary":"#CE1126","secondary":"#FFFFFF"},"confederation":"CAF","fifaRanking":34},
    "IRN": {"slug":"iran","name":"IR Iran","shortName":"Iran","abbreviation":"IRN","flag":"/flags/ir.svg","colors":{"primary":"#239F40","secondary":"#FFFFFF"},"confederation":"AFC","fifaRanking":20},
    "NZL": {"slug":"new-zealand","name":"New Zealand","shortName":"New Zealand","abbreviation":"NZL","flag":"/flags/nz.svg","colors":{"primary":"#000000","secondary":"#FFFFFF"},"confederation":"OFC","fifaRanking":98},
    "FRA": {"slug":"france","name":"France","shortName":"France","abbreviation":"FRA","flag":"/flags/fr.svg","colors":{"primary":"#002395","secondary":"#ED2939"},"confederation":"UEFA","fifaRanking":2},
    "SEN": {"slug":"senegal","name":"Senegal","shortName":"Senegal","abbreviation":"SEN","flag":"/flags/sn.svg","colors":{"primary":"#009A44","secondary":"#FCDD09"},"confederation":"CAF","fifaRanking":20},
    "IRQ": {"slug":"iraq","name":"Iraq","shortName":"Iraq","abbreviation":"IRQ","flag":"/flags/iq.svg","colors":{"primary":"#CE1126","secondary":"#FFFFFF"},"confederation":"AFC","fifaRanking":63},
    "NOR": {"slug":"norway","name":"Norway","shortName":"Norway","abbreviation":"NOR","flag":"/flags/no.svg","colors":{"primary":"#EF2B2D","secondary":"#FFFFFF"},"confederation":"UEFA","fifaRanking":21},
    "ARG": {"slug":"argentina","name":"Argentina","shortName":"Argentina","abbreviation":"ARG","flag":"/flags/ar.svg","colors":{"primary":"#74ACDF","secondary":"#FFFFFF"},"confederation":"CONMEBOL","fifaRanking":1},
    "ALG": {"slug":"algeria","name":"Algeria","shortName":"Algeria","abbreviation":"ALG","flag":"/flags/dz.svg","colors":{"primary":"#006233","secondary":"#FFFFFF"},"confederation":"CAF","fifaRanking":51},
    "AUT": {"slug":"austria","name":"Austria","shortName":"Austria","abbreviation":"AUT","flag":"/flags/at.svg","colors":{"primary":"#ED2939","secondary":"#FFFFFF"},"confederation":"UEFA","fifaRanking":23},
    "JOR": {"slug":"jordan","name":"Jordan","shortName":"Jordan","abbreviation":"JOR","flag":"/flags/jo.svg","colors":{"primary":"#007A3D","secondary":"#000000"},"confederation":"AFC","fifaRanking":70},
    "POR": {"slug":"portugal","name":"Portugal","shortName":"Portugal","abbreviation":"POR","flag":"/flags/pt.svg","colors":{"primary":"#006600","secondary":"#FF0000"},"confederation":"UEFA","fifaRanking":8},
    "COD": {"slug":"congo-dr","name":"Congo DR","shortName":"Congo DR","abbreviation":"COD","flag":"/flags/cd.svg","colors":{"primary":"#007FFF","secondary":"#F7D618"},"confederation":"CAF","fifaRanking":45},
    "UZB": {"slug":"uzbekistan","name":"Uzbekistan","shortName":"Uzbekistan","abbreviation":"UZB","flag":"/flags/uz.svg","colors":{"primary":"#1EB53A","secondary":"#FFFFFF"},"confederation":"AFC","fifaRanking":60},
    "COL": {"slug":"colombia","name":"Colombia","shortName":"Colombia","abbreviation":"COL","flag":"/flags/co.svg","colors":{"primary":"#FCD116","secondary":"#003087"},"confederation":"CONMEBOL","fifaRanking":9},
    "ENG": {"slug":"england","name":"England","shortName":"England","abbreviation":"ENG","flag":"/flags/gb-eng.svg","colors":{"primary":"#FFFFFF","secondary":"#003F72"},"confederation":"UEFA","fifaRanking":5},
    "CRO": {"slug":"croatia","name":"Croatia","shortName":"Croatia","abbreviation":"CRO","flag":"/flags/hr.svg","colors":{"primary":"#FF0000","secondary":"#FFFFFF"},"confederation":"UEFA","fifaRanking":10},
    "GHA": {"slug":"ghana","name":"Ghana","shortName":"Ghana","abbreviation":"GHA","flag":"/flags/gh.svg","colors":{"primary":"#006B3F","secondary":"#FCD116"},"confederation":"CAF","fifaRanking":61},
    "PAN": {"slug":"panama","name":"Panama","shortName":"Panama","abbreviation":"PAN","flag":"/flags/pa.svg","colors":{"primary":"#DA1726","secondary":"#FFFFFF"},"confederation":"CONCACAF","fifaRanking":43},
}

# ── Groups ────────────────────────────────────────────────────────────────────
GROUPS_DEF = {
    "A": ["MEX","KOR","CZE","RSA"],
    "B": ["CAN","BIH","QAT","SUI"],
    "C": ["USA","PAR","AUS","TUR"],
    "D": ["BRA","MAR","HAI","SCO"],
    "E": ["GER","CUW","CIV","ECU"],
    "F": ["NED","JPN","SWE","TUN"],
    "G": ["ESP","CPV","KSA","URU"],
    "H": ["BEL","EGY","IRN","NZL"],
    "I": ["FRA","SEN","IRQ","NOR"],
    "J": ["ARG","ALG","AUT","JOR"],
    "K": ["POR","COD","UZB","COL"],
    "L": ["ENG","CRO","GHA","PAN"],
}

def make_team(code, group_letter):
    t = TEAMS[code].copy()
    t["id"] = f"team-{t['slug']}"
    t["groupLetter"] = group_letter
    return t

# ── Build groups.json ─────────────────────────────────────────────────────────
groups_json = {"groups": []}
for letter, codes in GROUPS_DEF.items():
    groups_json["groups"].append({
        "letter": letter,
        "teams": [make_team(c, letter) for c in codes]
    })

with open(os.path.join(DATA, "groups.json"), "w", encoding="utf-8") as f:
    json.dump(groups_json, f, ensure_ascii=False, indent=2)
print("✓ groups.json")

# ── Venues ────────────────────────────────────────────────────────────────────
VENUES = {
    "banorte":    {"id":"venue-banorte","name":"Estadio Banorte","city":"Mexico City","country":"Mexico","capacity":80000},
    "akron":      {"id":"venue-akron","name":"Estadio Akron","city":"Guadalajara","country":"Mexico","capacity":45000},
    "bbva":       {"id":"venue-bbva","name":"Estadio BBVA","city":"Guadalupe","country":"Mexico","capacity":51228},
    "bmo":        {"id":"venue-bmo","name":"BMO Field","city":"Toronto","country":"Canada","capacity":30000},
    "bc-place":   {"id":"venue-bcplace","name":"BC Place","city":"Vancouver","country":"Canada","capacity":54500},
    "sofi":       {"id":"venue-sofi","name":"SoFi Stadium","city":"Inglewood","country":"USA","capacity":70240},
    "levis":      {"id":"venue-levis","name":"Levi's Stadium","city":"Santa Clara","country":"USA","capacity":68500},
    "metlife":    {"id":"venue-metlife","name":"MetLife Stadium","city":"East Rutherford","country":"USA","capacity":82500},
    "gillette":   {"id":"venue-gillette","name":"Gillette Stadium","city":"Foxborough","country":"USA","capacity":65878},
    "nrg":        {"id":"venue-nrg","name":"NRG Stadium","city":"Houston","country":"USA","capacity":72220},
    "att":        {"id":"venue-att","name":"AT&T Stadium","city":"Arlington","country":"USA","capacity":80000},
    "lincoln":    {"id":"venue-lincoln","name":"Lincoln Financial Field","city":"Philadelphia","country":"USA","capacity":69176},
    "lumen":      {"id":"venue-lumen","name":"Lumen Field","city":"Seattle","country":"USA","capacity":68740},
    "mercedes":   {"id":"venue-mercedes","name":"Mercedes-Benz Stadium","city":"Atlanta","country":"USA","capacity":71000},
    "hardrock":   {"id":"venue-hardrock","name":"Hard Rock Stadium","city":"Miami Gardens","country":"USA","capacity":65326},
    "arrowhead":  {"id":"venue-arrowhead","name":"GEHA Field at Arrowhead Stadium","city":"Kansas City","country":"USA","capacity":76416},
}

# ── Fixtures ──────────────────────────────────────────────────────────────────
# Format: (id, home_code, away_code, group, matchday, kickoff_utc, venue_key, status, score)
# Kickoffs are approximate UTC based on ET kickoff times (ET = UTC-4 in June, Mexico = UTC-5/6)
# Completed: Mexico 2-0 South Africa, Korea 2-1 Czechia
# Live today (June 12): Canada vs Bosnia-Herzegovina, USA vs Paraguay

RAW_FIXTURES = [
    # Group A — MD1
    ("wc-a1-1","MEX","RSA","A",1,"2026-06-11T22:00:00Z","banorte","fulltime",{"home":2,"away":0}),
    ("wc-a1-2","KOR","CZE","A",1,"2026-06-11T02:00:00Z","akron","fulltime",{"home":2,"away":1}),
    # Group B — MD1
    ("wc-b1-1","CAN","BIH","B",1,"2026-06-12T19:00:00Z","bmo","live",None),
    ("wc-b1-2","QAT","SUI","B",1,"2026-06-13T19:00:00Z","levis","scheduled",None),
    # Group C — MD1
    ("wc-c1-1","USA","PAR","C",1,"2026-06-13T01:00:00Z","sofi","scheduled",None),
    ("wc-c1-2","AUS","TUR","C",1,"2026-06-14T04:00:00Z","bc-place","scheduled",None),
    # Group D — MD1
    ("wc-d1-1","BRA","MAR","D",1,"2026-06-13T22:00:00Z","metlife","scheduled",None),
    ("wc-d1-2","HAI","SCO","D",1,"2026-06-14T01:00:00Z","gillette","scheduled",None),
    # Group E — MD1
    ("wc-e1-1","GER","CUW","E",1,"2026-06-14T17:00:00Z","nrg","scheduled",None),
    ("wc-e1-2","CIV","ECU","E",1,"2026-06-14T23:00:00Z","lincoln","scheduled",None),
    # Group F — MD1
    ("wc-f1-1","NED","JPN","F",1,"2026-06-14T20:00:00Z","att","scheduled",None),
    ("wc-f1-2","SWE","TUN","F",1,"2026-06-15T02:00:00Z","bbva","scheduled",None),
    # Group G — MD1
    ("wc-g1-1","ESP","CPV","G",1,"2026-06-15T16:00:00Z","mercedes","scheduled",None),
    ("wc-g1-2","KSA","URU","G",1,"2026-06-15T22:00:00Z","hardrock","scheduled",None),
    # Group H — MD1
    ("wc-h1-1","BEL","EGY","H",1,"2026-06-15T19:00:00Z","lumen","scheduled",None),
    ("wc-h1-2","IRN","NZL","H",1,"2026-06-16T01:00:00Z","sofi","scheduled",None),
    # Group I — MD1
    ("wc-i1-1","FRA","SEN","I",1,"2026-06-16T19:00:00Z","metlife","scheduled",None),
    ("wc-i1-2","IRQ","NOR","I",1,"2026-06-16T22:00:00Z","gillette","scheduled",None),
    # Group J — MD1
    ("wc-j1-1","ARG","ALG","J",1,"2026-06-17T01:00:00Z","arrowhead","scheduled",None),
    ("wc-j1-2","AUT","JOR","J",1,"2026-06-17T04:00:00Z","levis","scheduled",None),
    # Group K — MD1
    ("wc-k1-1","POR","COD","K",1,"2026-06-17T17:00:00Z","nrg","scheduled",None),
    ("wc-k1-2","UZB","COL","K",1,"2026-06-18T02:00:00Z","banorte","scheduled",None),
    # Group L — MD1
    ("wc-l1-1","ENG","CRO","L",1,"2026-06-17T20:00:00Z","att","scheduled",None),
    ("wc-l1-2","GHA","PAN","L",1,"2026-06-17T23:00:00Z","bmo","scheduled",None),

    # Group A — MD2
    ("wc-a2-1","CZE","RSA","A",2,"2026-06-18T16:00:00Z","mercedes","scheduled",None),
    ("wc-a2-2","MEX","KOR","A",2,"2026-06-19T01:00:00Z","akron","scheduled",None),
    # Group B — MD2
    ("wc-b2-1","SUI","BIH","B",2,"2026-06-18T19:00:00Z","sofi","scheduled",None),
    ("wc-b2-2","CAN","QAT","B",2,"2026-06-18T22:00:00Z","bc-place","scheduled",None),
    # Group C — MD2
    ("wc-c2-1","USA","AUS","C",2,"2026-06-19T19:00:00Z","lumen","scheduled",None),
    ("wc-c2-2","TUR","PAR","C",2,"2026-06-20T03:00:00Z","levis","scheduled",None),
    # Group D — MD2
    ("wc-d2-1","SCO","MAR","D",2,"2026-06-19T22:00:00Z","gillette","scheduled",None),
    ("wc-d2-2","BRA","HAI","D",2,"2026-06-20T00:30:00Z","lincoln","scheduled",None),
    # Group E — MD2
    ("wc-e2-1","GER","CIV","E",2,"2026-06-20T20:00:00Z","bmo","scheduled",None),
    ("wc-e2-2","ECU","CUW","E",2,"2026-06-21T00:00:00Z","arrowhead","scheduled",None),
    # Group F — MD2
    ("wc-f2-1","NED","SWE","F",2,"2026-06-20T17:00:00Z","nrg","scheduled",None),
    ("wc-f2-2","TUN","JPN","F",2,"2026-06-21T04:00:00Z","bbva","scheduled",None),
    # Group G — MD2
    ("wc-g2-1","ESP","KSA","G",2,"2026-06-21T16:00:00Z","mercedes","scheduled",None),
    ("wc-g2-2","URU","CPV","G",2,"2026-06-21T22:00:00Z","hardrock","scheduled",None),
    # Group H — MD2
    ("wc-h2-1","BEL","IRN","H",2,"2026-06-21T19:00:00Z","sofi","scheduled",None),
    ("wc-h2-2","EGY","NZL","H",2,"2026-06-22T01:00:00Z","bc-place","scheduled",None),
    # Group I — MD2
    ("wc-i2-1","FRA","IRQ","I",2,"2026-06-22T21:00:00Z","lincoln","scheduled",None),
    ("wc-i2-2","NOR","SEN","I",2,"2026-06-23T00:00:00Z","metlife","scheduled",None),
    # Group J — MD2
    ("wc-j2-1","ARG","AUT","J",2,"2026-06-22T17:00:00Z","att","scheduled",None),
    ("wc-j2-2","ALG","JOR","J",2,"2026-06-23T03:00:00Z","levis","scheduled",None),
    # Group K — MD2
    ("wc-k2-1","POR","UZB","K",2,"2026-06-23T17:00:00Z","nrg","scheduled",None),
    ("wc-k2-2","COL","COD","K",2,"2026-06-24T02:00:00Z","akron","scheduled",None),
    # Group L — MD2
    ("wc-l2-1","ENG","GHA","L",2,"2026-06-23T20:00:00Z","gillette","scheduled",None),
    ("wc-l2-2","CRO","PAN","L",2,"2026-06-23T23:00:00Z","bmo","scheduled",None),

    # Group A — MD3 (simultaneous)
    ("wc-a3-1","CZE","MEX","A",3,"2026-06-25T01:00:00Z","banorte","scheduled",None),
    ("wc-a3-2","RSA","KOR","A",3,"2026-06-25T01:00:00Z","bbva","scheduled",None),
    # Group B — MD3
    ("wc-b3-1","BIH","QAT","B",3,"2026-06-24T19:00:00Z","lumen","scheduled",None),
    ("wc-b3-2","SUI","CAN","B",3,"2026-06-24T19:00:00Z","bc-place","scheduled",None),
    # Group C — MD3
    ("wc-c3-1","PAR","AUS","C",3,"2026-06-26T02:00:00Z","levis","scheduled",None),
    ("wc-c3-2","TUR","USA","C",3,"2026-06-26T02:00:00Z","sofi","scheduled",None),
    # Group D — MD3
    ("wc-d3-1","MAR","HAI","D",3,"2026-06-24T22:00:00Z","mercedes","scheduled",None),
    ("wc-d3-2","SCO","BRA","D",3,"2026-06-24T22:00:00Z","hardrock","scheduled",None),
    # Group E — MD3
    ("wc-e3-1","CUW","CIV","E",3,"2026-06-25T20:00:00Z","lincoln","scheduled",None),
    ("wc-e3-2","ECU","GER","E",3,"2026-06-25T20:00:00Z","metlife","scheduled",None),
    # Group F — MD3
    ("wc-f3-1","JPN","SWE","F",3,"2026-06-25T23:00:00Z","att","scheduled",None),
    ("wc-f3-2","TUN","NED","F",3,"2026-06-25T23:00:00Z","arrowhead","scheduled",None),
    # Group G — MD3
    ("wc-g3-1","CPV","KSA","G",3,"2026-06-27T00:00:00Z","nrg","scheduled",None),
    ("wc-g3-2","URU","ESP","G",3,"2026-06-27T00:00:00Z","akron","scheduled",None),
    # Group H — MD3
    ("wc-h3-1","IRN","EGY","H",3,"2026-06-27T03:00:00Z","lumen","scheduled",None),
    ("wc-h3-2","NZL","BEL","H",3,"2026-06-27T03:00:00Z","bc-place","scheduled",None),
    # Group I — MD3
    ("wc-i3-1","IRQ","SEN","I",3,"2026-06-26T19:00:00Z","bmo","scheduled",None),
    ("wc-i3-2","NOR","FRA","I",3,"2026-06-26T19:00:00Z","gillette","scheduled",None),
    # Group J — MD3
    ("wc-j3-1","ALG","AUT","J",3,"2026-06-28T02:00:00Z","arrowhead","scheduled",None),
    ("wc-j3-2","JOR","ARG","J",3,"2026-06-28T02:00:00Z","att","scheduled",None),
    # Group K — MD3
    ("wc-k3-1","POR","COL","K",3,"2026-06-27T23:30:00Z","hardrock","scheduled",None),
    ("wc-k3-2","UZB","COD","K",3,"2026-06-27T23:30:00Z","mercedes","scheduled",None),
    # Group L — MD3
    ("wc-l3-1","GHA","CRO","L",3,"2026-06-27T21:00:00Z","lincoln","scheduled",None),
    ("wc-l3-2","PAN","ENG","L",3,"2026-06-27T21:00:00Z","metlife","scheduled",None),
]

def make_fixture(row):
    fid, home_code, away_code, group, matchday, kickoff, venue_key, status, score = row
    fix = {
        "id": fid,
        "homeTeamSlug": TEAMS[home_code]["slug"],
        "awayTeamSlug": TEAMS[away_code]["slug"],
        "groupLetter": group,
        "stage": "group",
        "venue": VENUES[venue_key],
        "kickoff": kickoff,
        "status": status,
        "matchday": matchday,
        "featured": fid in ("wc-a1-1","wc-d1-1","wc-i1-1","wc-j1-1","wc-l1-1"),
    }
    if score:
        fix["score"] = score
    return fix

fixtures_json = {"fixtures": [make_fixture(r) for r in RAW_FIXTURES]}
with open(os.path.join(DATA, "fixtures.json"), "w", encoding="utf-8") as f:
    json.dump(fixtures_json, f, ensure_ascii=False, indent=2)
print(f"✓ fixtures.json ({len(RAW_FIXTURES)} fixtures)")

# ── Standings ─────────────────────────────────────────────────────────────────
def zero_row(code, group, pos):
    return {
        "teamSlug": TEAMS[code]["slug"],
        "position": pos,
        "played": 0, "won": 0, "drawn": 0, "lost": 0,
        "goalsFor": 0, "goalsAgainst": 0, "goalDifference": 0,
        "points": 0, "form": [], "status": "tbd"
    }

standings_json = {"standings": []}

# Group A (real data after MD1)
standings_json["standings"].append({
    "groupLetter": "A",
    "rows": [
        {"teamSlug":"mexico","position":1,"played":1,"won":1,"drawn":0,"lost":0,"goalsFor":2,"goalsAgainst":0,"goalDifference":2,"points":3,"form":["W"],"status":"tbd"},
        {"teamSlug":"korea-republic","position":2,"played":1,"won":1,"drawn":0,"lost":0,"goalsFor":2,"goalsAgainst":1,"goalDifference":1,"points":3,"form":["W"],"status":"tbd"},
        {"teamSlug":"czechia","position":3,"played":1,"won":0,"drawn":0,"lost":1,"goalsFor":1,"goalsAgainst":2,"goalDifference":-1,"points":0,"form":["L"],"status":"tbd"},
        {"teamSlug":"south-africa","position":4,"played":1,"won":0,"drawn":0,"lost":1,"goalsFor":0,"goalsAgainst":2,"goalDifference":-2,"points":0,"form":["L"],"status":"tbd"},
    ]
})

# All other groups start at 0
for letter, codes in GROUPS_DEF.items():
    if letter == "A":
        continue
    standings_json["standings"].append({
        "groupLetter": letter,
        "rows": [zero_row(c, letter, i+1) for i, c in enumerate(codes)]
    })

with open(os.path.join(DATA, "standings.json"), "w", encoding="utf-8") as f:
    json.dump(standings_json, f, ensure_ascii=False, indent=2)
print("✓ standings.json")

# ── Tournament meta ───────────────────────────────────────────────────────────
tournament_json = {"tournament": {
    "id": "world-cup-2026",
    "slug": "world-cup",
    "name": "2026 FIFA World Cup",
    "shortName": "World Cup 2026",
    "edition": "23rd",
    "host": {
        "countries": ["USA", "Canada", "Mexico"],
        "cities": ["Atlanta","Boston","Dallas","Houston","Kansas City","Los Angeles","Miami Gardens","New York","Philadelphia","San Francisco Bay Area","Seattle","Toronto","Vancouver","Guadalajara","Mexico City","Guadalupe"],
        "venues": list(VENUES.values())
    },
    "dates": {
        "start": "2026-06-11",
        "end": "2026-07-19",
        "groupStageEnd": "2026-06-27",
        "knockoutStart": "2026-06-28"
    },
    "currentPhase": "group",
    "emblem": "/tournaments/world-cup-2026.svg",
    "groups": [{"letter": k, "teams": [TEAMS[c]["slug"] for c in v]} for k, v in GROUPS_DEF.items()],
    "totalTeams": 48,
    "featured": True
}}
with open(os.path.join(DATA, "tournament.json"), "w", encoding="utf-8") as f:
    json.dump(tournament_json, f, ensure_ascii=False, indent=2)
print("✓ tournament.json")

# ── Top scorers (placeholder — no individual scorer data yet) ─────────────────
# Mexico scored 2 goals vs South Africa, Korea scored 2 vs Czechia, Czechia 1 — individual scorers TBD
top_scorers_json = {"topScorers": []}
with open(os.path.join(DATA, "top-scorers.json"), "w", encoding="utf-8") as f:
    json.dump(top_scorers_json, f, ensure_ascii=False, indent=2)
print("✓ top-scorers.json (empty — no individual scorer data yet)")

# ── Featured players ──────────────────────────────────────────────────────────
# Real players from squads_raw.json — pick star names by DOB/club matching

def find_player(squad_code, name_hint):
    """Find a player from squads_raw by partial name match."""
    team = squads_raw.get(squad_code, {})
    for p in team.get("players", []):
        shirt = (p.get("nameOnShirt") or "").upper()
        display = (p.get("displayName") or "").upper()
        hint = name_hint.upper()
        if hint in shirt or hint in display:
            return p
    return None

def make_featured(fid, slug, code, name, jersey, pos, sec_pos, nat_name, nat_code, nat_flag, dob, height, foot, stats, bio, keywords):
    return {
        "id": fid,
        "slug": slug,
        "name": name,
        "jerseyNumber": jersey,
        "position": pos,
        "secondaryPosition": sec_pos,
        "nationality": {"name": nat_name, "code": nat_code, "flag": nat_flag},
        "dateOfBirth": dob,
        "height": height,
        "preferredFoot": foot,
        "teamSlug": TEAMS[code]["slug"],
        "image": f"/players/world-cup/{slug}.jpg",
        "stats": stats,
        "bio": bio,
        "searchableName": name,
        "searchableKeywords": keywords,
        "searchableSlug": slug,
    }

featured = [
    make_featured(
        "fp-mbappe","kylian-mbappe","FRA","Kylian Mbappé",10,"Forward","Left Winger",
        "French","FR","/flags/fr.svg","1998-12-20",178,"right",
        {"appearances":0,"goals":0,"assists":0,"yellowCards":0,"redCards":0,"minutesPlayed":0},
        "France's talismanic captain and the world's most lethal finisher, Mbappé leads Les Bleus into Group I.",
        ["Mbappe","France","Striker","Captain"]
    ),
    make_featured(
        "fp-messi","lionel-messi","ARG","Lionel Messi",10,"Forward","Right Winger",
        "Argentine","AR","/flags/ar.svg","1987-06-24",170,"left",
        {"appearances":0,"goals":0,"assists":0,"yellowCards":0,"redCards":0,"minutesPlayed":0},
        "The greatest of all time, Messi leads defending champion Argentina into Group J at 38 years old.",
        ["Messi","Argentina","GOAT","Captain"]
    ),
    make_featured(
        "fp-bellingham","jude-bellingham","ENG","Jude Bellingham",10,"Midfielder","Attacking Midfielder",
        "English","GB","/flags/gb-eng.svg","2003-06-29",186,"right",
        {"appearances":0,"goals":0,"assists":0,"yellowCards":0,"redCards":0,"minutesPlayed":0},
        "England's dynamic midfield talisman, Bellingham is the complete box-to-box player and England's best hope of glory.",
        ["Bellingham","England","Real Madrid","Midfield"]
    ),
    make_featured(
        "fp-haaland","erling-haaland","NOR","Erling Haaland",9,"Forward",None,
        "Norwegian","NO","/flags/no.svg","2000-07-21",194,"left",
        {"appearances":0,"goals":0,"assists":0,"yellowCards":0,"redCards":0,"minutesPlayed":0},
        "The most prolific striker of his generation, Haaland carries Norway's hopes in a competitive Group I.",
        ["Haaland","Norway","Manchester City","Striker"]
    ),
    make_featured(
        "fp-vinicius","vinicius-jr","BRA","Vinícius Jr",7,"Forward","Left Winger",
        "Brazilian","BR","/flags/br.svg","2000-07-12",176,"right",
        {"appearances":0,"goals":0,"assists":0,"yellowCards":0,"redCards":0,"minutesPlayed":0},
        "Brazil's electric winger brings pace, skill and goals — a frontrunner for the Golden Boot from Group D.",
        ["Vinicius","Brazil","Real Madrid","Winger"]
    ),
    make_featured(
        "fp-yamal","lamine-yamal","ESP","Lamine Yamal",19,"Forward","Right Winger",
        "Spanish","ES","/flags/es.svg","2007-07-13",180,"left",
        {"appearances":0,"goals":0,"assists":0,"yellowCards":0,"redCards":0,"minutesPlayed":0},
        "Still a teenager, Yamal is already one of the most electrifying players in the world — Spain's Group G wildcard.",
        ["Yamal","Spain","Barcelona","Winger","Youngest"]
    ),
]

featured_json = {"featuredPlayers": featured}
with open(os.path.join(DATA, "featured-players.json"), "w", encoding="utf-8") as f:
    json.dump(featured_json, f, ensure_ascii=False, indent=2)
print(f"✓ featured-players.json ({len(featured)} players)")

# ── Full squads ───────────────────────────────────────────────────────────────
# Clean up the raw squad data (fix doubled names, keep useful fields)
def clean_player(p, code):
    name = fix_name(p.get("nameOnShirt",""))
    # Fix encoding artifacts
    try:
        name = name.encode("latin-1").decode("utf-8")
    except Exception:
        pass
    club = p.get("club","")
    try:
        club = club.encode("latin-1").decode("utf-8")
    except Exception:
        pass
    return {
        "name": name,
        "position": p.get("position",""),
        "dateOfBirth": p.get("dateOfBirth",""),
        "club": club,
        "height": p.get("height",0),
        "caps": p.get("caps",0),
        "goals": p.get("goals",0),
    }

squads_json = {"squads": {}}
for code, team_data in squads_raw.items():
    slug = TEAMS.get(code, {}).get("slug","")
    if not slug:
        continue
    squads_json["squads"][slug] = {
        "teamCode": code,
        "players": [clean_player(p, code) for p in team_data.get("players", [])]
    }

with open(os.path.join(DATA, "squads.json"), "w", encoding="utf-8") as f:
    json.dump(squads_json, f, ensure_ascii=False, indent=2)
total = sum(len(v["players"]) for v in squads_json["squads"].values())
print(f"✓ squads.json ({len(squads_json['squads'])} teams, {total} players)")

print("\nAll data files written!")
