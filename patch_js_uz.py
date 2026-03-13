import re

with open('production_metrics.js', 'r') as f:
    content = f.read()

# Fix unescaped quotes in UZ translation
uz_str = """uz: { controls: 'Boshqaruv paneli', project: 'Loyiha', width: 'Kenglik (mm)', length: 'Uzunlik (mm)', calc: 'Hisoblash', layout: 'Joylashtirish sxemasi', info: 'Ma\\'lumot', radiator: 'Radiator', widthL: 'Kenglik:', lengthL: 'Uzunlik:', placement: 'Joylashtirish', angle: 'Burchak:', pcs: 'Dona/qat:', layers: 'Qatlamlar:', total: 'Jami:', pallet: 'Palet', palSize: 'O\\'lcham:', overflow: 'Chiqish:', legend: 'LEGEND', legRad: 'Radiator', legPal: 'Palet', copyKrl: 'KRL Nusxalash', krlCopied: 'KRL Nusxalandi!', toggleAllShow: 'Barchasini ko\\'rsatish', toggleAllHide: 'Yagona Ko\\'rinishga Qaytish', print: 'Chop etish', p1: '1 Palet', p2: '2 Palet', dom: 'Mahalliy', exp: 'Eksport', reset: 'Holatni tiklash', matrix: 'Matritsa',
                properties: 'Xususiyatlar', viewDims: 'Ko\\'rinish / O\\'lchamlar', centerDims: 'Markaziy O\\'lchamlar', gapDims: 'Oraliq O\\'lchamlar', edgeDims: 'Chekka O\\'lchamlar', manualConfig: 'Qo\\'lda Sozlash', addRadiator: 'Radiator Qo\\'shish:', addBtn: 'Qo\\'shish', autoAlign: 'Avto Tekislash', overrideSize: 'O\\'lchamni O\\'zgartirish:', options: 'Variantlar', dimensions: 'O\\'lchamlar', placementMode: 'Joylashtirish Rejimi', toggleGrid: 'To\\'r Ko\\'rinishini O\\'zgartirish', shareImage: 'Tasvirni Ulashish', ctxRotate: '90° Burish', ctxDelete: 'O\\'chirish',
                ttAutoMode: 'Avtomatik Rejim', ttManualMode: 'Qo\\'lda Rejim', ttResetView: 'Ko\\'rinishni Tiklash', ttShowAll: 'Barcha sxemalarni ko\\'rsatish', ttDownload: 'Tasvirni Yuklab Olish'
            }"""

content = re.sub(r"uz:\s*\{.*?\}", uz_str, content, flags=re.DOTALL)

with open('production_metrics.js', 'w') as f:
    f.write(content)
