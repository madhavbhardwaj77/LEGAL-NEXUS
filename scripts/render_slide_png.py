"""
Render Pixel-Perfect Ultra-HD (1920x1080 & 3840x2160) PNG for Tech Stack & System Architecture Slide
"""

import os
from PIL import Image, ImageDraw, ImageFont

def render_slide(scale=2): # scale=2 produces 3840x2160 (4K Ultra-HD crisp)
    w = 1920 * scale
    h = 1080 * scale

    img = Image.new("RGB", (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Fonts
    def get_font(name, size, bold=False):
        font_path = "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf"
        if not os.path.exists(font_path):
            font_path = "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf"
        return ImageFont.truetype(font_path, int(size * scale))

    font_title = get_font("segoeui", 42, bold=True)
    font_sec_hdr = get_font("segoeui", 14, bold=True)
    font_item_title = get_font("segoeui", 16, bold=True)
    font_pill = get_font("segoeui", 13.5, bold=True)
    font_tier_title = get_font("segoeui", 15.5, bold=True)
    font_tier_sub = get_font("segoeui", 12.5, bold=False)
    font_conn = get_font("segoeui", 12, bold=True)
    font_agent = get_font("segoeui", 12, bold=True)
    font_badge = get_font("segoeui", 11.5, bold=True)
    font_footer = get_font("segoeui", 13, bold=True)

    # Colors
    c_slate_950 = (2, 6, 23)
    c_slate_900 = (15, 23, 42)
    c_slate_800 = (30, 41, 59)
    c_slate_700 = (51, 65, 85)
    c_slate_500 = (100, 116, 139)
    c_slate_400 = (148, 163, 184)
    c_slate_200 = (226, 232, 240)
    c_slate_100 = (241, 245, 249)
    c_slate_50  = (248, 250, 252)

    c_orange_500 = (249, 115, 22) # #F97316
    c_orange_600 = (234, 88, 12)
    c_blue_600   = (37, 99, 235)
    c_emerald_600= (5, 150, 105)
    c_purple_600 = (147, 51, 234)

    # 1. TOP HEADER: Exact Match to User Heading
    # Orange Vertical Bar
    draw.rounded_rectangle(
        [int(60 * scale), int(45 * scale), int(72 * scale), int(105 * scale)],
        radius=int(6 * scale),
        fill=c_orange_500
    )
    # Title Text
    draw.text((int(90 * scale), int(46 * scale)), "TECH STACK & SYSTEM ARCHITECTURE", fill=c_slate_950, font=font_title)

    # 2. LEFT CARD (Tech Stack Breakdown)
    card_l_x1, card_l_y1 = int(60 * scale), int(135 * scale)
    card_l_x2, card_l_y2 = int(940 * scale), int(985 * scale)
    
    # Draw Left Card Box
    draw.rounded_rectangle([card_l_x1, card_l_y1, card_l_x2, card_l_y2], radius=int(24 * scale), fill=(255, 255, 255), outline=c_slate_200, width=int(2 * scale))

    # Left Card Header
    draw.ellipse([card_l_x1 + int(30 * scale), card_l_y1 + int(28 * scale), card_l_x1 + int(42 * scale), card_l_y1 + int(40 * scale)], fill=c_orange_500)
    draw.text((card_l_x1 + int(50 * scale), card_l_y1 + int(22 * scale)), "LAYER", fill=c_slate_700, font=font_sec_hdr)
    draw.text((card_l_x2 - int(290 * scale), card_l_y1 + int(22 * scale)), "PRODUCTION TECHNOLOGY", fill=c_slate_700, font=font_sec_hdr)
    
    # Subheader Line
    draw.line([card_l_x1 + int(25 * scale), card_l_y1 + int(55 * scale), card_l_x2 - int(25 * scale), card_l_y1 + int(55 * scale)], fill=c_slate_100, width=int(2 * scale))

    # 9 Tech Rows
    rows = [
        ("Frontend & UI", "React 18 • Tailwind CSS • Vite", (238, 242, 255), (79, 70, 229), (199, 210, 254)),
        ("App Gateway", "Node.js • Express • RBAC • JWT", (236, 253, 245), (5, 150, 105), (167, 243, 208)),
        ("AI Microservice", "Python 3.11 • FastAPI • Uvicorn", (236, 254, 255), (8, 145, 178), (165, 243, 252)),
        ("Agent Engine", "LangGraph • 11 Specialized Agents", (250, 245, 255), (147, 51, 234), (233, 213, 255)),
        ("Guardrail & Trust", "8-Tier Active Security Perimeter", (254, 252, 232), (161, 98, 7), (253, 224, 71)),
        ("Hybrid Legal RAG", "Dense Vectors + BM25 + Reranker", (239, 246, 255), (37, 99, 235), (191, 219, 254)),
        ("DB & Caching", "MongoDB 7.0 • Redis 7.2 Queues", (255, 241, 242), (225, 29, 72), (254, 205, 211)),
        ("Doc AI & Voice", "Clause NLP • Whisper STT • jsPDF", (240, 253, 250), (13, 148, 136), (153, 246, 228)),
        ("Deployment", "Docker Compose • 5 Isolated Services", (241, 245, 249), (71, 85, 105), (203, 213, 225)),
    ]

    row_start_y = card_l_y1 + int(70 * scale)
    row_step = int(83 * scale)

    for i, (label, tech, pill_bg, pill_fg, pill_border) in enumerate(rows):
        cy = row_start_y + i * row_step
        
        # Row Label
        draw.text((card_l_x1 + int(30 * scale), cy + int(12 * scale)), label, fill=c_slate_900, font=font_item_title)

        # Pill Badge on right
        pill_w = int(370 * scale)
        pill_h = int(44 * scale)
        pill_x1 = card_l_x2 - pill_w - int(25 * scale)
        pill_y1 = cy + int(4 * scale)
        pill_x2 = pill_x1 + pill_w
        pill_y2 = pill_y1 + pill_h

        draw.rounded_rectangle([pill_x1, pill_y1, pill_x2, pill_y2], radius=int(12 * scale), fill=pill_bg, outline=pill_border, width=int(1.5 * scale))
        
        # Center text inside pill
        bbox = font_pill.getbbox(tech)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = pill_x1 + (pill_w - tw) // 2
        ty = pill_y1 + (pill_h - th) // 2 - int(2 * scale)
        draw.text((tx, ty), tech, fill=pill_fg, font=font_pill)

    # 3. RIGHT CARD (Redesigned System Architecture)
    card_r_x1, card_r_y1 = int(980 * scale), int(135 * scale)
    card_r_x2, card_r_y2 = int(1860 * scale), int(985 * scale)
    
    draw.rounded_rectangle([card_r_x1, card_r_y1, card_r_x2, card_r_y2], radius=int(24 * scale), fill=(255, 255, 255), outline=c_slate_200, width=int(2 * scale))

    # Right Card Header
    draw.ellipse([card_r_x1 + int(30 * scale), card_r_y1 + int(28 * scale), card_r_x1 + int(42 * scale), card_r_y1 + int(40 * scale)], fill=c_blue_600)
    draw.text((card_r_x1 + int(50 * scale), card_r_y1 + int(22 * scale)), "SYSTEM ARCHITECTURE & DATA FLOW", fill=c_slate_700, font=font_sec_hdr)
    
    # Zero-Trust Pill on right header
    zt_text = "Zero-Trust Architecture"
    zt_w, zt_h = int(190 * scale), int(30 * scale)
    zt_x1 = card_r_x2 - zt_w - int(25 * scale)
    zt_y1 = card_r_y1 + int(18 * scale)
    draw.rounded_rectangle([zt_x1, zt_y1, zt_x1 + zt_w, zt_y1 + zt_h], radius=int(8 * scale), fill=(236, 253, 245), outline=(167, 243, 208), width=int(1.5 * scale))
    draw.text((zt_x1 + int(15 * scale), zt_y1 + int(5 * scale)), zt_text, fill=(5, 150, 105), font=font_badge)

    draw.line([card_r_x1 + int(25 * scale), card_r_y1 + int(55 * scale), card_r_x2 - int(25 * scale), card_r_y1 + int(55 * scale)], fill=c_slate_100, width=int(2 * scale))

    # TIER 1: Client Layer Box
    t1_x1 = card_r_x1 + int(25 * scale)
    t1_y1 = card_r_y1 + int(70 * scale)
    t1_x2 = card_r_x2 - int(25 * scale)
    t1_h  = int(105 * scale)
    t1_y2 = t1_y1 + t1_h

    draw.rounded_rectangle([t1_x1, t1_y1, t1_x2, t1_y2], radius=int(16 * scale), fill=c_slate_50, outline=(191, 219, 254), width=int(2 * scale))
    
    # Number 1 Circle Badge
    draw.rounded_rectangle([t1_x1 + int(20 * scale), t1_y1 + int(25 * scale), t1_x1 + int(75 * scale), t1_y1 + int(80 * scale)], radius=int(12 * scale), fill=c_blue_600)
    draw.text((t1_x1 + int(41 * scale), t1_y1 + int(33 * scale)), "1", fill=(255, 255, 255), font=font_item_title)
    
    draw.text((t1_x1 + int(90 * scale), t1_y1 + int(22 * scale)), "React 18 + Tailwind Client Portal", fill=c_slate_950, font=font_tier_title)
    draw.text((t1_x1 + int(90 * scale), t1_y1 + int(55 * scale)), "Citizen Intake UI • Lawyer Workspace • Live Trust Badges • Voice Widget", fill=c_slate_500, font=font_tier_sub)
    
    # Port Pill
    draw.rounded_rectangle([t1_x2 - int(115 * scale), t1_y1 + int(32 * scale), t1_x2 - int(20 * scale), t1_y1 + int(72 * scale)], radius=int(8 * scale), fill=(255, 255, 255), outline=(191, 219, 254), width=int(1.5 * scale))
    draw.text((t1_x2 - int(102 * scale), t1_y1 + int(40 * scale)), "Port 5173", fill=c_blue_600, font=font_badge)

    # Connector 1
    c1_y = t1_y2 + int(10 * scale)
    draw.text((card_r_x1 + int(310 * scale), c1_y), "↓ REST API / HTTPS + JWT Auth", fill=c_slate_400, font=font_conn)

    # TIER 2: Gateway Layer Box
    t2_y1 = c1_y + int(32 * scale)
    t2_y2 = t2_y1 + t1_h

    draw.rounded_rectangle([t1_x1, t2_y1, t1_x2, t2_y2], radius=int(16 * scale), fill=c_slate_50, outline=(167, 243, 208), width=int(2 * scale))
    
    # Number 2 Circle Badge
    draw.rounded_rectangle([t1_x1 + int(20 * scale), t2_y1 + int(25 * scale), t1_x1 + int(75 * scale), t2_y1 + int(80 * scale)], radius=int(12 * scale), fill=c_emerald_600)
    draw.text((t1_x1 + int(39 * scale), t2_y1 + int(33 * scale)), "2", fill=(255, 255, 255), font=font_item_title)
    
    draw.text((t1_x1 + int(90 * scale), t2_y1 + int(22 * scale)), "Node.js + Express Application Gateway", fill=c_slate_950, font=font_tier_title)
    draw.text((t1_x1 + int(90 * scale), t2_y1 + int(55 * scale)), "Granular RBAC • Case Isolation • Task Queues (Redis) • Audit Logger", fill=c_slate_500, font=font_tier_sub)
    
    # Port Pill
    draw.rounded_rectangle([t1_x2 - int(115 * scale), t2_y1 + int(32 * scale), t1_x2 - int(20 * scale), t2_y1 + int(72 * scale)], radius=int(8 * scale), fill=(255, 255, 255), outline=(167, 243, 208), width=int(1.5 * scale))
    draw.text((t1_x2 - int(102 * scale), t2_y1 + int(40 * scale)), "Port 5001", fill=c_emerald_600, font=font_badge)

    # Connector 2
    c2_y = t2_y2 + int(10 * scale)
    draw.text((card_r_x1 + int(345 * scale), c2_y), "↓ Microservice Proxy", fill=c_slate_400, font=font_conn)

    # TIER 3: Multi-Agent AI Core & Guardrail (Elevated Slate-900 Container)
    t3_y1 = c2_y + int(32 * scale)
    t3_h  = int(270 * scale)
    t3_y2 = t3_y1 + t3_h

    draw.rounded_rectangle([t1_x1, t3_y1, t1_x2, t3_y2], radius=int(18 * scale), fill=c_slate_900, outline=c_slate_700, width=int(2 * scale))
    
    # Number 3 Circle Badge
    draw.rounded_rectangle([t1_x1 + int(20 * scale), t3_y1 + int(18 * scale), t1_x1 + int(60 * scale), t3_y1 + int(58 * scale)], radius=int(10 * scale), fill=c_purple_600)
    draw.text((t1_x1 + int(32 * scale), t3_y1 + int(24 * scale)), "3", fill=(255, 255, 255), font=font_item_title)

    draw.text((t1_x1 + int(72 * scale), t3_y1 + int(24 * scale)), "Python FastAPI + LangGraph Multi-Agent Engine", fill=(241, 245, 249), font=font_tier_title)
    
    # Port 8001 Pill
    draw.rounded_rectangle([t1_x2 - int(115 * scale), t3_y1 + int(20 * scale), t1_x2 - int(20 * scale), t3_y1 + int(56 * scale)], radius=int(8 * scale), fill=(88, 28, 135), outline=(147, 51, 234), width=int(1.5 * scale))
    draw.text((t1_x2 - int(102 * scale), t3_y1 + int(27 * scale)), "Port 8001", fill=(233, 213, 255), font=font_badge)

    # Sub-divider line inside dark container
    draw.line([t1_x1 + int(20 * scale), t3_y1 + int(70 * scale), t1_x2 - int(20 * scale), t3_y1 + int(70 * scale)], fill=c_slate_800, width=int(1.5 * scale))

    # 6 Specialized Agent Badges Grid
    agents = [
        ("Intake Agent", (51, 65, 85), (241, 245, 249)),
        ("Research Agent", (51, 65, 85), (241, 245, 249)),
        ("Doc AI Agent", (51, 65, 85), (241, 245, 249)),
        ("Risk 1930 Agent", (127, 29, 29), (254, 202, 202)),
        ("Drafting Agent", (51, 65, 85), (241, 245, 249)),
        ("Verifier Agent", (6, 78, 59), (167, 243, 208)),
    ]

    ag_w = int(123 * scale)
    ag_h = int(48 * scale)
    ag_gap = int(10 * scale)
    ag_start_x = t1_x1 + int(20 * scale)
    ag_y = t3_y1 + int(88 * scale)

    for idx, (aname, abg, afg) in enumerate(agents):
        ax1 = ag_start_x + idx * (ag_w + ag_gap)
        draw.rounded_rectangle([ax1, ag_y, ax1 + ag_w, ag_y + ag_h], radius=int(10 * scale), fill=abg, outline=c_slate_700, width=int(1.5 * scale))
        
        # Center agent name
        bbox = font_agent.getbbox(aname)
        atw = bbox[2] - bbox[0]
        ath = bbox[3] - bbox[1]
        atx = ax1 + (ag_w - atw) // 2
        aty = ag_y + (ag_h - ath) // 2 - int(2 * scale)
        draw.text((atx, aty), aname, fill=afg, font=font_agent)

    # Guardrail Shield Banner inside dark container
    gb_x1 = t1_x1 + int(20 * scale)
    gb_y1 = t3_y1 + int(155 * scale)
    gb_x2 = t1_x2 - int(20 * scale)
    gb_y2 = gb_y1 + int(90 * scale)

    draw.rounded_rectangle([gb_x1, gb_y1, gb_x2, gb_y2], radius=int(14 * scale), fill=(69, 26, 3), outline=(217, 119, 6), width=int(2 * scale))
    draw.text((gb_x1 + int(20 * scale), gb_y1 + int(18 * scale)), "🛡️ Active Guardrail Perimeter (Zero-Trust AI Security)", fill=(254, 240, 138), font=font_item_title)
    draw.text((gb_x1 + int(20 * scale), gb_y1 + int(52 * scale)), "PII Redaction (Aadhaar/PAN) • Prompt Shield • Overconfidence Filter • 1930 Emergency Routing", fill=(253, 230, 138), font=font_tier_sub)
    
    # Active Tag
    draw.rounded_rectangle([gb_x2 - int(105 * scale), gb_y1 + int(22 * scale), gb_x2 - int(20 * scale), gb_y1 + int(68 * scale)], radius=int(8 * scale), fill=(5, 150, 105))
    draw.text((gb_x2 - int(92 * scale), gb_y1 + int(33 * scale)), "ACTIVE", fill=(255, 255, 255), font=font_badge)

    # Connector 3
    c3_y = t3_y2 + int(10 * scale)
    draw.text((card_r_x1 + int(270 * scale), c3_y), "↓ Dense Vector + BM25 Hybrid Retrieval", fill=c_slate_400, font=font_conn)

    # TIER 4: Statutory Grounding Base Box
    t4_y1 = c3_y + int(32 * scale)
    t4_y2 = t4_y1 + t1_h

    draw.rounded_rectangle([t1_x1, t4_y1, t1_x2, t4_y2], radius=int(16 * scale), fill=(254, 252, 232), outline=(253, 224, 71), width=int(2 * scale))
    
    # Number 4 Circle Badge
    draw.rounded_rectangle([t1_x1 + int(20 * scale), t4_y1 + int(25 * scale), t1_x1 + int(75 * scale), t4_y1 + int(80 * scale)], radius=int(12 * scale), fill=(217, 119, 6))
    draw.text((t1_x1 + int(39 * scale), t4_y1 + int(33 * scale)), "4", fill=(255, 255, 255), font=font_item_title)
    
    draw.text((t1_x1 + int(90 * scale), t4_y1 + int(22 * scale)), "Tier-1 Statutory Knowledge Base & Gazette Roll", fill=(113, 63, 18), font=font_tier_title)
    draw.text((t1_x1 + int(90 * scale), t4_y1 + int(55 * scale)), "India Code • Gazette Notifications • eCourts Records • NALSA Legal Aid Portal", fill=(161, 98, 7), font=font_tier_sub)
    
    # Tier 1 Gazette Pill
    draw.rounded_rectangle([t1_x2 - int(150 * scale), t4_y1 + int(32 * scale), t1_x2 - int(20 * scale), t4_y1 + int(72 * scale)], radius=int(8 * scale), fill=(255, 255, 255), outline=(253, 224, 71), width=int(1.5 * scale))
    draw.text((t1_x2 - int(138 * scale), t4_y1 + int(40 * scale)), "Tier 1 Gazette", fill=(180, 83, 9), font=font_badge)

    # 4. BOTTOM FOOTER (Matching Hackathon Template)
    foot_y = int(1025 * scale)
    draw.line([int(60 * scale), foot_y, int(1860 * scale), foot_y], fill=c_slate_100, width=int(2 * scale))
    
    # Green Circle + BUILD WITH BHARAT 2.0
    draw.ellipse([int(60 * scale), foot_y + int(18 * scale), int(74 * scale), foot_y + int(32 * scale)], fill=c_emerald_600)
    draw.text((int(85 * scale), foot_y + int(13 * scale)), "BUILD WITH भारत 2.0  •  NATIONAL LEVEL HACKATHON", fill=c_slate_800, font=font_footer)
    
    # Team Info on Right
    team_text = "TEAM CODING CHAMPS  •  BHARATI VIDYAPEETH'S COLLEGE OF ENGINEERING"
    bbox = font_footer.getbbox(team_text)
    tw = bbox[2] - bbox[0]
    draw.text((int(1860 * scale) - tw, foot_y + int(13 * scale)), team_text, fill=c_slate_500, font=font_footer)

    # Save Output
    out_filename = "Tech_Stack_Slide_4K_UltraHD.png"
    img.save(out_filename, "PNG", quality=100)
    print(f"Ultra-HD 4K Slide image saved successfully to {out_filename} ({w}x{h})")

    # Also save standard 1920x1080 version
    out_1080p = "Tech_Stack_Slide_1080p.png"
    img_1080p = img.resize((1920, 1080), Image.Resampling.LANCZOS)
    img_1080p.save(out_1080p, "PNG", quality=100)
    print(f"1080p Slide image saved successfully to {out_1080p}")

if __name__ == "__main__":
    render_slide(scale=2)
