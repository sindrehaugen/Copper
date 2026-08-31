# Copper

**A modern, browser-based System Design Canvas for Audio-Visual (AV) and IT infrastructure.**

> 🚧 **Work in Progress (Under Construction):** Copper is currently under heavy development. Core APIs, features, and schemas are actively being built and are subject to change.

Copper is an engineering tool for designing physical L1 network topologies, AV signal flows, and rack elevations. It provides a node-based interface to draw devices, connect ports, and automatically generate cable schedules and 3D visual representations of the resulting systems. 

Built with modern web technologies, it features an automated orthogonal routing engine, responsive Material Design 3 interfaces, and strict adherence to industry-standard schemas.

![Copper Layout Engine Example](docs/assets/showcase.png) <!-- Placeholder for actual screenshot -->

## Features

- **Automated Wiring & Layouts:** Uses ELK (Eclipse Layout Kernel) and a custom routing configuration to automatically map and route complex schematics without overlapping cables. 
- **L1-First Schema:** Modeled around physical infrastructure. Devices have distinct front and rear ports, distinct interfaces (RJ45, SFP, Phoenix, HDMI), and lifecycle states.
- **Rack Elevations:** Generates dynamic rack elevations directly from the logical schematic data.
- **3D Projections:** Projects the 2D logical layout into a 3D physical representation using `three.js`.
- **Cable Schedules:** Automatically compiles accurate cable schedules and termination reports.
- **Material Design 3:** Beautiful, responsive UI adopting the latest Material Design 3 guidelines with automatic Dark/Light mode support.

## Tech Stack

- **Framework:** React + TypeScript + Vite
- **Canvas Rendering:** AntV X6 (DOM/SVG node canvas)
- **Auto-routing:** `elkjs` (Eclipse Layout Kernel)
- **3D Engine:** `three.js` + `@react-three/fiber`
- **Styling:** Material Design 3 CSS variables & tokens
- **State Management:** Zustand

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sindrehaugen/Copper.git
   cd Copper/app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```
   Open `http://localhost:5173/` in your browser. The app will load a sample schematic by default.

## Data Model

Copper is designed to act as a pure UI layer over standard infrastructure schemas. It uses the `EasySchematic` format internally and is designed to be compatible with industry standards like NetBox (devices, interfaces, front/rear ports, cables) and the CC0 `devicetype-library`. 

## Architecture

Copper has **no internal database**. The web application operates on a stateless frontend architecture, reading and writing graph topologies through standardized API contracts. The canvas, 3D views, and schedules are all pure projections of the underlying document schema. 

