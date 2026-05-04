# "You May Also Like" — Wallpaper Recommendation Logic
**Argosmob Tech & AI Pvt. Ltd.**
Stack: React.js · Express.js · Supabase

---

## Overview

This document defines the recommendation logic for the "You May Also Like" section on the wallpaper website. The system is based on **Weighted Multi-Signal Scoring** across three category groups: **Room**, **Style**, and **Color**.

Categories are stored as rows in the `categories` table, each belonging to a `category_groups` row (e.g., group name = `"room"`, `"style"`, `"color"`). Wallpapers are linked to categories via a junction table `wallpaper_categories`.

---

## Database Schema Context

```sql
-- Category groups: room | style | color
create table public.category_groups (
  id   uuid primary key default extensions.uuid_generate_v4(),
  name text not null unique  -- 'room' | 'style' | 'color'
);

-- Categories: Living Room, Boho, Beige, etc.
create table public.categories (
  id          uuid primary key default extensions.uuid_generate_v4(),
  group_id    uuid not null references category_groups(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  is_active   boolean default true,
  description text,
  created_at  timestamptz default now()
);

create index idx_categories_group on public.categories using btree (group_id);
create index idx_categories_slug  on public.categories using btree (slug);

-- Junction table linking wallpapers to their categories
create table public.wallpaper_categories (
  wallpaper_id uuid references wallpapers(id) on delete cascade,
  category_id  uuid references categories(id) on delete cascade,
  primary key (wallpaper_id, category_id)
);

create index idx_wc_wallpaper on public.wallpaper_categories(wallpaper_id);
create index idx_wc_category  on public.wallpaper_categories(category_id);
```

---

## Why Weighted Scoring?

People buy wallpapers based on *vibe first, practicality second.*

| Priority | Group  | Reason |
|----------|--------|--------|
| 1st | **Style** | Captures aesthetic vibe — the strongest emotional driver |
| 2nd | **Color** | Visual & emotional — drives impulse decisions |
| 3rd | **Room**  | Functional context — least decisive for wallpaper selection |

---

## Scoring Formula

When a user views a wallpaper, every other wallpaper is scored and the **top 8** are returned.

| Signal | Weight |
|--------|--------|
| Same **Style** category | 40 pts |
| Same **Color** category | 35 pts |
| Same **Room** category  | 25 pts |
| **Max Score**           | **100 pts** |

### Example

User views: **Boho (style) + Beige (color) + Living Room (room)**

| Candidate | Style | Color | Room | Score |
|-----------|-------|-------|------|-------|
| Boho + Beige + Bedroom      | ✅ 40 | ✅ 35 | ❌ 0 | **75** → Show |
| Boho + Blue + Living Room   | ✅ 40 | ❌ 0  | ✅ 25 | **65** → Show |
| Modern + Beige + Living Room| ❌ 0  | ✅ 35 | ✅ 25 | **60** → Show |
| Modern + Green + Bedroom    | ❌ 0  | ❌ 0  | ❌ 0  | **0**  → Hide |

> **Threshold:** Only show wallpapers with score > 0 (at least one matching category signal).

---

## Implementation

### Step 1 — Fetch Current Wallpaper's Categories

```sql
-- Get all category IDs for the current wallpaper, with their group names
SELECT
  c.id        AS category_id,
  c.slug      AS category_slug,
  cg.name     AS group_name   -- 'room' | 'style' | 'color'
FROM wallpaper_categories wc
JOIN categories      c  ON c.id  = wc.category_id
JOIN category_groups cg ON cg.id = c.group_id
WHERE wc.wallpaper_id = :current_wallpaper_id
  AND c.is_active = true;
```

### Step 2 — Fetch Candidate Wallpapers Sharing at Least One Category

```sql
-- Returns distinct wallpaper IDs sharing at least one category with current
SELECT DISTINCT wc.wallpaper_id
FROM wallpaper_categories wc
WHERE wc.category_id = ANY(:category_ids)
  AND wc.wallpaper_id != :current_wallpaper_id;
```

### Step 3 — Scoring Utility

```js
// utils/scoreWallpaper.js

/**
 * Scores a candidate wallpaper against the current one.
 *
 * @param {Object} currentCats   - { style: uuid, color: uuid, room: uuid }
 * @param {Object} candidateCats - { style: uuid, color: uuid, room: uuid }
 * @returns {number} score 0–100
 */
function scoreWallpaper(currentCats, candidateCats) {
  let score = 0;
  if (candidateCats.style && candidateCats.style === currentCats.style) score += 40;
  if (candidateCats.color && candidateCats.color === currentCats.color) score += 35;
  if (candidateCats.room  && candidateCats.room  === currentCats.room)  score += 25;
  return score;
}

module.exports = { scoreWallpaper };
```

---

### Full Express.js Route

```js
// routes/recommendations.js
const { createClient } = require('@supabase/supabase-js');
const { scoreWallpaper } = require('../utils/scoreWallpaper');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

app.get('/wallpapers/:id/recommendations', async (req, res) => {
  try {
    const currentId = req.params.id;

    // 1. Fetch current wallpaper's categories with group names
    const { data: currentCatRows, error: e1 } = await supabase
      .from('wallpaper_categories')
      .select(`
        category_id,
        categories (
          id,
          slug,
          group_id,
          category_groups ( name )
        )
      `)
      .eq('wallpaper_id', currentId);

    if (e1 || !currentCatRows?.length) {
      return res.status(404).json({ error: 'Wallpaper or categories not found' });
    }

    // 2. Map categories by group: { style: uuid, color: uuid, room: uuid }
    const currentCats = {};
    const categoryIds = [];

    for (const row of currentCatRows) {
      const groupName = row.categories?.category_groups?.name; // 'style' | 'color' | 'room'
      const catId     = row.category_id;
      if (groupName) currentCats[groupName] = catId;
      categoryIds.push(catId);
    }

    // 3. Fetch all wallpaper IDs sharing at least one category
    const { data: candidateRows } = await supabase
      .from('wallpaper_categories')
      .select('wallpaper_id, category_id')
      .in('category_id', categoryIds)
      .neq('wallpaper_id', currentId);

    if (!candidateRows?.length) return res.json({ recommendations: [] });

    // 4. Group candidate categories by wallpaper_id
    const candidateMap = {};
    for (const row of candidateRows) {
      if (!candidateMap[row.wallpaper_id]) candidateMap[row.wallpaper_id] = [];
      candidateMap[row.wallpaper_id].push(row.category_id);
    }

    // 5. Fetch full category details for all candidate category IDs
    const allCandidateCatIds = [...new Set(candidateRows.map(r => r.category_id))];
    const { data: catDetails } = await supabase
      .from('categories')
      .select('id, group_id, category_groups ( name )')
      .in('id', allCandidateCatIds);

    // category_id -> group_name lookup
    const catGroupMap = {};
    for (const cat of catDetails) {
      catGroupMap[cat.id] = cat.category_groups?.name;
    }

    // 6. Build { style, color, room } map per candidate wallpaper
    const candidateCatsMap = {};
    for (const [wallpaperId, catIds] of Object.entries(candidateMap)) {
      candidateCatsMap[wallpaperId] = {};
      for (const catId of catIds) {
        const groupName = catGroupMap[catId];
        if (groupName) candidateCatsMap[wallpaperId][groupName] = catId;
      }
    }

    // 7. Score, filter, sort, slice top 8
    const scored = Object.entries(candidateCatsMap)
      .map(([wallpaperId, cats]) => ({
        wallpaper_id: wallpaperId,
        score: scoreWallpaper(currentCats, cats),
      }))
      .filter(w => w.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // 8. Fetch full wallpaper details for top results
    const topIds = scored.map(s => s.wallpaper_id);
    const { data: wallpapers } = await supabase
      .from('wallpapers')
      .select('*')
      .in('id', topIds);

    // 9. Merge score back, preserve ranked order
    const scoreById = Object.fromEntries(scored.map(s => [s.wallpaper_id, s.score]));
    const recommendations = wallpapers
      .map(w => ({ ...w, score: scoreById[w.id] }))
      .sort((a, b) => b.score - a.score);

    res.json({ current_id: currentId, recommendations });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
```

---

### React.js — Hook & Component

```jsx
// hooks/useRecommendations.js
import { useState, useEffect } from 'react';

export function useRecommendations(wallpaperId) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallpaperId) return;
    setLoading(true);

    fetch(`/api/wallpapers/${wallpaperId}/recommendations`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wallpaperId]);

  return { recommendations, loading };
}
```

```jsx
// components/YouMayAlsoLike.jsx
import { useRecommendations } from '../hooks/useRecommendations';
import WallpaperCard from './WallpaperCard';

export default function YouMayAlsoLike({ currentWallpaperId }) {
  const { recommendations, loading } = useRecommendations(currentWallpaperId);

  if (loading) return <p>Loading suggestions...</p>;
  if (!recommendations.length) return null;

  return (
    <section>
      <h2>You May Also Like</h2>
      <div className="wallpaper-grid">
        {recommendations.map(w => (
          <WallpaperCard key={w.id} wallpaper={w} />
        ))}
      </div>
    </section>
  );
}
```

---

## Required Indexes

Indexes on `categories` are already defined in your schema. Add these on `wallpaper_categories`:

```sql
CREATE INDEX idx_wc_wallpaper ON wallpaper_categories(wallpaper_id);
CREATE INDEX idx_wc_category  ON wallpaper_categories(category_id);
```

---

## Phase 2 Upgrade — Behavioral Signals

Once you have meaningful traffic, layer in these signals on top of the base score:

| Signal | How to Use |
|--------|------------|
| **View co-occurrence** | Wallpapers frequently viewed in the same session |
| **Purchase co-occurrence** | Wallpapers bought together |
| **Recency boost** | Add +5 pts for wallpapers added in last 30 days |
| **Popularity boost** | Add +5 pts for top 10% most-viewed wallpapers |

---

## Decision Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| Category storage | Rows in `categories` + junction table | Matches your actual schema |
| Attribute priority | Style > Color > Room | Aesthetic → Visual → Functional |
| Score threshold | > 0 (at least one match) | Avoids completely unrelated results |
| Max results shown | 8 | Enough variety without overwhelming |
| Query strategy | `category_id` IN filter → score in JS | Clean, avoids complex SQL scoring |
| Phase 2 trigger | After meaningful traffic | Keep infra lean until data justifies ML |

---

*Document prepared by Argosmob Tech & AI Pvt. Ltd.*
