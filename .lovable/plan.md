# AI Community Kurdistan - کۆمەڵگای زیرەکی دەستکرد

With name ZHEERAI

## Overview

A full-stack Kurdish (Sorani) community platform for showcasing AI projects, Q&A discussions, and blog posts. RTL layout, NRT or AVA font, dark purple accent color, professional modern design with Framer Motion animations and GSAP for scroll-driven effects.

## Design System

- **Font**: NRT or AVA (loaded via Google Fonts / CDN) for all Kurdish text
- **Direction**: Full RTL layout
- **Primary color**: Deep purple (#6B21A8 range) for buttons. with lighter/darker variants for theme 
- **Mode**: Light mode primary, clean white backgrounds with purple accents
- **Style**: Minimal, editorial, 2026 design — generous whitespace, crisp typography, subtle shadows, no gradients or emojis
- **Animations**: Framer Motion for page transitions & UI interactions, GSAP for scroll-triggered reveals — all subtle and professional

## Pages & Features

### 1. Home / Landing Page (سەرەتا)

- Hero section with community tagline in Kurdish
- Featured AI projects grid (3-4 cards)
- Latest Q&A threads preview
- Recent blog posts carousel
- Community stats (members, projects, posts)

### 2. AI Projects Showcase (پڕۆژەکان)

- Grid/masonry layout of project cards (thumbnail, title, description, tags, author)
- Filter by category: AI Website, AI Mobile App, AI Tool, AI Solution
- Upload/submit new project form (title, description, images, links, tags)
- Individual project detail page with media gallery

### 3. Q&A Forum (پرسیار و وەڵام)

- Reddit-style threaded discussion
- Post a question with tags/categories
- Answer/comment system with upvote/downvote
- Sort by: newest, most voted, unanswered
- Individual thread view

### 4. Blog (بڵاوکراوەکان)

- Blog listing with featured post hero
- Blog post detail page with rich text content
- Categories/tags for filtering
- Author info card

### 5. User Profile (پرۆفایل)

- User's projects, questions, and blog posts
- Basic profile info display

## Navigation

- Sticky top navbar with logo, nav links (Home, Projects, Q&A, Blog), and user menu
- Mobile: slide-in drawer menu
- All in Kurdish Sorani

## Backend (Supabase / Lovable Cloud)

- **Tables**: projects, questions, answers, blog_posts, votes, tags, profiles
- **Storage**: Project images/thumbnails bucket
- **RLS**: Public read, authenticated write for own content
- No auth in V1 — mock user for content creation, auth added later

## Libraries

- **GSAP** — scroll-triggered animations on landing page sections
- **Framer Motion** — page transitions, card hover effects, modal animations
- **hls.js** — if projects include video demos
- **Lucide React** — all icons