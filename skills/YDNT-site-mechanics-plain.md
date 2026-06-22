# How youdontneedthis.us Works (Food Truck Edition)

Think of the whole operation like running a food truck.

- **The Menu** is your `products.csv` file — the list of everything for sale, with names and prices.
- **The Kitchen** is the inventory folder on your Mac (and its mirror on GitHub) — where all the actual photos of the items are stored.
- **The Printer** is `build.js` — the machine that reads the Menu, walks into the Kitchen, grabs the right photo for each item, and prints a finished, ready-to-hang menu board.
- **The Window** is GitHub Pages — the part customers actually see when they pull up to the truck. It only displays whatever menu board has already been printed and handed to it. It does not print anything itself.

**1. How an update flows from Google Sheets to the live site**
You update prices or descriptions in your spreadsheet, export it as `products.csv`, and drop it into the project. Then you run the Printer (`build.js`) on your own Mac. It reads the new Menu, finds the matching photo for every item in the Kitchen, and prints a brand new menu board (the `dist` file). You hand that finished board to GitHub, and GitHub pushes it into the Window for customers to see.

**2. How images get from your Mac to a stranger's browser**
The Printer doesn't carry the photos themselves — that would be like stapling actual food to the menu board. Instead, for each item, it prints a small note that says "photo for this one lives at this exact address in the Kitchen." Since the Kitchen also exists online (the inventory repo on GitHub), a customer's browser reads that note and fetches the photo straight from there.

**3. The one rule that must never be broken**
Always run the Printer on your own Mac and pack the freshly printed board with the rest of your changes before pushing to GitHub. The Window can only display a board that's already been printed — it has no printer of its own.

**4. What happens if you skip that rule**
This is exactly what happened recently. GitHub's delivery truck tried to act as a backup printer and ran `build.js` itself — but GitHub's truck has no access to your Kitchen on your Mac. It searched for photos, found nothing, and printed a menu board full of "No Image Available" placeholders instead of real pictures. Customers saw a broken menu until we told GitHub's truck to stop trying to print and just display the good board you'd already made.
