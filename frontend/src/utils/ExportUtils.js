import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

/**
 * Export HTML content to PDF
 * @param {string} htmlContent - The HTML string to export
 * @param {string} filename - The name of the file (without extension)
 */
export const exportToPDF = async (htmlContent, filename = 'document') => {
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.padding = '40px';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.6';
    container.style.color = '#1e293b';

    const options = {
        margin: [15, 15, 15, 15],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    await html2pdf().set(options).from(container).save();
};

/**
 * Export HTML content to DOCX
 * @param {string} htmlContent - The HTML string to export
 * @param {string} filename - The name of the file (without extension)
 */
export const exportToDOCX = async (htmlContent, filename = 'document') => {
    const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: Calibri, Arial, sans-serif;
                    font-size: 11pt;
                    line-height: 1.5;
                    color: #000;
                }
                h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; }
                h2 { font-size: 14pt; font-weight: bold; margin-bottom: 10pt; }
                h3 { font-size: 12pt; font-weight: bold; margin-bottom: 8pt; }
                p { margin-bottom: 8pt; }
                ul, ol { margin-left: 20pt; margin-bottom: 8pt; }
                blockquote { 
                    border-left: 3pt solid #8b5cf6; 
                    padding-left: 10pt; 
                    font-style: italic; 
                    color: #666;
                    margin: 10pt 0;
                }
                code { 
                    font-family: Consolas, monospace; 
                    background: #f1f5f9; 
                    padding: 2pt 4pt;
                }
                pre { 
                    background: #1e293b; 
                    color: #e2e8f0; 
                    padding: 10pt;
                    font-family: Consolas, monospace;
                }
            </style>
        </head>
        <body>${htmlContent}</body>
        </html>
    `;

    const blob = await asBlob(styledHtml, { orientation: 'portrait', margins: { top: 720 } });
    saveAs(blob, `${filename}.docx`);
};
