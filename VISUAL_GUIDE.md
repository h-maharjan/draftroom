# Draftroom - Quick Visual Guide

## What You Should See

### On Page Load (Default 5m × 4m Room)

1. **Left Sidebar** (narrow column on the left):
   - Title "Furniture"
   - A list of 12 furniture items, each with:
     - A small square preview icon
     - Item name (e.g., "Sofa", "Bed", "Desk")
     - Dimensions in meters (e.g., "2.00 × 0.90 m")

2. **Main Canvas Area** (center - the large area):
   - A blue-gridded floor (like graph paper)
   - Faint walls on the edges  
   - Should show a room ready for furniture placement

3. **Header** (top):
   - Title "DRAFTROOM"
   - Width/Depth input fields (5 and 4)
   - "3D" / "PLAN" view toggle buttons
   - "Save layout" and "Load layout" buttons
   - "Clear room" button

4. **Status Bar** (bottom):
   - Shows room dimensions "5.0 × 4.0 m"
   - Shows item count "0 items placed"
   - Shows "Saved" (green status if connected to database)
   - Buttons: "Add furniture", "Resize selected"

## How to Test

### Test 1: See the Room
- [ ] Refresh the page
- [ ] You should see a blue grid floor with walls around it
- [ ] The room should be clearly visible in 3D view

### Test 2: Add Furniture
- [ ] Drag "Sofa" from the left sidebar onto the floor
- [ ] You should see a semi-transparent preview following your cursor
- [ ] Release the mouse - a blue sofa should appear
- [ ] Status bar should now show "1 items placed"

### Test 3: Modify Room Size
- [ ] Change width from 5 to 7 in the header
- [ ] Press Enter or click elsewhere
- [ ] The room floor should expand immediately
- [ ] Status bar should update to "7.0 × 4.0 m"

### Test 4: Switch Views
- [ ] Click "PLAN" button
- [ ] The view should switch to a top-down orthographic view
- [ ] You should see the sofa from above
- [ ] Click "3D" to go back to perspective view

### Test 5: Save & Load
- [ ] Click "Save layout"
- [ ] Enter a name like "My Living Room"
- [ ] Click "Add Furniture"
- [ ] A dropdown should appear in the header with your saved layout
- [ ] Select it to reload the same room configuration

## Troubleshooting

### Issue: Black/empty canvas
- **Solution**: The THREE.js library wasn't loading. Make sure you're running the latest version with:
  ```bash
  docker compose down
  docker compose up --build
  ```

### Issue: Room grid doesn't show
- **Solution**: Refresh the page and wait a few seconds for everything to load

### Issue: Can't drag furniture
- **Solution**: Make sure you're dragging FROM the left sidebar TO the main canvas area, not clicking the buttons

### Issue: "Offline" status
- **Solution**: This is normal if the database connection hasn't completed. The app still works locally. Once database connects, it will show "Saved".

## File Structure

- `draftroom.html` - The full interactive app (static file served at http://localhost:314)
- `server.js` - Node.js API for saving/loading furniture and layouts
- `docker-compose.yml` - Database and server configuration

## Next Steps

1. Place several furniture items
2. Switch between 3D and Plan views
3. Resize items and adjust room size
4. Save a layout
5. Create another layout and save it
6. Switch between your saved layouts

Enjoy designing!
