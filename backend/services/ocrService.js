import Tesseract from 'tesseract.js';

export const parseInvoiceImage = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');

    const amountMatch = text.match(/(?:total|amount|sum)[^\d]*([\d,]+(?:\.\d{2})?)/i);
    const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    const invoiceNumberMatch = text.match(/(?:invoice|inv)[^\w]*([\w\-]+)/i);

    return {
      rawText: text,
      extractedData: {
        amount: amountMatch ? amountMatch[1].replace(',', '') : null,
        date: dateMatch ? dateMatch[0] : null,
        invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1] : null,
      },
    };
  } catch (error) {
    throw new Error(`OCR parsing failed: ${error.message}`);
  }
};