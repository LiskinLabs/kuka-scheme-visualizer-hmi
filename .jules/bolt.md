## 2024-03-10 - [Hardware Acceleration & Event Debouncing]
**Learning:** In canvas-like interactive web tools, relying heavily on `translate` with immediate DOM updates (`onchange` for inputs without debouncing or standard css `translate(x, y)`) can lead to perceptible lag when rendering many elements.
**Action:**
1. Replaced `translate(x, y)` with `translate3d(x, y, 0)` within `applyTransform` to offload rendering to the GPU.
2. Implemented an `oninput` debouncing mechanism (200ms delay) to batch input recalculations during rapid typing or parameter changes instead of forcing a `calc()` loop on every micro-change.
