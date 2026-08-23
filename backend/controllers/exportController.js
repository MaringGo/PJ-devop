const db = require('../config/db');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const path = require('path');

const FONT_REGULAR = path.join(__dirname, '..', 'fonts', 'Sarabun-Regular.ttf');
const FONT_BOLD = path.join(__dirname, '..', 'fonts', 'Sarabun-Bold.ttf');

const MONTH_NAMES = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

async function getReportData(startMonth, startYear, endMonth, endYear) {
  const [transactions] = await db.query(`
    SELECT t.date, t.amount, t.description, e.name as expense_type, b.name as budget_name
    FROM transactions t
    LEFT JOIN expense_types e ON t.expense_type_id = e.id
    LEFT JOIN budget_categories b ON t.budget_category_id = b.id
    WHERE (YEAR(t.date) > ? OR (YEAR(t.date) = ? AND MONTH(t.date) >= ?))
      AND (YEAR(t.date) < ? OR (YEAR(t.date) = ? AND MONTH(t.date) <= ?))
    ORDER BY t.date ASC
  `, [startYear, startYear, startMonth, endYear, endYear, endMonth]);

  const [summary] = await db.query(`
    SELECT e.name as expense_type, COALESCE(SUM(t.amount), 0) as total
    FROM transactions t
    JOIN expense_types e ON t.expense_type_id = e.id
    WHERE (YEAR(t.date) > ? OR (YEAR(t.date) = ? AND MONTH(t.date) >= ?))
      AND (YEAR(t.date) < ? OR (YEAR(t.date) = ? AND MONTH(t.date) <= ?))
    GROUP BY e.name
  `, [startYear, startYear, startMonth, endYear, endYear, endMonth]);

  const [budgetVsActual] = await db.query(`
    SELECT b.month, b.year, b.name as budget_name, b.amount as budget_amount,
           COALESCE(SUM(t.amount), 0) as actual_amount
    FROM budget_categories b
    LEFT JOIN transactions t ON t.budget_category_id = b.id
    WHERE (b.year > ? OR (b.year = ? AND b.month >= ?))
      AND (b.year < ? OR (b.year = ? AND b.month <= ?))
    GROUP BY b.id, b.month, b.year, b.name, b.amount
    ORDER BY b.year, b.month
  `, [startYear, startYear, startMonth, endYear, endYear, endMonth]);

  const grandTotal = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  return { transactions, summary, budgetVsActual, grandTotal };
}

// ─── Helper: draw horizontal line ─────────────────────────────────────────────
function hLine(doc, y, x1 = 40, x2 = 555, color = '#d1d5db') {
  doc.save().strokeColor(color).lineWidth(0.5).moveTo(x1, y).lineTo(x2, y).stroke().restore();
}

// ─── Export PDF ────────────────────────────────────────────────────────────────
exports.exportPDF = async (req, res) => {
  try {
    const { startMonth = 1, startYear = 2026, endMonth = 12, endYear = 2026 } = req.query;
    const data = await getReportData(startMonth, startYear, endMonth, endYear);

    const doc = new PDFDocument({ size: 'A4', margin: 40, autoFirstPage: true });
    doc.registerFont('Regular', FONT_REGULAR);
    doc.registerFont('Bold', FONT_BOLD);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${startMonth}-${startYear}_to_${endMonth}-${endYear}.pdf`);
    doc.pipe(res);

    // ── Page 1: Summary ──────────────────────────────────────────────────────
    const PAGE_W = 515; // usable width (595 - 2*40)
    const col1 = 40, col2 = 380;

    // Header block
    doc.rect(0, 0, 595, 70).fill('#6366f1');
    doc.fillColor('#ffffff').font('Bold').fontSize(20)
      .text('e-Utilities ระบบสรุปค่าใช้จ่าย', 40, 18, { align: 'center', width: PAGE_W });
    doc.font('Regular').fontSize(11)
      .text(`ช่วงเวลา: ${MONTH_NAMES[startMonth]} ${startYear} – ${MONTH_NAMES[endMonth]} ${endYear}`, 40, 44, { align: 'center', width: PAGE_W });

    doc.fillColor('#1f2937');
    let y = 90;

    // ── Section: สรุปตามประเภทค่าใช้จ่าย
    doc.font('Bold').fontSize(13).fillColor('#6366f1').text('สรุปตามประเภทค่าใช้จ่าย', col1, y);
    y += 22;

    // Table header row
    doc.rect(col1, y, PAGE_W, 18).fill('#e0e7ff');
    doc.fillColor('#374151').font('Bold').fontSize(10);
    doc.text('ประเภทค่าใช้จ่าย', col1 + 6, y + 4);
    doc.text('จำนวนเงิน (บาท)', col2, y + 4, { width: 130, align: 'right' });
    y += 18;

    doc.font('Regular').fontSize(10).fillColor('#374151');
    data.summary.forEach((item, idx) => {
      if (idx % 2 === 0) doc.rect(col1, y, PAGE_W, 17).fill('#f9fafb');
      doc.fillColor('#374151');
      doc.text(item.expense_type, col1 + 6, y + 3);
      doc.text(parseFloat(item.total).toLocaleString('th-TH', { minimumFractionDigits: 2 }), col2, y + 3, { width: 130, align: 'right' });
      y += 17;
    });

    hLine(doc, y, col1, col1 + PAGE_W, '#6366f1');
    y += 6;
    doc.font('Bold').fontSize(11).fillColor('#6366f1');
    doc.text('รวมทั้งหมด', col1 + 6, y);
    doc.text(data.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }), col2, y, { width: 130, align: 'right' });
    y += 28;

    // ── Section: งบประมาณ vs ค่าใช้จ่ายจริง
    doc.font('Bold').fontSize(13).fillColor('#6366f1').text('งบประมาณ vs ค่าใช้จ่ายจริง', col1, y);
    y += 22;

    const bCol = [40, 110, 230, 330, 430, 508];
    doc.rect(col1, y, PAGE_W, 18).fill('#e0e7ff');
    doc.fillColor('#374151').font('Bold').fontSize(9);
    doc.text('ช่วงเวลา', bCol[0] + 4, y + 4);
    doc.text('หมวดงบประมาณ', bCol[1] + 4, y + 4);
    doc.text('งบประมาณ', bCol[2], y + 4, { width: 95, align: 'right' });
    doc.text('จ่ายจริง', bCol[3], y + 4, { width: 95, align: 'right' });
    doc.text('คงเหลือ', bCol[4], y + 4, { width: 75, align: 'right' });
    y += 18;

    doc.font('Regular').fontSize(9).fillColor('#374151');
    data.budgetVsActual.forEach((row, idx) => {
      if (y > 750) { doc.addPage(); y = 40; }
      if (idx % 2 === 0) doc.rect(col1, y, PAGE_W, 16).fill('#f9fafb');
      const budget = parseFloat(row.budget_amount);
      const actual = parseFloat(row.actual_amount);
      const remaining = budget - actual;
      const fmt = v => v.toLocaleString('th-TH', { minimumFractionDigits: 2 });
      doc.fillColor('#374151');
      doc.text(`${MONTH_NAMES[row.month]} ${row.year}`, bCol[0] + 4, y + 2);
      doc.text(row.budget_name, bCol[1] + 4, y + 2, { width: 115, ellipsis: true });
      doc.text(fmt(budget), bCol[2], y + 2, { width: 95, align: 'right' });
      doc.text(fmt(actual), bCol[3], y + 2, { width: 95, align: 'right' });
      doc.fillColor(remaining >= 0 ? '#059669' : '#dc2626');
      doc.text(fmt(remaining), bCol[4], y + 2, { width: 75, align: 'right' });
      y += 16;
    });

    // ── Page 2: รายการทั้งหมด
    doc.addPage();
    doc.rect(0, 0, 595, 50).fill('#6366f1');
    doc.fillColor('#ffffff').font('Bold').fontSize(16)
      .text('รายการธุรกรรมทั้งหมด', 40, 15, { align: 'center', width: PAGE_W });

    y = 65;
    const tCol = [40, 110, 220, 340, 510];
    doc.rect(col1, y, PAGE_W, 18).fill('#e0e7ff');
    doc.fillColor('#374151').font('Bold').fontSize(9);
    doc.text('วันที่', tCol[0] + 4, y + 4);
    doc.text('ประเภท', tCol[1] + 4, y + 4);
    doc.text('รายละเอียด', tCol[2] + 4, y + 4);
    doc.text('จำนวนเงิน (บาท)', tCol[3], y + 4, { width: 165, align: 'right' });
    y += 18;

    doc.font('Regular').fontSize(9).fillColor('#374151');
    data.transactions.forEach((tx, idx) => {
      if (y > 770) { doc.addPage(); y = 40; }
      if (idx % 2 === 0) doc.rect(col1, y, PAGE_W, 15).fill('#f9fafb');
      const dateStr = new Date(tx.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.fillColor('#374151');
      doc.text(dateStr, tCol[0] + 4, y + 2);
      doc.text(tx.expense_type || '-', tCol[1] + 4, y + 2, { width: 105, ellipsis: true });
      doc.text((tx.description || '-').substring(0, 35), tCol[2] + 4, y + 2);
      doc.text(parseFloat(tx.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 }), tCol[3], y + 2, { width: 165, align: 'right' });
      y += 15;
    });

    hLine(doc, y, col1, col1 + PAGE_W, '#6366f1');
    y += 5;
    doc.font('Bold').fontSize(10).fillColor('#6366f1');
    doc.text('รวมทั้งหมด', tCol[2] + 4, y);
    doc.text(data.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }), tCol[3], y, { width: 165, align: 'right' });

    // Footer
    const pageCount = doc.bufferedPageRange ? doc.bufferedPageRange().count : '';
    doc.fontSize(8).font('Regular').fillColor('#9ca3af')
      .text(`สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}`, 40, 820, { align: 'center', width: PAGE_W });

    doc.end();
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

// ─── Export Excel ──────────────────────────────────────────────────────────────
exports.exportExcel = async (req, res) => {
  try {
    const { startMonth = 1, startYear = 2026, endMonth = 12, endYear = 2026 } = req.query;
    const data = await getReportData(startMonth, startYear, endMonth, endYear);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'e-Utilities Cost System';
    workbook.created = new Date();

    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    const altFill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
    const numFmt     = '#,##0.00';

    // ── Sheet 1: สรุปตามประเภท ─────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('สรุปค่าใช้จ่าย');
    summarySheet.columns = [
      { header: 'ประเภทค่าใช้จ่าย', key: 'type', width: 32 },
      { header: 'จำนวนเงิน (บาท)', key: 'total', width: 22 }
    ];
    summarySheet.getRow(1).font = headerFont;
    summarySheet.getRow(1).fill = headerFill;
    summarySheet.getRow(1).height = 22;

    data.summary.forEach((item, idx) => {
      const row = summarySheet.addRow({ type: item.expense_type, total: parseFloat(item.total) });
      if (idx % 2 === 1) { row.fill = altFill; }
    });

    const totalRow = summarySheet.addRow({ type: 'รวมทั้งหมด', total: data.grandTotal });
    totalRow.font = { bold: true, color: { argb: 'FF6366F1' }, size: 11 };
    totalRow.getCell(2).border = { top: { style: 'thin', color: { argb: 'FF6366F1' } } };

    summarySheet.getColumn('total').numFmt = numFmt;
    summarySheet.getColumn('total').alignment = { horizontal: 'right' };

    // ── Sheet 2: งบประมาณ vs จริง ──────────────────────────────────────────
    const budgetSheet = workbook.addWorksheet('งบประมาณ vs จริง');
    budgetSheet.columns = [
      { header: 'ช่วงเวลา', key: 'period', width: 18 },
      { header: 'หมวดงบประมาณ', key: 'name', width: 30 },
      { header: 'งบประมาณ (บาท)', key: 'budget', width: 22 },
      { header: 'จ่ายจริง (บาท)', key: 'actual', width: 22 },
      { header: 'คงเหลือ (บาท)', key: 'remaining', width: 22 },
      { header: 'ใช้ไป (%)', key: 'usage', width: 14 }
    ];
    budgetSheet.getRow(1).font = headerFont;
    budgetSheet.getRow(1).fill = headerFill;
    budgetSheet.getRow(1).height = 22;

    data.budgetVsActual.forEach((row, idx) => {
      const budget = parseFloat(row.budget_amount);
      const actual = parseFloat(row.actual_amount);
      const remaining = budget - actual;
      const usage = budget > 0 ? (actual / budget * 100) : 0;
      const excelRow = budgetSheet.addRow({
        period: `${MONTH_NAMES[row.month]} ${row.year}`,
        name: row.budget_name,
        budget,
        actual,
        remaining,
        usage: parseFloat(usage.toFixed(1))
      });
      if (idx % 2 === 1) excelRow.fill = altFill;
      if (remaining < 0) excelRow.getCell('remaining').font = { color: { argb: 'FFDC2626' } };
      else excelRow.getCell('remaining').font = { color: { argb: 'FF059669' } };
    });

    budgetSheet.getColumn('budget').numFmt = numFmt;
    budgetSheet.getColumn('actual').numFmt = numFmt;
    budgetSheet.getColumn('remaining').numFmt = numFmt;
    budgetSheet.getColumn('usage').numFmt = '0.0"%"';
    ['budget', 'actual', 'remaining', 'usage'].forEach(k => {
      budgetSheet.getColumn(k).alignment = { horizontal: 'right' };
    });

    // ── Sheet 3: รายการธุรกรรม ─────────────────────────────────────────────
    const txSheet = workbook.addWorksheet('รายการธุรกรรม');
    txSheet.columns = [
      { header: 'วันที่', key: 'date', width: 18 },
      { header: 'ประเภทค่าใช้จ่าย', key: 'type', width: 25 },
      { header: 'หมวดงบประมาณ', key: 'budget', width: 25 },
      { header: 'รายละเอียด', key: 'desc', width: 38 },
      { header: 'จำนวนเงิน (บาท)', key: 'amount', width: 22 }
    ];
    txSheet.getRow(1).font = headerFont;
    txSheet.getRow(1).fill = headerFill;
    txSheet.getRow(1).height = 22;

    data.transactions.forEach((tx, idx) => {
      const row = txSheet.addRow({
        date: new Date(tx.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
        type: tx.expense_type || '-',
        budget: tx.budget_name || '-',
        desc: tx.description || '-',
        amount: parseFloat(tx.amount)
      });
      if (idx % 2 === 1) row.fill = altFill;
    });

    const txTotalRow = txSheet.addRow({ date: '', type: '', budget: '', desc: 'รวมทั้งหมด', amount: data.grandTotal });
    txTotalRow.font = { bold: true, color: { argb: 'FF6366F1' }, size: 11 };
    txTotalRow.getCell('amount').border = { top: { style: 'thin', color: { argb: 'FF6366F1' } } };

    txSheet.getColumn('amount').numFmt = numFmt;
    txSheet.getColumn('amount').alignment = { horizontal: 'right' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${startMonth}-${startYear}_to_${endMonth}-${endYear}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel error:', error);
    res.status(500).json({ message: 'Error generating Excel', error: error.message });
  }
};
