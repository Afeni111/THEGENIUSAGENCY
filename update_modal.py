#!/usr/bin/env python3
"""
Update modal to support video files
"""

import re

# Read the file
with open("portfolio.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update modal HTML to add video container
old_modal = '''    <!-- Modal -->
    <div class="port-modal-overlay" id="port-modal">
        <div class="port-modal-box">
            <button class="port-modal-close" onclick="closeModal()">&times;</button>
            <img class="port-modal-img" id="modal-img" src="" alt="">
            <div class="port-modal-body">
                <p class="port-modal-cat" id="modal-cat"></p>
                <h2 class="port-modal-title" id="modal-title"></h2>
                <p class="port-modal-desc" id="modal-desc"></p>
                <div style="margin-top: 24px;">
                    <a href="contact.html" style="display: inline-flex; align-items: center; gap: 10px; background: #D4AF37; color: #000; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 0.9rem; text-decoration: none;">
                        Start a Similar Project &rarr;
                    </a>
                </div>
            </div>
        </div>
    </div>'''

new_modal = '''    <!-- Modal -->
    <div class="port-modal-overlay" id="port-modal">
        <div class="port-modal-box">
            <button class="port-modal-close" onclick="closeModal()">&times;</button>
            <img class="port-modal-img" id="modal-img" src="" alt="" style="display: none;">
            <div id="modal-video-container" style="display: none; width: 100%; max-height: 400px; background: #000; border-radius: 8px; overflow: hidden;">
                <video id="modal-video" controls style="width: 100%; height: auto; max-height: 400px;">
                    <source src="" type="video/mp4">
                    <source src="" type="video/webm">
                    <source src="" type="video/x-matroska">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div id="modal-pdf-container" style="display: none; width: 100%; padding: 40px; text-align: center; background: linear-gradient(135deg, #0a0a0a, #1a1a1a); border-radius: 8px;">
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
            </div>
            <div class="port-modal-body">
                <p class="port-modal-cat" id="modal-cat"></p>
                <h2 class="port-modal-title" id="modal-title"></h2>
                <p class="port-modal-desc" id="modal-desc"></p>
                <div style="margin-top: 24px;">
                    <a href="contact.html" style="display: inline-flex; align-items: center; gap: 10px; background: #D4AF37; color: #000; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 0.9rem; text-decoration: none;">
                        Start a Similar Project &rarr;
                    </a>
                </div>
            </div>
        </div>
    </div>'''

content = content.replace(old_modal, new_modal)

# 2. Update openModal function
old_openmodal = '''        function openModal(title, cat, desc, src, year, type) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-cat').textContent = cat;
            document.getElementById('modal-desc').textContent = desc;
            const img = document.getElementById('modal-img');
            if (type === 'img') {
                img.src = src;
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
            document.getElementById('port-modal').classList.add('open');
            document.body.style.overflow = 'hidden';
        }'''

new_openmodal = '''        function openModal(title, cat, desc, src, year, type) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-cat').textContent = cat;
            document.getElementById('modal-desc').textContent = desc;
            
            const img = document.getElementById('modal-img');
            const videoContainer = document.getElementById('modal-video-container');
            const video = document.getElementById('modal-video');
            const pdfContainer = document.getElementById('modal-pdf-container');
            const pdfLink = document.getElementById('modal-pdf-link');
            
            // Hide all media containers first
            img.style.display = 'none';
            videoContainer.style.display = 'none';
            pdfContainer.style.display = 'none';
            
            if (type === 'img') {
                img.src = src;
                img.style.display = 'block';
            } else if (type === 'video') {
                // Determine video type from extension
                let mimeType = 'video/mp4';
                if (src.endsWith('.webm')) mimeType = 'video/webm';
                else if (src.endsWith('.mkv')) mimeType = 'video/x-matroska';
                
                video.innerHTML = `<source src="${src}" type="${mimeType}">`;
                video.load();
                videoContainer.style.display = 'block';
            } else if (type === 'pdf') {
                pdfLink.href = src;
                pdfContainer.style.display = 'block';
            }
            
            document.getElementById('port-modal').classList.add('open');
            document.body.style.overflow = 'hidden';
        }'''

content = content.replace(old_openmodal, new_openmodal)

# 3. Update closeModal function to pause video
old_closemodal = '''        function closeModal() {
            document.getElementById('port-modal').classList.remove('open');
            document.body.style.overflow = '';
        }'''

new_closemodal = '''        function closeModal() {
            const video = document.getElementById('modal-video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            document.getElementById('port-modal').classList.remove('open');
            document.body.style.overflow = '';
        }'''

content = content.replace(old_closemodal, new_closemodal)

# Write the updated file
with open("portfolio.html", "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Updated modal HTML and JavaScript to support video and PDF files!")
