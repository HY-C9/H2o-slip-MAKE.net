// =========================================================
// ไฟล์ js/slipmake.js (รวมโหมด + Auto Format + Fix Vowel/Tone)
// =========================================================

// 1. ฟังก์ชันโหลดฟอนต์
function loadFonts() {
    const fonts = [
        new FontFace('SukhumvitSetThin', 'url(assets/fonts/SukhumvitSet-Thin.woff)'),
        new FontFace('SukhumvitSetText', 'url(assets/fonts/SukhumvitSet-Text.woff)'),
        new FontFace('SukhumvitSetLight', 'url(assets/fonts/SukhumvitSet-Light.woff)'),
        new FontFace('SukhumvitSetMedium', 'url(assets/fonts/SukhumvitSet-Medium.woff)'),
        new FontFace('SukhumvitSetSemiBold', 'url(assets/fonts/SukhumvitSet-SemiBold.woff)'),
        new FontFace('SukhumvitSetBold', 'url(assets/fonts/SukhumvitSet-Bold.woff)'),
        new FontFace('SukhumvitSetExtraBold', 'url(assets/fonts/SukhumvitSet-Extra%20Bold.woff)'),
        new FontFace('IBMPlexsansthaiThin', 'url(assets/fonts/IBMPlexSansThai-Thin.woff)'),
        new FontFace('IBMPlexsansthaiExtraLight', 'url(assets/fonts/IBMPlexSansThai-ExtraLight.woff)'),
        new FontFace('IBMPlexsansthaiLight', 'url(assets/fonts/IBMPlexSansThai-Light.woff)'),
        new FontFace('IBMPlexsansthaiRegular', 'url(assets/fonts/IBMPlexSansThai-Regular.woff)'),
        new FontFace('IBMPlexsansthaiMedium', 'url(assets/fonts/IBMPlexSansThai-Medium.woff)'),
        new FontFace('IBMPlexsansthaiSemiBold', 'url(assets/fonts/IBMPlexSansThai-SemiBold.woff)'),
        new FontFace('IBMPlexsansthaiBold', 'url(assets/fonts/IBMPlexSansThai-Bold.woff)')
    ];

    return Promise.all(fonts.map(font => font.load().catch(e => console.warn('Font load error:', e)))).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if(font) document.fonts.add(font);
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.replace(' ', 'T');
    const dtElem = document.getElementById('datetime');
    if(dtElem && !dtElem.value) dtElem.value = formattedDateTime;
}

// ปรับวันที่ให้ 1-9 มีเลข 0 นำหน้าเสมอ
function formatDate(date) {
    if (!date || date === '-') return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[d.getMonth()];
    const year = (d.getFullYear() + 543).toString().slice(-2);
    return `${day} ${month} 25${year}`;
}

function generateUniqueID() {
    const datetimeInput = document.getElementById('datetime');
    const now = new Date(datetimeInput ? datetimeInput.value : new Date());
    const startDate = new Date("2024-07-24");
    const dayDifference = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const uniqueDay = (14206 + dayDifference).toString().padStart(6, '0');
    const timePart = `${padZero(now.getHours())}${padZero(now.getMinutes())}`;
    const randomPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const randomPart1 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${uniqueDay}${timePart}${randomPart}BOR${randomPart1}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

// =========================================================
// 2. จัดรูปแบบเลขบัญชีอัตโนมัติ
// =========================================================
window.autoFormatAccount = function() {
    const bank = document.getElementById('bank')?.value;
    const accInput = document.getElementById('receiveraccount');
    if (!bank || !accInput) return;

    let rawVal = accInput.value.replace(/[^0-9]/g, '');
    if (rawVal.length === 0) return;

    if (bank.includes('วอลเล็ท') || bank.includes('เติมเงินพร้อมเพย์') || rawVal.length >= 15) {
        rawVal = rawVal.padStart(15, '0');
        accInput.value = `000-xxxxxxxx-${rawVal.slice(-4)}`;
    } else if (bank === 'ธ.ออมสิน' || bank === 'ธ.ก.ส.' || rawVal.length === 12) {
        rawVal = rawVal.padStart(12, '0');
        accInput.value = `xxx-x-x${rawVal.substring(5, 9)}-${rawVal.slice(-3)}`;
    } else if (bank === 'พร้อมเพย์' || bank === 'รหัสพร้อมเพย์') {
        rawVal = rawVal.padStart(10, '0');
        accInput.value = `xxx-xxx-${rawVal.slice(-4)}`;
    } else {
        rawVal = rawVal.padStart(10, '0');
        accInput.value = `xxx-x-x${rawVal.substring(5, 9)}-${rawVal.slice(-1)}`;
    }

    if (typeof updateDisplay === 'function') updateDisplay();
};

// =========================================================
// 3. ฟังก์ชันวาดสลิปหลัก (Async)
// =========================================================
window.updateDisplay = async function() {
    const sendername = document.getElementById('sendername')?.value || '-';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const receivername = document.getElementById('receivername')?.value || '-';
    const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
    const bank = document.getElementById('bank')?.value || '-';
    const amount11 = document.getElementById('amount11')?.value || '0.00';
    const datetime = document.getElementById('datetime')?.value || '-';
    
    const noteToggleElem = document.getElementById('modeSwitch');
    const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;
    const AideMemoire = document.getElementById('AideMemoire') ? document.getElementById('AideMemoire').value : '-';
    
    const selectedImage = document.getElementById('imageSelect')?.value || '';
    const QRCode = document.getElementById('QRCode')?.value || '';

    let bankLogoUrl = '';
    switch (bank) {
        case 'ธ.กสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
        case 'ธ.กรุงไทย': bankLogoUrl = 'assets/image/logo/KTB4.png'; break;
        case 'ธ.กรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL.png'; break;
        case 'ธ.ไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
        case 'ธ.กรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
        case 'ธ.ทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
        case 'ธ.ออมสิน': bankLogoUrl = 'assets/image/logo/O.png'; break;
        case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/T.png'; break;
        case 'ธ.อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
        case 'ธ.เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
        case 'ธ.ซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
        case 'ธ.ยูโอบี': bankLogoUrl = 'assets/image/logo/UOB.png'; break;
        case 'ธ.แลนด์ แอนด์ เฮ้าส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
        case 'ธ.ไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
        case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-Make.png'; break;
        case 'พร้อมเพย์วอลเล็ท': bankLogoUrl = 'assets/image/logo/P-Make.png'; break;
        default: bankLogoUrl = 'assets/image/logo/P-Make.png'; break;
    }

    const formattedDate = formatDate(datetime);
    let formattedTime = '';
    if (datetime && datetime !== '-') {
        const d = new Date(datetime);
        if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // ตั้งค่าพื้นหลังและแปลง T อัตโนมัติเมื่ออยู่โหมดบันทึกช่วยจำ
    let backgroundImageSrc = document.getElementById('backgroundSelect')?.value || 'assets/image/bs/MAKE1.jpg';
    if (isNoteMode) {
        backgroundImageSrc = backgroundImageSrc.replace('.jpg', 'T.jpg');
    }

    const loadImage = (src) => new Promise(res => {
        if (!src) return res(null);
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });

    const [bgImg, bankLogoImg, kbankLogoImg, customStickerImg] = await Promise.all([
        loadImage(backgroundImageSrc),
        loadImage(bankLogoUrl),
        loadImage('assets/image/logo/KBANK.png'), // โลโก้กสิกรของผู้ส่ง
        loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
    ]);

    // ปรับขนาด Canvas ให้พอดีกับภาพพื้นหลัง
    if (bgImg) {
        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        canvas.width = 1074;
        canvas.height = isNoteMode ? 1239 : 1095;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ==========================================
    // วาดข้อความและโลโก้ตามพิกัดต้นฉบับล่าสุด
    // ==========================================
    if (bankLogoImg) ctx.drawImage(bankLogoImg, 37, 493, 118, 118);
    if (kbankLogoImg) ctx.drawImage(kbankLogoImg, 37, 289, 118, 118);

    drawText(ctx, `${formattedDate}  ${formattedTime}`, 50, 161.1, 36, 'IBMPlexsansthaiRegular', '#75859f', 'left', 1.5, 3, 0, 0, 500, 0);

    drawText(ctx, `${sendername}`, 170, 341.6, 41, 'IBMPlexsansthaiSemiBold', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
    drawText(ctx, `${senderaccount}`, 170, 389.9, 36, 'IBMPlexsansthaiRegular', '#75859f', 'left', 1.5, 1, 0, 0, 500, 0);
    
    drawText(ctx, `${receivername}`, 170, 546, 41, 'IBMPlexsansthaiSemiBold', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
    drawText(ctx, `${receiveraccount}`, 170, 594.1, 36, 'IBMPlexsansthaiRegular', '#75859f', 'left', 1.5, 1, 0, 0, 500, 0);
    
    drawText(ctx, `${amount11}`, 46, 810, 60, 'IBMPlexsansthaiSemiBold', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
    drawText(ctx, `บาท`, 46 + ctx.measureText(`${amount11}`).width + 15, 811, 38, 'IBMPlexsansthaiMedium', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
    drawText(ctx, `0.00 บาท`, 46, 957.3, 38.44, 'IBMPlexsansthaiMedium', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);

    drawText(ctx, `${generateUniqueID()}`, 259, 1035.5, 35.63, 'IBMPlexsansthaiRegular', '#789099', 'left', 1.5, 3, 0, 0, 500, 0);
    drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'IBMPlexsansthaiRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);

    if (isNoteMode) {
        drawText(ctx, `${AideMemoire}`, 74, 1155, 37, 'IBMPlexsansthaiMedium', '#353e4f', 'left', 1.5, 3, 0, 0, 500, 0);
    }

    if (customStickerImg) {
        ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height); 
    }
};

// =========================================================
// 4. ฟังก์ชันวาดอักษร (แก้ปัญหาการซ้อนทับด้วย Logic เดิมของพี่)
// =========================================================
function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < paragraph.length; i++) {
            const char = paragraph[i];
            const isThai = /[\u0E00-\u0E7F]/.test(char);
            const isWhitespace = /\s/.test(char);

            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth) {
                lines.push(currentLine.trim());
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        lines.forEach((line, index) => {
            let currentX = x;
            
            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }
        
            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const characters = text.split('');
    let currentPosition = x;

    characters.forEach((char, index) => {
        const charCode = char.charCodeAt(0);
        const prevChar = index > 0 ? characters[index - 1] : null;
        
        const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
        const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
        const isBeforeVowel = (charCode === 0x0E31);
        const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

        let yOffset = 0;
        let xOffset = 0;

        if (isUpperVowel) {
            yOffset = -1;
            xOffset = 0;
        }

        if (isToneMark) {
            if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                yOffset = -8;
                xOffset = 0;
            } else {
                yOffset = 0;
                xOffset = -7;
            }
        }

        if (isBeforeVowel) {
            yOffset = -1;
            xOffset = 1;
        }

        if (isBelowVowel) {
            yOffset = 0;
            xOffset = -10;
        }

        ctx.fillText(char, currentPosition + xOffset, y + yOffset);

        if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
            currentPosition += ctx.measureText(char).width + letterSpacing;
        } else {
            currentPosition += ctx.measureText(char).width;
        }
    });
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'make_slip.png';
    link.click();
};

const generateBtn = document.getElementById('generate');
if(generateBtn) generateBtn.addEventListener('click', updateDisplay);