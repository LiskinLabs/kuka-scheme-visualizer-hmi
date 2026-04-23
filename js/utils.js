export const utils = {
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    isNum(v) { return typeof v === 'number' && Number.isFinite(v); },

    isBool(v) { return typeof v === 'boolean'; },

    escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    },

    validatePositions(arr) {
        if (!Array.isArray(arr)) return null;
        return arr.filter(pos => {
            return pos && this.isNum(pos.n) && this.isNum(pos.x) && this.isNum(pos.y) && this.isNum(pos.angle);
        }).map(pos => ({
            n: pos.n, x: pos.x, y: pos.y, angle: pos.angle,
            w: this.isNum(pos.w) ? pos.w : undefined,
            l: this.isNum(pos.l) ? pos.l : undefined
        }));
    }
};
