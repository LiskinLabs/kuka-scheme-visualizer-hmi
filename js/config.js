export const config = {

        projects: {
            '24048': { type: 'fixed', pallets: { single: { x: 1200, y: 800 }, double: { x: 2400, y: 800 } } },
            '24049': { type: 'fixed', pallets: { single: { x: 1200, y: 800 }, double: { x: 2400, y: 800 } } },
            '24050': { type: 'dynamic', pallets: null }
        },
        defW: [0, 0, 200, 200, 200, 0, 300, 300, 300, 400, 400, 900, 600],
        defL: [0, 0, 500, 700, 900, 0, 500, 700, 900, 600, 900, 500, 400],
        translations: {
            ru: { controls: 'Панель управления', project: 'Проект', width: 'Ширина (мм)', length: 'Длина (мм)', calc: 'Рассчитать', layout: 'Схема укладки', info: 'Информация', radiator: 'Радиатор', widthL: 'Ширина:', lengthL: 'Длина:', placement: 'Размещение', angle: 'Угол:', pcs: 'Шт/слой:', layers: 'Слоев:', total: 'Всего:', pallet: 'Паллета', palSize: 'Размер:', overflow: 'Выход:', legend: 'ЛЕГЕНДА', legRad: 'Радиатор', legPal: 'Паллета', copyKrl: 'Копировать KRL', krlCopied: 'KRL скопирован!', toggleAllShow: 'Показать все', toggleAllHide: 'Режим 1 схемы', print: 'Печать', p1: '1 Паллета', p2: '2 Паллеты', dom: 'Внутренний', exp: 'На экспорт', reset: 'Сброс позиций', matrix: 'Матрица укладки',
                properties: 'Свойства', viewDims: 'Вид / Размеры', centerDims: 'Размеры от центра', gapDims: 'Размеры зазоров', edgeDims: 'Размеры от краев', manualConfig: 'Ручная настройка', addRadiator: 'Добавить Радиатор:', addBtn: 'Добавить', autoAlign: 'Авто выравнивание', overrideSize: 'Изменить размер:', options: 'Опции', dimensions: 'Размеры', placementMode: 'Режим Размещения', toggleGrid: 'Переключить сетку', shareImage: 'Поделиться изображением', ctxRotate: 'Повернуть 90°', ctxDelete: 'Удалить',
                ttAutoMode: 'Автоматический режим', ttManualMode: 'Ручной режим', ttResetView: 'Сбросить вид / По размеру', ttShowAll: 'Показать все схемы', ttDownload: 'Скачать изображение'
            },
            tr: { controls: 'Kontrol Paneli', project: 'Proje', width: 'Genişlik (mm)', length: 'Uzunluk (mm)', calc: 'Hesapla', layout: 'Dizilim Şeması', info: 'Bilgiler', radiator: 'Radyatör', widthL: 'Genişlik:', lengthL: 'Uzunluk:', placement: 'Yerleşim', angle: 'Açı:', pcs: 'Adet/kat:', layers: 'Kat Sayısı:', total: 'Toplam:', pallet: 'Palet', palSize: 'Boyut:', overflow: 'Taşma:', legend: 'LEJANT', legRad: 'Radyatör', legPal: 'Palet', copyKrl: 'KRL Kopyala', krlCopied: 'KRL Kopyalandı!', toggleAllShow: 'Tümünü Göster', toggleAllHide: 'Tekli Görünüme Dön', print: 'Yazdır (Print)', p1: '1 Palet', p2: '2 Palet', dom: 'Domestic', exp: 'Export', reset: 'Reset Positions', matrix: 'Dizilim Matrisi',
                properties: 'Özellikler', viewDims: 'Görünüm / Boyutlar', centerDims: 'Merkez Boyutları', gapDims: 'Boşluk Boyutları', edgeDims: 'Kenar Boyutları', manualConfig: 'Manuel Yapılandırma', addRadiator: 'Radyatör Ekle:', addBtn: 'Ekle', autoAlign: 'Otomatik Hizala', overrideSize: 'Boyutu Geçersiz Kıl:', options: 'Seçenekler', dimensions: 'Boyutlar', placementMode: 'Yerleşim Modu', toggleGrid: 'Izgara Görünümünü Değiştir', shareImage: 'Görüntüyü Paylaş', ctxRotate: '90° Döndür', ctxDelete: 'Sil',
                ttAutoMode: 'Otomatik Mod', ttManualMode: 'Manuel Mod', ttResetView: 'Görünümü Sıfırla / Sığdır', ttShowAll: 'Tüm Dizilimleri Göster', ttDownload: 'Görüntüyü İndir'
            },
            uz: { controls: 'Boshqaruv paneli', project: 'Loyiha', width: 'Kenglik (mm)', length: 'Uzunlik (mm)', calc: 'Hisoblash', layout: 'Joylashtirish sxemasi', info: 'Ma\'lumot', radiator: 'Radiator', widthL: 'Kenglik:', lengthL: 'Uzunlik:', placement: 'Joylashtirish', angle: 'Burchak:', pcs: 'Dona/qat:', layers: 'Qatlamlar:', total: 'Jami:', pallet: 'Palet', palSize: 'O\'lcham:', overflow: 'Chiqish:', legend: 'LEGEND', legRad: 'Radiator', legPal: 'Palet', copyKrl: 'KRL Nusxalash', krlCopied: 'KRL Nusxalandi!', toggleAllShow: 'Barchasini ko\'rsatish', toggleAllHide: 'Yagona Ko\'rinishga Qaytish', print: 'Chop etish', p1: '1 Palet', p2: '2 Palet', dom: 'Mahalliy', exp: 'Eksport', reset: 'Holatni tiklash', matrix: 'Matritsa',
                properties: 'Xususiyatlar', viewDims: 'Ko\'rinish / O\'lchamlar', centerDims: 'Markaziy O\'lchamlar', gapDims: 'Oraliq O\'lchamlar', edgeDims: 'Chekka O\'lchamlar', manualConfig: 'Qo\'lda Sozlash', addRadiator: 'Radiator Qo\'shish:', addBtn: 'Qo\'shish', autoAlign: 'Avto Tekislash', overrideSize: 'O\'lchamni O\'zgartirish:', options: 'Variantlar', dimensions: 'O\'lchamlar', placementMode: 'Joylashtirish Rejimi', toggleGrid: 'To\'r Ko\'rinishini O\'zgartirish', shareImage: 'Tasvirni Ulashish', ctxRotate: '90° Burish', ctxDelete: 'O\'chirish',
                ttAutoMode: 'Avtomatik Rejim', ttManualMode: 'Qo\'lda Rejim', ttResetView: 'Ko\'rinishni Tiklash', ttShowAll: 'Barcha sxemalarni ko\'rsatish', ttDownload: 'Tasvirni Yuklab Olish'
            }
        }

};
