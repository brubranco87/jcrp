

# JCRP - Automações

## Overview
Single-page application with minimalist design featuring 3 agent cards in a responsive grid.

## Components

### AgentCard (reusable)
- Props: `title`, `description`, `icon`, `disabled`, `children`
- When disabled: 50% opacity, no pointer events, "Em breve" badge top-right
- Subtle shadow, rounded corners, neutral colors

### Index Page
- **Header**: "JCRP" bold title + "Automações" subtitle
- **Grid**: 3 cards (1 col mobile → 3 cols desktop)
  - **JUMPER** (FileSpreadsheet) — active — "Converte Histórico Operacional em PLANFINAL"
  - **STONER** (FileText) — disabled
  - **MAQER** (Settings) — disabled

## Design
- Neutral palette (white, gray, black)
- Clean, minimal layout with proper spacing

