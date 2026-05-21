import re

def extract_block(text, start_marker, end_marker):
    pattern = re.compile(re.escape(start_marker) + r'.*?' + re.escape(end_marker), re.DOTALL)
    match = re.search(pattern, text)
    if match:
        return match.group(0)
    return ""

def update_file(filepath, footer_html, scripts_html, mobile_css):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update <style> block
    if "MOBILE HAMBURGER MENU" not in content:
        content = content.replace("</style>", mobile_css + "\n    </style>")

    # 2. Replace Footer
    # the old footer starts with <!-- FULL FOOTER (Exact Copy from Index) -->
    # and ends with </footer>
    footer_pattern = re.compile(r'<!-- FULL FOOTER.*?</script>', re.DOTALL)
    # Actually wait, the old footer in terms.html ends at </footer>, then there's scripts.
    # Let's replace from <!-- FULL FOOTER to </footer>
    footer_pattern = re.compile(r'<!-- FULL FOOTER.*?</footer>', re.DOTALL)
    if re.search(footer_pattern, content):
        content = re.sub(footer_pattern, footer_html, content)
    
    # 3. Replace Scripts
    # Old scripts start at <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    # and go to </body>
    script_pattern = re.compile(r'<script src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>.*?</body>', re.DOTALL)
    if re.search(script_pattern, content):
        content = re.sub(script_pattern, scripts_html + "\n</body>", content)

    # 4. Highlight active links
    if 'terms.html' in filepath:
        content = content.replace('<li><a href="/terms" style="color: #555; text-decoration: none; font-size: 0.95rem; transition: 0.3s;" onmouseover="this.style.color=\'#D4AF37\'" onmouseout="this.style.color=\'#555\'">Terms & Conditions</a></li>',
                                  '<li><a href="/terms" style="color: #D4AF37; text-decoration: none; font-size: 0.95rem; font-weight: 700;">Terms & Conditions</a></li>')
    elif 'privacy.html' in filepath:
        content = content.replace('<li><a href="/privacy" style="color: #555; text-decoration: none; font-size: 0.95rem; transition: 0.3s;" onmouseover="this.style.color=\'#D4AF37\'" onmouseout="this.style.color=\'#555\'">Privacy Policy</a></li>',
                                  '<li><a href="/privacy" style="color: #D4AF37; text-decoration: none; font-size: 0.95rem; font-weight: 700;">Privacy Policy</a></li>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

with open('team.html', 'r', encoding='utf-8') as f:
    team = f.read()

# Precise extraction
footer_html = extract_block(team, '<footer id="contact"', '</footer>')
footer_html = "<!-- FULL FOOTER -->\n    " + footer_html

scripts_html = extract_block(team, '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    <script src="js/nav-auth.js"></script>', '</script>\n    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>')

mobile_css = """
        /* ============================================
           MOBILE HAMBURGER MENU
        ============================================ */
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 8px;
            z-index: 1001;
            flex-shrink: 0;
        }

        .mobile-nav-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(5, 10, 25, 0.97);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 9999;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 28px;
            padding: 60px 40px 40px;
        }

        .mobile-nav-overlay.active {
            display: flex !important;
        }

        .mobile-nav-link {
            color: rgba(255,255,255,0.85);
            text-decoration: none;
            font-size: 1.4rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            transition: color 0.2s;
            text-align: center;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
            color: #F5C542;
        }

        .mobile-close-btn {
            position: absolute;
            top: 25px;
            right: 25px;
            background: none;
            border: none;
            color: white;
            font-size: 2.2rem;
            cursor: pointer;
            line-height: 1;
            padding: 5px 10px;
        }

        .mobile-nav-cta {
            margin-top: 10px;
            background: #F5C542;
            color: #000;
            font-weight: 800;
            padding: 14px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-size: 0.95rem;
            letter-spacing: 1px;
            text-align: center;
            width: 80%;
            display: block;
        }

        @media (max-width: 768px) {
            .nav-menu { display: none !important; }
            #user-nav-section { display: none !important; }
            .mobile-menu-btn { display: flex !important; align-items: center; justify-content: center; }

            .nav-pill {
                padding: 10px 16px !important;
                width: 92% !important;
                top: 12px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
            }

            .logo-text {
                font-size: 0.78rem !important;
                line-height: 1.2 !important;
            }

            .logo-divider {
                height: 18px !important;
                margin: 0 6px !important;
            }
        }
"""

update_file('terms.html', footer_html, scripts_html, mobile_css)
update_file('privacy.html', footer_html, scripts_html, mobile_css)
print("Updated legal pages correctly.")
