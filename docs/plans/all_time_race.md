# Plan for All Time Trips Chart

Data source:

1. Data will be from visuals.json for each city. The data is published here: https://cdn.jsdelivr.net/gh/commanderking/citybikeshare@main/analysis/boston/visuals.json. The key field to use is: volume_by_month.
2. On page/chart load, we should make a call to get all data for all cities we have access to.

Calculations:

1. We'll need to aggregate the volume_by_month to get total trips for each city.

Chart:

1. Horizontal Bar Chart where each city's name is printed on the left
2. The bar chart length will be based on total trips of the city during its entire existence.
3. We should break the cities into two charts - one chart will contain the cities with high volumne, and the second with low volume. This way they scale properly and cities with shorter trips don't get a negligible bar length. Please decide how it makes sense to split the cities.
4. Title will be: All Time Trips by Each City

Technology:

1. Please use observable plot library if possible. If there's custom behavior needed, use d3.
