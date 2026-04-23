import { utils } from './utils.js';
import { config } from './config.js';
import { state } from './state.js';
import { stateMethods } from './stateMethods.js';
import { layout } from './layout.js';
import { render } from './render.js';
import { events } from './events.js';
import { ui } from './ui.js';

var HmiApp = Object.assign(
    {},
    utils,
    { config },
    { state },
    stateMethods,
    layout,
    render,
    events,
    ui
);

window.HmiApp = HmiApp;

if (typeof window !== 'undefined') {
    // Only bind onload if we are in a browser context and not already initialized
    // to avoid auto-starting during tests.
    // Actually, window.onload is bound in the original file at the end.
    window.addEventListener('load', () => {
        if (!window.HMI_TEST_MODE) HmiApp.init();
    });
}

export default HmiApp;
