# Plan for Bike Growth Timeline Race Chart

Goal: Create an engaging Bike Race Chart for Bikeshare growth across global cities.

Let's take the top biking cities globally and show a race.

Requirements:

1. Increment is monthly (2 seconds / month to start)
1. Growth each month must be visually represented as a continuous increase (not stepped per month)
1. Will start in the year the first city has data. There may be only one city in the chart to start.
1. As cities launch (get their first bikeshare ride), they join the chart below the current bikeshares.
1. At the end of each chart, we add the Biker.tsx for that city that continues to peddle. The biker speed depends on the rate of growth for that month.
1. Data for each city will live at: https://cdn.jsdelivr.net/gh/commanderking/citybikeshare@main/analysis/boston/visuals.json

Questions to answer:

1. Are there libraries we can use directly? Or do we lose too much custom functionality?

- https://github.com/hatemhosny/racing-bars
- https://github.com/Erik3010/bar-chart-race/
- https://github.com/bchao1/chart-race-react
- Roll our own, primarily leveraging d3 related functions
