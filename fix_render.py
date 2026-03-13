with open('production_metrics.js', 'r') as f:
    text = f.read()

text = text.replace("Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });\n        this.render();\n    }\n};\n\nwindow.onload = () => HmiApp.init();\n        this.render();\n    }\n};", "Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });\n        this.render();\n    }\n};\n\nwindow.onload = () => HmiApp.init();")

text = text.replace("Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });\n        this.render();\n    }\n};", "Object.keys(tooltips).forEach(id => { const el = document.getElementById(id); if (el) el.title = t[tooltips[id]]; });\n        this.render();\n    }\n};")

with open('production_metrics.js', 'w') as f:
    f.write(text)
