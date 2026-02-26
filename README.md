# KUKA Cell Visualizer - Pro Web

A standalone, completely client-side interactive web visualizer for KUKA Robot Palletizing Schemes. It displays 2D layouts of radiator arrangements, calculates the positions (offsets), and supports localized interfaces.

## Features

- **Client-Side Rendering:** No server required. Pure HTML, CSS (Glassmorphism), and Vanilla JavaScript.
- **Dynamic Calculation:** Automatically generates offsets and calculates layout coordinates for multiple pallet sizes based on KRL stacking logic.
- **Interactive Stacking Matrix:** A complete overview table allowing quick selection of radiator widths and lengths.
- **Multi-Language Support:** TR, RU, UZ localizations built-in.
- **Print Mode:** Black and white high-contrast layout specifically optimized for A4 landscape printing as operator technical sheets.

## Architecture

- `scheme_hmi_v3_industrial.html` - The main UI structure and inline interactive components.
- `kuka_design_system.css` - Custom design system for standard industrial visual features.
- `production_metrics.js` - Core rendering engine, layout mathematical formulas, and DOM manipulation.

## Usage

Simply open the `scheme_hmi_v3_industrial.html` file in any modern web browser. No compilation or dependencies are required.
