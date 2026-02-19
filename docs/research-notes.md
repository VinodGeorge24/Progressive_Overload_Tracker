# Research Notes

This document tracks the research component of the project, focusing on **workout tracking and per-exercise visualization** for the current scope. Plateau detection and recommendations are deferred to a future phase.

## Current scope: Tracking and visualization

### Metrics to track (per set)
- **weight**: Weight lifted for that set (lbs). See [DATA_MODEL.md](../DATA_MODEL.md) for project-wide terminology.
- **reps**: Repetitions performed in that set.
- **Volume**: Sum of (reps × weight) for all sets in a session or per exercise.

### Visualization
- **Per-exercise line charts**: x-axis = date; y-axis = weight (lbs) or reps, with optional filter by set_number (e.g. "Set 1 weight over time", "Set 2 weight over time").
- Charts are generated in the backend with Python (e.g. matplotlib, Plotly); frontend displays the chart images.
- Option A: One chart per metric (weight, then reps), filter by set_number.

## Volume calculations

### Total volume
Sum of (reps × weight) for all sets in a session or exercise.

### Volume progression
Track volume trends over time by date and (optionally) set_number for progress views.

## One-Rep Max (1RM) estimation — optional / future

Not required for MVP. For future reference, common formulas include:

**Epley:** `1RM = weight × (1 + reps/30)`  
**Brzycki:** `1RM = weight / (1.0278 - 0.0278 × reps)`  
**Lombardi:** `1RM = weight × reps^0.10`

## Future: Plateau detection and recommendations

*(Not in current scope. Keep for later.)*

- Plateau: progress stagnates over a defined period (e.g. 2–3 weeks) without improvement in weight, volume, or estimated 1RM.
- Recommendations: suggest weight/rep/set/frequency increases when plateau is detected.
- Evaluation: accuracy, timeliness, actionability, user satisfaction.

## References

- [ ] Research papers on progressive overload
- [ ] 1RM estimation formula comparisons (if 1RM is added later)
- [ ] Training periodization principles (future)

## Notes

(Add observations, ideas, and findings as the project develops)

