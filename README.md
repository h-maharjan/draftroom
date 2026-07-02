# Draftroom

A modern, interactive 3D room planner with persistent furniture and layout management.

## Features

- **3D Room Visualization**: Interactive 3D view with drag-to-place furniture
- **Plan View**: Orthographic top-down view with grid overlay
- **Furniture Library**: 12 pre-built furniture pieces with customizable sizing
- **Custom Furniture**: Add your own furniture with custom dimensions and colors
- **Layout Saving**: Save and load multiple room configurations
- **Persistent Storage**: All furniture and layouts stored in PostgreSQL
- **Real-time Grid**: Dynamic grid overlay that scales with room dimensions
- **Responsive Design**: Works on desktop and tablet devices

## Quick Start

### With Docker Compose (Recommended)

```bash
docker compose up --build
```

Then open `http://localhost:3000`

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start PostgreSQL:
   ```bash
   docker compose up -d db
   ```

3. Start the backend:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000`

## How to Use

### Adding Furniture

1. Click the **"Add furniture"** button at the bottom left
2. Fill in the furniture details:
   - **Name**: What you want to call it
   - **Category**: Choose a category (Seating, Table, Bedroom, etc.)
   - **Width & Depth**: Dimensions in meters
   - **Color**: Pick a color for the 3D model
3. Click **"Add Furniture"** to add it to the catalog
4. Drag the furniture from the left panel onto the floor to place it

### Managing Furniture

- **Move**: Drag placed furniture to reposition it
- **Rotate**: Select furniture and use arrow buttons or `[` and `]` keys to rotate in 15° increments
- **Resize**: Select furniture and click **"Resize selected"** to change dimensions
- **Delete**: Select furniture and press `Delete` or click the trash icon

### Room Layout

- **Width & Depth**: Change room dimensions using the inputs in the header
- **Save Layout**: Click **"Save layout"** to save the current room state with all furniture
- **Load Layout**: Choose a saved layout from the dropdown to restore it
- **Clear Room**: Remove all furniture at once

### Views

- **3D View**: Perspective view with orbital camera (right-click drag to rotate)
- **Plan View**: Top-down orthographic view for precise placement

## Architecture

```
├── draftroom.html        # Frontend (Three.js 3D viewer)
├── server.js             # Node.js/Express API
├── package.json          # Dependencies
├── docker-compose.yml    # Multi-container setup
└── Dockerfile            # Container image
```

### Database

PostgreSQL tables:
- `furniture_items`: Furniture catalog with dimensions, colors, and categories
- `room_layouts`: Saved room configurations with furniture placement data

### API Endpoints

- `GET /api/furnitures` - List all furniture
- `POST /api/furnitures` - Create new furniture
- `PUT /api/furnitures/:id` - Update furniture dimensions/properties
- `GET /api/layouts` - List all saved layouts
- `POST /api/layouts` - Save a new layout
- `PUT /api/layouts/:id` - Update an existing layout

## Environment

Create a `.env` file (optional, defaults are provided):

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/draftroom
PORT=3000
```

## Technologies

- **Frontend**: Three.js, HTML5 Canvas
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose
