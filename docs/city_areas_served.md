# Bikeshare Systems — Areas Served

Each "city" tracked in this project is really a bikeshare *system*, and most systems
serve more than their namesake city. This doc records the municipalities / areas
each system actually covers.

Notes:
- Reflects coverage as of **mid-2026**. Service areas expand (and occasionally
  contract) over time, so treat the municipality lists as a snapshot.
- Municipalities are the meaningful unit for most systems. A few systems
  (Seoul, London, Mexico City, Rosario) are better described by districts/boroughs
  within a single city — noted where that's the case.
- Keys match `src/app/constants/cities.ts`.

---

## United States

### austin — CapMetro Bikeshare (formerly MetroBike)
Single municipality: **City of Austin** (downtown, UT campus/West Campus, and
central neighborhoods). Fully e-bike fleet since the 2024 rebrand.
[Source](https://www.capmetro.org/bikeshare)

### boston — Bluebikes
**13 municipalities** across Greater Boston:
Arlington, Boston, Brookline, Cambridge, Chelsea, Everett, Malden, Medford,
Newton, Revere, Salem, Somerville, Watertown.
(The system is municipally owned by Boston, Brookline, Cambridge, Everett, and
Somerville; the others host stations.)
[Source](https://en.wikipedia.org/wiki/Bluebikes)

### chattanooga — Bike Chattanooga
Single municipality: **City of Chattanooga** (Downtown, Southside, North Shore,
and along the Tennessee Riverpark).
[Source](https://bikechattanooga.com/)

### chicago — Divvy
**Chicago + Evanston.** (Oak Park participated briefly but withdrew in 2017.)
Divvy is one of the largest systems in North America by service-area size.
[Source](https://en.wikipedia.org/wiki/Divvy)

### columbus — CoGo
**Columbus, Bexley, Grandview Heights, Upper Arlington** (plus the Easton area).
⚠️ CoGo ceased operations in **Spring 2025**.
[Source](https://en.wikipedia.org/wiki/CoGo)

### jersey_city — Citi Bike (New Jersey)
**Jersey City + Hoboken, NJ.** Operated as part of the same Citi Bike system as
New York City, but tracked separately here.
[Source](https://citibikenyc.com/nj)

### los_angeles — Metro Bike Share
City of Los Angeles areas: **Downtown/Central LA, Hollywood, North Hollywood,
Westwood/Westside, Venice**, plus the **Port of LA (San Pedro)**. (Pasadena was
served 2017–2018, then discontinued.)
[Source](https://en.wikipedia.org/wiki/Metro_Bike_Share)

### new_york_city — Citi Bike
NYC boroughs: **Manhattan, Brooklyn, Queens, and the Bronx.** (The same Citi Bike
system also covers Jersey City and Hoboken, NJ — see `jersey_city`.)
[Source](https://en.wikipedia.org/wiki/Citi_Bike)

### philadelphia — Indego
Single municipality: **City of Philadelphia** — Center City plus South, West,
North, and Northwest neighborhoods (roughly Germantown to the Navy Yard, and
Cobbs Creek to the Delaware River).
[Source](https://www.rideindego.com/)

### pittsburgh — POGOH
City of Pittsburgh neighborhoods: **Downtown, South Side, Oakland, Strip District,
North Side**, and more. A planned Phase 4 expansion (from ~2026) reaches **beyond
city limits** for the first time (Wilkinsburg, Homestead, West Homestead, Millvale).
[Source](https://pogoh.com/expansion/)

### san_francisco — Bay Wheels
Regional Bay Area system: **San Francisco, Oakland, Berkeley, Emeryville,
Daly City, and San Jose.**
[Source](https://en.wikipedia.org/wiki/Bay_Wheels)

### washington_dc — Capital Bikeshare
**8 jurisdictions** across DC/MD/VA:
Washington, DC; Arlington, Alexandria, Fairfax County, City of Fairfax, and Falls
Church (VA); Montgomery County and Prince George's County (MD).
[Source](https://en.wikipedia.org/wiki/Capital_Bikeshare)

---

## Canada

### montreal — BIXI
Greater Montréal: **Montréal (island), Westmount, Mount Royal, Montréal-Est,
Longueuil, Laval, Boucherville, Terrebonne, and Sainte-Julie.**
[Source](https://en.wikipedia.org/wiki/BIXI_Montr%C3%A9al)

### toronto — Bike Share Toronto
Single amalgamated **City of Toronto** — now reaching every ward, including the
former municipalities of Etobicoke, North York, Scarborough, East York, and York.
[Source](https://en.wikipedia.org/wiki/Bike_Share_Toronto)

### vancouver — Mobi
Single municipality: **City of Vancouver** (downtown peninsula plus Kitsilano,
Point Grey, Kerrisdale, Grandview-Woodland, and the central/Main Street corridor).
[Source](https://vancouver.ca/streets-transportation/public-bike-share-system.aspx)

---

## Mexico

### guadalajara — MiBici
**3 municipalities** of the Guadalajara metro area: **Guadalajara, Zapopan, and
Tlaquepaque.**
[Source](https://es.wikipedia.org/wiki/MiBici)

### mexico_city — Ecobici
**6 boroughs (alcaldías)** of Mexico City: **Cuauhtémoc, Miguel Hidalgo, Benito
Juárez, Azcapotzalco, Coyoacán, and Álvaro Obregón.**
[Source](https://en.wikipedia.org/wiki/Ecobici_(Mexico_City))

---

## South Korea

### seoul — Ddareungi (Seoul Bike)
Single city, but citywide: **Seoul**, across its 25 districts (gu).
[Source](https://en.wikipedia.org/wiki/Ddareungi)

### daejeon — Tashu
Single city: **Daejeon Metropolitan City** (most of the city, concentrated around
Dunsan and Doan New Towns, government offices, and subway stations).
[Source](https://bikesharemap.com/daejeon/)

---

## Taiwan

### taipei — YouBike
Primarily **Taipei City** (the system tracked here). YouBike also operates as a
separate regional network across **New Taipei City** and many other Taiwanese
municipalities (Taoyuan, Hsinchu, Taichung, Tainan, Kaohsiung, and more).
[Source](https://en.wikipedia.org/wiki/YouBike)

---

## Norway

### bergen — Bergen Bysykkel
Single city: **Bergen** (~100 stations around the city).
[Source](https://urbaninfrastructure.no/bergen-bysykkel-as/?lang=en)

### oslo — Oslo Bysykkel
Single city: **Oslo** (stations concentrated within Ring 3).
[Source](https://urbaninfrastructure.no/oslo-bysykkel-as/?lang=en)

### trondheim — Trondheim Bysykkel
Single city: **Trondheim** (city center and surrounding areas).
[Source](https://urbaninfrastructure.no/trondheim-bysykkel-as/?lang=en)

---

## Finland

### helsinki — HSL City Bikes
**Helsinki + Espoo** (a joint service). Vantaa runs its own separate city-bike
system, which is suspended for 2026–2028.
[Source](https://www.hsl.fi/en/citybikes/helsinki)

---

## United Kingdom

### london — Santander Cycles
Central and inner **London** boroughs (partly or fully): Westminster, City of
London, Camden, Islington, Hackney, Tower Hamlets, Southwark, Lambeth, Wandsworth,
Kensington & Chelsea, Hammersmith & Fulham, and Newham (partial). Coverage is
concentrated in central/inner London; Outer London is largely unserved.
[Source](https://en.wikipedia.org/wiki/Santander_Cycles)

---

## Argentina

### rosario — Mi Bici Tu Bici
Single city: **Rosario** — ~94 stations connecting 30+ *barrios* across all
districts of the city.
[Source](https://www.mibicitubici.gob.ar/)
