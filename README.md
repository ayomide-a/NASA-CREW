# Moonwalkers 9 — Lunar Ephemeris Explorer

Moonwalkers 9 is a lunar landing-site planning and comparison tool developed for the **NASA Space Apps Challenge: Lunar Landing Site Navigator** challenge. It helps users explore how a candidate site's location, surrounding terrain, and observation time affect the apparent positions and visibility of the Sun and Earth.

## Background

Choosing a lunar landing site involves balancing science objectives with practical mission needs. Local slope and hazards, illumination, thermal conditions, access to resources, and communications can all influence whether a location is useful for a mission.

An ephemeris predicts where celestial objects appear at a given location and time. This application reports Sun and Earth azimuth and elevation, then compares those positions with the local terrain horizon. Sun visibility can inform planning for illumination and solar power; Earth visibility can inform direct-to-Earth communications planning. Terrain may obstruct either line of sight.

The results are intended for exploration and early mission planning. They are decision-support information, not a complete landing-site safety certification.

## What the application does

- Select a lunar location on an interactive 2D map or 3D globe, choose a point of interest, or enter latitude and longitude.
- Set an observation time window and request Sun and Earth ephemerides.
- Compare two sites, with shared or separate observation windows.
- View per-site sky-position charts and time-above-terrain-horizon summaries.
- Explore LOLA-derived terrain information and a landing-site assessment.
- Review observation data in a table and download it as CSV.

## Data sources

- **NASA JPL Horizons** provides the Sun and Earth observer ephemerides.
- **NASA Moon Trek / LRO LOLA DEM** services provide elevation samples, terrain profiles, and map previews.
- **USGS Astrogeology STAC** provides LOLA shot-observation metadata and previews where available.

The services and datasets are accessed by the API handlers in `api/`; browser map libraries and fonts are loaded from their configured CDNs.

## Code overview

```text
api/
  horizons.js   Validates ephemeris requests and queries NASA JPL Horizons.
  terrain.js    Samples LOLA elevation profiles and calculates terrain horizons.
  lola.js       Provides elevation, terrain, DEM preview, and LOLA shot data.

public/
  index.html    Overview and explorer tabs, site selection, forms, and results UI.
  app.js        Application behavior, API requests, map interactions, charts,
                comparison, assessment, playback, and CSV export.
  moon-globe.js Three.js globe rendering, surface selection, and site markers.
  styles.css    Responsive layout, visual theme, and component styling.
  sparkle-trail.js  Decorative mouse sparkle effect.
  moon-icon.svg     Moon logo and favicon.
  data/             Points-of-interest and lunar-region data.
  assets/           Globe imagery.

test-local.js   Lightweight local server for the static app and API handlers.
vercel.json     Vercel static-output configuration.
```

## Run locally

Requires **Node.js 22**. From the repository root, run:

```sh
node test-local.js
```

Then open [http://localhost:4173/](http://localhost:4173/). The local server routes `/api/horizons`, `/api/terrain`, and `/api/lola` to their corresponding handlers. Network access is needed for the external NASA and USGS services and CDN-hosted browser libraries.

## Contributors

Ayomide, Chibuike, Dina, Ethan, Hannah, Isabelle
