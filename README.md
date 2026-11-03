# Unframe — Post Full-Screen Photos on Instagram

> Publish true full-height vertical photos and carousels up to 9:16 on Instagram without losing a single pixel to 4:5 or 1:1 square crops.

![Unframe Banner](public/icon-512.png)

---

## ✨ Features

- **True 9:16 Uncropped Publishing:** Post full-length portraits and vertical artwork directly to Instagram feed via official Meta Graph API.
- **Multi-Photo Carousel Support:** Upload up to 10 photos per post with drag-and-drop or reordering. Slide 1 anchors the aspect ratio for the entire carousel.
- **Accurate Real-Time Previews:**
  - **Feed View:** Live simulation of feed rendering, caption layout, and carousel swipe physics.
  - **Profile Grid View (1:1):** See exactly how Instagram centers and crops your post on your 3-column profile grid.
  - **Mobile Native Switcher:** 1-tap toggle between Edit Post and Live Preview on phones with zero layout clutter.
- **Official Meta OAuth Integration:** Secure direct login via Meta Graph API. No passwords stored or handled.
- **PromptSoul Visual System:** Deep obsidian glass theme (`#060713`), whisper-subtle cyber grid, apple-grade shadows, and responsive glass controls.

---

## 🚀 Cloudflare Deployment

### Option 1: Cloudflare Pages (Recommended)
1. In Cloudflare Dashboard, navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository (`unframe` or `prompt-studio`).
3. Set build settings:
   - **Framework preset:** `Next.js`
   - **Build command:** `npx @cloudflare/next-on-pages` or `npm run build`
   - **Build output directory:** `.vercel/output/static` (or `.worker-next`)
4. Set Environment Variables in Cloudflare Pages:
   - `NODE_VERSION`: `20`
   - `FACEBOOK_APP_ID`: Your Meta App ID
   - `FACEBOOK_APP_SECRET`: Your Meta App Secret
   - `NEXT_PUBLIC_APP_URL`: Your production domain (e.g. `https://unframe.yourdomain.com`)

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm run start
```

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI & Styling:** Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Language:** TypeScript 5
- **Deployment:** Cloudflare Pages / Workers & Vercel compatible
