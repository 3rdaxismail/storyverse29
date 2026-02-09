/**
 * Export Story/Poem as PDF - Client-side PDF generation with full Unicode support
 * Uses html2canvas + jsPDF which leverages browser's native text rendering
 * This approach properly handles Hindi/Marathi (Devanagari) without font embedding issues
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Interfaces
interface Character {
  id: string;
  name: string;
  avatar?: string;
}

interface Location {
  id: string;
  name: string;
  description?: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Act {
  id: string;
  title: string;
  chapters: Chapter[];
}

interface StoryData {
  title: string;
  authorName: string;
  excerpt: string;
  characters: Character[];
  locations: Location[];
  acts: Act[];
  coverImageUrl?: string;
  wordCount?: number;
  readingTime?: number;
  chapterCount?: number;
  characterCount?: number;
  locationCount?: number;
}

interface PoemData {
  title: string;
  authorName: string;
  text: string;
  wordCount?: number;
  lineCount?: number;
  stanzaCount?: number;
  readTime?: number;
  genre?: string;
  coverImageUrl?: string;
}

/**
 * Create a hidden container for rendering content
 */
function createRenderContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'pdf-export-container';
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 595px;
    background: #ffffff;
    font-family: 'Noto Sans Devanagari', 'Segoe UI', Tahoma, sans-serif;
    color: #000000;
    padding: 40px;
    box-sizing: border-box;
    z-index: -9999;
  `;
  document.body.appendChild(container);
  return container;
}

/**
 * Render HTML to canvas and add to PDF
 */
async function addPageToPDF(
  pdf: jsPDF,
  container: HTMLDivElement,
  html: string,
  isFirstPage: boolean = false
): Promise<void> {
  container.innerHTML = html;
  
  // Wait for fonts to load
  await document.fonts.ready;
  
  const canvas = await html2canvas(container, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    // Clone callback to sanitize colors that html2canvas can't parse
    onclone: (clonedDoc) => {
      // Remove any problematic color styles
      const allElements = clonedDoc.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        
        // Reset any oklab/oklch colors to standard colors
        if (computedStyle.backgroundColor.includes('oklab') || 
            computedStyle.backgroundColor.includes('oklch')) {
          htmlEl.style.backgroundColor = '#ffffff';
        }
        if (computedStyle.color.includes('oklab') || 
            computedStyle.color.includes('oklch')) {
          htmlEl.style.color = '#000000';
        }
      });
    }
  });
  
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = 595; // A4 width in points
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  if (!isFirstPage) {
    pdf.addPage();
  }
  
  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
}

/**
 * Split long content into pages
 */
function splitIntoPages(text: string, charsPerPage: number = 2000): string[] {
  const paragraphs = text.split('\n\n');
  const pages: string[] = [];
  let currentPage = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    if ((currentPage + para).length > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = para + '\n\n';
    } else {
      currentPage += para + '\n\n';
    }
  }
  
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  
  return pages.length > 0 ? pages : [''];
}

/**
 * Export story as PDF
 */
export async function exportStoryAsPDF(data: StoryData): Promise<void> {
  console.log('[PDF Export] Starting story export...');
  
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    const container = createRenderContainer();
    
    // Build stats string
    const stats: string[] = [];
    if (data.wordCount) stats.push(`${data.wordCount.toLocaleString()} words`);
    if (data.readingTime) stats.push(`${data.readingTime} min read`);
    if (data.chapterCount) stats.push(`${data.chapterCount} chapters`);
    if (data.characterCount) stats.push(`${data.characterCount} characters`);
    if (data.locationCount) stats.push(`${data.locationCount} locations`);
    
    // TITLE PAGE
    const titlePageHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 780px; text-align: center;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 20px; line-height: 1.3;">${escapeHtml(data.title)}</h1>
        <p style="font-size: 18px; color: #666; margin-bottom: 30px;">by ${escapeHtml(data.authorName)}</p>
        ${stats.length > 0 ? `<p style="font-size: 12px; color: #888;">${stats.join(' • ')}</p>` : ''}
      </div>
    `;
    await addPageToPDF(pdf, container, titlePageHTML, true);
    
    // SYNOPSIS PAGE (if excerpt exists)
    if (data.excerpt && data.excerpt.trim()) {
      const synopsisHTML = `
        <div style="padding-top: 40px;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333;">Synopsis</h2>
          <div style="font-size: 14px; line-height: 1.8; color: #444;">
            ${formatParagraphs(data.excerpt)}
          </div>
        </div>
      `;
      await addPageToPDF(pdf, container, synopsisHTML);
    }
    
    // CHARACTERS PAGE (if any)
    if (data.characters && data.characters.length > 0) {
      const charactersHTML = `
        <div style="padding-top: 40px;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333;">Characters</h2>
          <div style="font-size: 14px; line-height: 1.6; color: #444;">
            ${data.characters.map(c => `<p style="margin-bottom: 8px;">• ${escapeHtml(c.name)}</p>`).join('')}
          </div>
        </div>
      `;
      await addPageToPDF(pdf, container, charactersHTML);
    }
    
    // LOCATIONS PAGE (if any)
    if (data.locations && data.locations.length > 0) {
      const locationsHTML = `
        <div style="padding-top: 40px;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333;">Locations</h2>
          <div style="font-size: 14px; line-height: 1.6; color: #444;">
            ${data.locations.map(l => `
              <div style="margin-bottom: 12px;">
                <p style="font-weight: 600;">• ${escapeHtml(l.name)}</p>
                ${l.description ? `<p style="margin-left: 16px; color: #666; font-size: 12px;">${escapeHtml(l.description)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      await addPageToPDF(pdf, container, locationsHTML);
    }
    
    // STORY CONTENT - Acts and Chapters
    for (let actIndex = 0; actIndex < data.acts.length; actIndex++) {
      const act = data.acts[actIndex];
      
      // Act title page
      const actTitleHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 780px; text-align: center;">
          <h2 style="font-size: 28px; font-weight: bold; color: #333;">${escapeHtml(act.title)}</h2>
        </div>
      `;
      await addPageToPDF(pdf, container, actTitleHTML);
      
      // Chapters
      for (let chapterIndex = 0; chapterIndex < act.chapters.length; chapterIndex++) {
        const chapter = act.chapters[chapterIndex];
        
        if (chapter.content && chapter.content.trim()) {
          // Split chapter into pages if needed
          const contentPages = splitIntoPages(chapter.content);
          
          for (let pageIndex = 0; pageIndex < contentPages.length; pageIndex++) {
            const isChapterStart = pageIndex === 0;
            const chapterHTML = `
              <div style="padding-top: ${isChapterStart ? '40px' : '20px'};">
                ${isChapterStart ? `<h3 style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #333;">${escapeHtml(chapter.title)}</h3>` : ''}
                <div style="font-size: 14px; line-height: 1.8; color: #444; text-align: justify;">
                  ${formatParagraphs(contentPages[pageIndex])}
                </div>
              </div>
            `;
            await addPageToPDF(pdf, container, chapterHTML);
          }
        }
      }
    }
    
    // Cleanup
    document.body.removeChild(container);
    
    // Save PDF
    const filename = `${sanitizeFilename(data.title)}.pdf`;
    pdf.save(filename);
    
    console.log('[PDF Export] ✅ Export complete:', filename);
  } catch (error) {
    console.error('[PDF Export] ❌ Export failed:', error);
    throw error;
  }
}

/**
 * Export poem as PDF
 */
export async function exportPoemAsPDF(data: PoemData): Promise<void> {
  console.log('[PDF Export] Starting poem export...');
  
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    const container = createRenderContainer();
    
    // Build stats
    const stats: string[] = [];
    if (data.wordCount) stats.push(`${data.wordCount} words`);
    if (data.lineCount) stats.push(`${data.lineCount} lines`);
    if (data.stanzaCount) stats.push(`${data.stanzaCount} stanzas`);
    if (data.readTime) stats.push(`${data.readTime} min read`);
    if (data.genre) stats.push(data.genre);
    
    // TITLE PAGE
    const titlePageHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 780px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 20px; line-height: 1.3;">${escapeHtml(data.title)}</h1>
        <p style="font-size: 16px; color: #666; margin-bottom: 30px;">by ${escapeHtml(data.authorName)}</p>
        ${stats.length > 0 ? `<p style="font-size: 11px; color: #888;">${stats.join(' • ')}</p>` : ''}
      </div>
    `;
    await addPageToPDF(pdf, container, titlePageHTML, true);
    
    // POEM CONTENT
    if (data.text && data.text.trim()) {
      const poemPages = splitIntoPages(data.text, 1500);
      
      for (let i = 0; i < poemPages.length; i++) {
        const poemHTML = `
          <div style="padding-top: 60px; text-align: center;">
            <div style="font-size: 14px; line-height: 2; color: #333;">
              ${formatPoemText(poemPages[i])}
            </div>
          </div>
        `;
        await addPageToPDF(pdf, container, poemHTML);
      }
    }
    
    // Cleanup
    document.body.removeChild(container);
    
    // Save PDF
    const filename = `${sanitizeFilename(data.title)}.pdf`;
    pdf.save(filename);
    
    console.log('[PDF Export] ✅ Export complete:', filename);
  } catch (error) {
    console.error('[PDF Export] ❌ Export failed:', error);
    throw error;
  }
}

// Helper functions

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatParagraphs(text: string): string {
  if (!text) return '';
  return text
    .split('\n\n')
    .map(p => `<p style="margin-bottom: 16px; text-indent: 24px;">${escapeHtml(p.trim())}</p>`)
    .join('');
}

function formatPoemText(text: string): string {
  if (!text) return '';
  // Preserve line breaks and stanza breaks
  const stanzas = text.split('\n\n');
  return stanzas
    .map(stanza => {
      const lines = stanza.split('\n');
      return lines.map(line => `<div>${escapeHtml(line) || '&nbsp;'}</div>`).join('');
    })
    .join('<div style="height: 24px;"></div>');
}

function sanitizeFilename(name: string): string {
  return (name || 'export')
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}
