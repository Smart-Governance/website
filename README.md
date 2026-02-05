# Smart Governance Site


## Project Structure

```
smartgovernance-site/
  index.html
  contact.html
  service.html
  service-overview.html
  ar/
    index.html
    contact.html
    service.html
    service-overview.html
  partials/
    header.html
    footer.html
  assets/
    css/
      main.css
      variables.css
      reset.css
      base.css
      components.css
      rtl.css
    js/
      main.js
    img/
    fonts/
  scripts/
    build-partials.ps1
    build-partials.js
```

## How To Run Locally

Because the site uses root-relative paths like `/assets/...`, run a local web server
from the project root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Header/Footer Partials Workflow

Header and footer markup live in `partials/header.html` and `partials/footer.html`.
After editing either file, rebuild the pages:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-partials.ps1
```

Alternatively:

```powershell
node scripts/build-partials.js
```

## CSS Ownership

- `assets/css/variables.css`: tokens (colors, typography, spacing, radii).
- `assets/css/base.css`: base element styles and layout primitives.
- `assets/css/components.css`: section and component styles.
- `assets/css/rtl.css`: RTL overrides for Arabic pages.

## JavaScript

- `assets/js/main.js`: shared UI behaviors (header, sliders, scroll effects).
