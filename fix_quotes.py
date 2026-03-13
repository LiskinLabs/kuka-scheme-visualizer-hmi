with open('production_metrics.js', 'r') as f:
    lines = f.readlines()

with open('production_metrics.js', 'w') as f:
    for line in lines:
        if "ttDownload:" in line and "Tasvirni Yuklab" in line:
            f.write("                ttAutoMode: 'Avtomatik Rejim', ttManualMode: 'Qo\\'lda Rejim', ttResetView: 'Ko\\'rinishni Tiklash', ttShowAll: 'Barcha sxemalarni ko\\'rsatish', ttDownload: 'Tasvirni Yuklab Olish'\n")
        else:
            f.write(line)
