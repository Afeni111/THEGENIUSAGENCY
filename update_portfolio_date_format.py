#!/usr/bin/env python3
"""
Update portfolio cards to show random month/day instead of year,
and ensure PDF/PPTX files are viewable inline
"""

import re
import random

# Generate random dates
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

def get_random_date():
    month = random.choice(months)
    day = random.randint(1, 28)
    return f"{month} {day}"

# Read the file
with open("portfolio.html", "r", encoding="utf-8") as f:
    content = f.read()

# Count portfolio cards
port_card_count = content.count('class="port-card"')
print(f"Found {port_card_count} portfolio cards")

# Replace all year badges with random month/day
# Pattern: <span class="port-card-year">...2025...</span>
year_pattern = r'<span class="port-card-year"><svg[^>]*>.*?</svg>\d{4}</span>'

def replace_year(match):
    svg_part = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>'
    return f'<span class="port-card-year">{svg_part}{get_random_date()}</span>'

content = re.sub(year_pattern, replace_year, content, flags=re.DOTALL)

# Update modal for PDF inline viewing
old_pdf_container = '''            <div id="modal-pdf-container" style="display: none; width: 100%; padding: 40px; text-align: center; background: linear-gradient(135deg, #0a0a0a, #1a1a1a); border-radius: 8px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p style="color: #888; margin-top: 20px; font-size: 0.9rem;">PDF Document</p>
                <a id="modal-pdf-link" href="" target="_blank" style="display: inline-flex; align-items: center; gap: 10px; background: #D4AF37; color: #000; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 0.9rem; text-decoration: none; margin-top: 20px;">
                    View PDF &rarr;
                </a>
            </div>'''

new_pdf_container = '''            <div id="modal-pdf-container" style="display: none; width: 100%; height: 500px; background: #f5f5f5; border-radius: 8px; overflow: hidden;">
                <iframe id="modal-pdf-iframe" src="" style="width: 100%; height: 100%; border: none;" type="application/pdf"></iframe>
            </div>'''

content = content.replace(old_pdf_container, new_pdf_container)

# Update openModal function for PDF
old_openmodal_pdf = '''            } else if (type === 'pdf') {
                pdfLink.href = src;
                pdfContainer.style.display = 'block';
            }'''

new_openmodal_pdf = '''            } else if (type === 'pdf') {
                const pdfIframe = document.getElementById('modal-pdf-iframe');
                // Use Google Docs viewer or direct embed for PDFs
                pdfIframe.src = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(window.location.origin + '/' + src)}`;
                pdfContainer.style.display = 'block';
            }'''

content = content.replace(old_openmodal_pdf, new_openmodal_pdf)

# Update closeModal to clear PDF iframe
old_closemodal = '''        function closeModal() {
            const video = document.getElementById('modal-video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            document.getElementById('port-modal').classList.remove('open');
            document.body.style.overflow = '';
        }'''

new_closemodal = '''        function closeModal() {
            const video = document.getElementById('modal-video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            const pdfIframe = document.getElementById('modal-pdf-iframe');
            if (pdfIframe) {
                pdfIframe.src = '';
            }
            document.getElementById('port-modal').classList.remove('open');
            document.body.style.overflow = '';
        }'''

content = content.replace(old_closemodal, new_closemodal)

# Ensure all PDF cards open with type='pdf'
# Find and update any PDF onclick handlers that might not have the right type
content = re.sub(
    r"onclick=\"openModal\('([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+\.pdf)'\s*,\s*'([^']+)'\s*,\s*'([^']*)'\)\"",
    r"onclick=\"openModal('\1','\2','\3','\4','\5','pdf')\"",
    content
)

# Write the updated file
with open("portfolio.html", "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Updated portfolio.html:")
print("   - Replaced years with random month/day dates")
print("   - PDFs now view inline via Google Docs viewer")
print("   - Watermarks preserved on all cards")
