# Mobile-First Design Implementation Guidelines

## Core Design Principles

- Follow Instagram-style mobile interface patterns
- Prioritize visual content with minimal text
- Maintain clean, uncluttered layouts
- Use consistent spacing and sizing

## Grid Layout

- Implement 3x3 grid layout for destination cards
- Use minimal 1px gaps between items
- Ensure square aspect ratio for all images
- Add bottom margin to accommodate fixed navigation (14px)

## Destination Cards

- Square format (1:1 aspect ratio)
- Minimal text overlay with destination name
- Edit button in top-right corner
- Fallback image for missing images
- No padding or margins between cards
- Subtle hover states for interactive elements

## Navigation

- Fixed bottom navigation bar
- Three primary actions:
  1. Search (left)
  2. Add new destination (center, floating)
  3. Calendar (right)
- Floating action button specs:
  - Blue background (#3B82F6)
  - 56px diameter (w-14 h-14)
  - White icon
  - Raised with shadow
  - Small label underneath
- Navigation bar specs:
  - White background
  - Light top border
  - 10px label text
  - 24px icons (w-6 h-6)
  - 8px spacing between icon and label

## Spacing Guidelines

- No padding on container edges
- 1px gaps between grid items
- 24px padding on navigation sides (px-6)
- 8px vertical padding on navigation (py-2)

## Interactive Elements

- Clickable cards for editing
- Floating add button for new destinations
- Search and calendar buttons for filtering
- Touch-friendly tap targets (minimum 44px)

## Color Scheme

- White backgrounds (#FFFFFF)
- Light gray borders (#E5E7EB)
- Blue accent for primary actions (#3B82F6)
- Black text for labels
- White icons on blue backgrounds

## Typography

- 10px for navigation labels
- System font stack
- Minimal text display on cards
- Clear hierarchy with destination names

## Responsive Behavior

- Mobile-first approach
- Full-width grid
- Fixed bottom navigation
- Responsive image sizing
- Automatic grid reflow based on screen width
