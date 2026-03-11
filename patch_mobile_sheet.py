import re

with open('scheme_hmi_v3_industrial.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the content of sheet-content
new_sheet_content = """<div class="sheet-content">
            <div class="flex items-center justify-between border-b border-[#333] pb-2">
                <span class="font-bold text-cad-accent">Options</span>
                <button onclick="toggleBottomSheet()" class="text-cad-muted"><i class="fas fa-times"></i></button>
            </div>

            <!-- Core Specs -->
            <div class="flex flex-col gap-2 border-b border-[#333] pb-3">
                 <div class="flex gap-2">
                    <select id="m-projectSelect" onchange="document.getElementById('projectSelect').value=this.value; HmiApp.selectProject();" class="flex-1 p-2 text-xs">
                        <option value="24048">24048/49</option>
                        <option value="24050">24050</option>
                    </select>
                 </div>
                 <div class="flex gap-2">
                     <div class="flex-1"><label class="text-[10px] text-cad-muted mb-1 block">Width (mm)</label><select id="m-inW" onchange="document.getElementById('inW').value=this.value; HmiApp.calc();" class="w-full p-2 text-xs"></select></div>
                     <div class="flex-1"><label class="text-[10px] text-cad-muted mb-1 block">Length (mm)</label><select id="m-inL" onchange="document.getElementById('inL').value=this.value; HmiApp.calc();" class="w-full p-2 text-xs"></select></div>
                 </div>
            </div>

            <!-- Export Mode (24050 only) -->
            <div id="m-exportModeSection" class="flex flex-col gap-2 border-b border-[#333] pb-3" style="display:none;">
                 <label class="text-[10px] text-cad-accent font-bold tracking-widest uppercase">Placement Mode</label>
                 <div class="flex gap-2">
                     <button id="m-btnDomestic" onclick="HmiApp.toggleExport(0)" class="cad-btn active flex-1 py-2 text-xs font-bold text-cad-muted hover:text-white">Domestic</button>
                     <button id="m-btnExport" onclick="HmiApp.toggleExport(1)" class="cad-btn flex-1 py-2 text-xs font-bold text-cad-muted hover:text-white">Export</button>
                 </div>
            </div>

            <!-- View / Dimensions -->
            <div class="flex flex-col gap-2 border-b border-[#333] pb-3">
                <label class="text-[10px] text-cad-accent font-bold tracking-widest uppercase mb-1">Dimensions</label>
                <div class="flex flex-col gap-2">
                    <label class="flex items-center gap-2 cursor-pointer text-xs text-cad-muted">
                        <input type="checkbox" id="chkDimCenter-m" onchange="document.getElementById('chkDimCenter').checked=this.checked; HmiApp.toggleDim('center', this.checked)" class="accent-[#FF6B2C]"> Center Dims
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer text-xs text-cad-muted">
                        <input type="checkbox" id="chkDimGap-m" onchange="document.getElementById('chkDimGap').checked=this.checked; HmiApp.toggleDim('gap', this.checked)" class="accent-[#FF6B2C]"> Gap Dims
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer text-xs text-cad-muted">
                        <input type="checkbox" id="chkDimEdges-m" onchange="document.getElementById('chkDimEdges').checked=this.checked; HmiApp.toggleDim('edges', this.checked)" class="accent-[#FF6B2C]"> Edge Dims
                    </label>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 pb-2">
                 <button onclick="HmiApp.toggleAllLayouts(); toggleBottomSheet();" class="cad-btn w-full py-2 text-xs"><i class="fas fa-th-large mr-2"></i> Toggle Grid View</button>
                 <button onclick="HmiApp.shareImage(); toggleBottomSheet();" class="cad-btn w-full py-2 text-xs bg-[#FF6B2C] text-[#121212] border-[#FF6B2C] font-bold"><i class="fas fa-share-alt mr-2"></i> Share Image</button>
            </div>
        </div>"""

html = re.sub(r'<div class="sheet-content">.*?</div>\s*</div>\s*<!-- Context Menu -->', new_sheet_content + '\n    </div>\n\n    <!-- Context Menu -->', html, flags=re.DOTALL)

with open('scheme_hmi_v3_industrial.html', 'w', encoding='utf-8') as f:
    f.write(html)
