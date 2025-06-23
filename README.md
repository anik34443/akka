# School Reunion Website 2024

A bilingual (Bengali/English) website for managing school reunion registrations and event information.

## Features

- Countdown timer to the event
- Event highlights with animations
- Photo gallery
- Responsive design
- Bilingual support (Bengali for user content)
- Admin dashboard with statistics

## Setup

1. Clone the repository
2. Add your images:
   - Place hero background image as `assets/hero-bg.jpg`
   - Add gallery images in `assets/gallery/` named as `image1.jpg`, `image2.jpg`, etc.

3. Start a local server:
```bash
python -m http.server 3000
# or
npx http-server -p 3000
```

4. Access the website:
- Main site: http://localhost:3000
- Admin panel: http://localhost:3000/Admin.html

## Admin Access

- Username: admin
- Password: admin123

## Directory Structure

```
.
├── index.html          # Main website
├── Styles.css         # Main styles
├── App.js            # Main JavaScript
├── Admin.html        # Admin panel
├── Admin-styles.css  # Admin panel styles
├── Admin.js         # Admin panel JavaScript
└── assets/
    ├── gallery/     # Event photos
    └── payment/     # Payment gateway images
```

## Browser Support

The website is tested and works on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 
