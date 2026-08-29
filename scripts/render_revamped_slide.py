"""
Render Revamped Tech Stack & System Architecture Slide Image
- Larger, highly readable fonts
- Completely revamped Right Side (Harmonious Light Color Palette, NO dark blue)
- Simplified text & details, skipped port numbers
- Exact header match: | TECH STACK & SYSTEM ARCHITECTURE
"""

import os
from PIL import Image, ImageDraw, ImageFont

def render_revamped_slide(scale=2):
    # 1920x1080 at scale=2 -> 3840x2160 (4K Ultra-HD)
    w = 1920 * scale
    h = 1080 * scale

    img = Image.new("RGB", (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Font Loader
    def get_font(size, bold=False):
        font_path = "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf"
        if not os.path.exists(font_path):
            font_path = "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf"
        return ImageFont.truetype(font_path, int(size * scale))

    # Generous, high-legibility font sizing
    font_main_title = get_font(46, bold=True)
    font_sec_hdr    = get_font(16, bold=True)
    font_left_label = get_font(18.5, bold=True)
    font_left_pill  = get_font(15.5, bold=True)
    
    font_tier_title = get_font(18, bold=True)
    font_tier_sub   = get_font(14.5, bold=False)
    font_conn       = get_font(13.5, bold=True)
    font_agent      = get_font(14, bold=True)
    font_shield     = get_font(14, bold=True)
    font_shield_sub = get_font(12.5, bold=False)
    font_badge      = get_font(12.5, bold=True)
    font_footer     = get_font(13.5, bold=True)

    # Color Palette
    c_slate_950 = (15, 23, 42)
    c_slate_800 = (30, 41, 59)
    c_slate_700 = (51, 65, 85)
    c_slate_600 = (71, 85, 105)
    c_slate_500 = (100, 116, 139)
    c_slate_400 = (148, 163, 184)
    c_slate_200 = (226, 232, 240)
    c_slate_100 = (241, 245, 249)

    c_orange_500 = (249, 115, 22) # #F97316
    c_blue_600   = (37, 99, 235)
    c_emerald_600= (5, 150, 105)
    c_purple_600 = (147, 51, 234)

    # 1. TOP HEADER: Exact Match to User Heading
    # Orange Vertical Bar
    draw.rounded_rectangle(
        [int(60 * scale), int(45 * scale), int(74 * scale), int(105 * scale)],
        radius=int(6 * scale),
        fill=c_orange_500
    )
    # Title Text
    draw.text((int(92 * scale), int(45 * scale)), "TECH STACK & SYSTEM ARCHITECTURE", fill=c_slate_950, font=font_main_title)

    # 2. LEFT CARD (Tech Stack Breakdown - Big, bold & clean)
    card_l_x1, card_l_y1 = int(60 * scale), int(135 * scale)
    card_l_x2, card_l_y2 = int(940 * scale), int(985 * scale)
    
    # Outer Card Box
    draw.rounded_rectangle([card_l_x1, card_l_y1, card_l_x2, card_l_y2], radius=int(24 * scale), fill=(255, 255, 255), outline=c_slate_200, width=int(2.5 * scale))

    # Header Row
    draw.ellipse([card_l_x1 + int(30 * scale), card_l_y1 + int(26 * scale), card_l_x1 + int(44 * scale), card_l_y1 + int(40 * scale)], fill=c_orange_500)
    draw.text((card_l_x1 + int(52 * scale), card_l_y1 + int(20 * scale)), "LAYER", fill=c_slate_700, font=font_sec_hdr)
    draw.text((card_l_x2 - int(320 * scale), card_l_y1 + int(20 * scale)), "PRODUCTION TECHNOLOGY", fill=c_slate_700, font=font_sec_hdr)
    
    draw.line([card_l_x1 + int(25 * scale), card_l_y1 + int(55 * scale), card_l_x2 - int(25 * scale), card_l_y1 + int(55 * scale)], fill=c_slate_100, width=int(2 * scale))

    # 9 Tech Rows
    rows = [
        ("Frontend & UI", "React 18 • Tailwind CSS • Vite", (238, 242, 255), (67, 56, 202), (199, 210, 254)),
        ("App Gateway", "Node.js • Express • RBAC • JWT", (236, 253, 245), (4, 120, 87), (167, 243, 208)),
        ("AI Microservice", "Python 3.11 • FastAPI • Uvicorn", (236, 254, 255), (14, 116, 144), (165, 243, 252)),
        ("Agent Engine", "LangGraph • 11 Specialized Agents", (250, 245, 255), (126, 34, 206), (233, 213, 255)),
        ("Guardrail & Trust", "8-Tier Active Security Perimeter", (254, 252, 232), (161, 98, 7), (253, 224, 71)),
        ("Hybrid Legal RAG", "Dense Vectors + BM25 + Reranker", (239, 246, 255), (29, 78, 216), (191, 219, 254)),
        ("DB & Caching", "MongoDB 7.0 • Redis 7.2 Queues", (255, 241, 242), (190, 18, 60), (254, 205, 211)),
        ("Doc AI & Voice", "Clause NLP • Whisper STT • jsPDF", (240, 253, 250), (15, 118, 110), (153, 246, 228)),
        ("Deployment", "Docker Compose • 5 Isolated Services", (241, 245, 249), (51, 65, 85), (203, 213, 225)),
    ]

    row_start_y = card_l_y1 + int(70 * scale)
    row_step = int(83 * scale)

    for i, (label, tech, pill_bg, pill_fg, pill_border) in enumerate(rows):
        cy = row_start_y + i * row_step
        
        # Row Label
        draw.text((card_l_x1 + int(30 * scale), cy + int(10 * scale)), label, fill=c_slate_950, font=font_left_label)

        # Pill Badge
        pill_w = int(400 * scale)
        pill_h = int(48 * scale)
        pill_x1 = card_l_x2 - pill_w - int(25 * scale)
        pill_y1 = cy + int(4 * scale)
        pill_x2 = pill_x1 + pill_w
        pill_y2 = pill_y1 + pill_h

        draw.rounded_rectangle([pill_x1, pill_y1, pill_x2, pill_y2], radius=int(14 * scale), fill=pill_bg, outline=pill_border, width=int(1.5 * scale))
        
        # Center text
        bbox = font_left_pill.getbbox(tech)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = pill_x1 + (pill_w - tw) // 2
        ty = pill_y1 + (pill_h - th) // 2 - int(2 * scale)
        draw.text((tx, ty), tech, fill=pill_fg, font=font_left_pill)

    # 3. RIGHT CARD (COMPLETELY REVAMPED: Cohesive Light Palette, Simplified & Elegant Flow)
    card_r_x1, card_r_y1 = int(980 * scale), int(135 * scale)
    card_r_x2, card_r_y2 = int(1860 * scale), int(985 * scale)
    
    # Outer Right Card Box
    draw.rounded_rectangle([card_r_x1, card_r_y1, card_r_x2, card_r_y2], radius=int(24 * scale), fill=(255, 255, 255), outline=c_slate_200, width=int(2.5 * scale))

    # Right Card Header
    draw.ellipse([card_r_x1 + int(30 * scale), card_r_y1 + int(26 * scale), card_r_x1 + int(44 * scale), card_r_y1 + int(40 * scale)], fill=c_blue_600)
    draw.text((card_r_x1 + int(52 * scale), card_r_y1 + int(20 * scale)), "SYSTEM ARCHITECTURE & DATA FLOW", fill=c_slate_700, font=font_sec_hdr)
    
    # Clean pill on top right
    zt_text = "Zero-Trust Architecture"
    zt_w, zt_h = int(210 * scale), int(34 * scale)
    zt_x1 = card_r_x2 - zt_w - int(25 * scale)
    zt_y1 = card_r_y1 + int(16 * scale)
    draw.rounded_rectangle([zt_x1, zt_y1, zt_x1 + zt_w, zt_y1 + zt_h], radius=int(10 * scale), fill=(236, 253, 245), outline=(167, 243, 208), width=int(1.5 * scale))
    draw.text((zt_x1 + int(20 * scale), zt_y1 + int(6 * scale)), zt_text, fill=(4, 120, 87), font=font_badge)

    draw.line([card_r_x1 + int(25 * scale), card_r_y1 + int(55 * scale), card_r_x2 - int(25 * scale), card_r_y1 + int(55 * scale)], fill=c_slate_100, width=int(2 * scale))

    t_w = card_r_x2 - card_r_x1 - int(50 * scale)
    t_x1 = card_r_x1 + int(25 * scale)
    t_x2 = t_x1 + t_w

    # --- TIER 1: CLIENT LAYER (Light Blue Theme) ---
    t1_y1 = card_r_y1 + int(70 * scale)
    t1_h  = int(108 * scale)
    t1_y2 = t1_y1 + t1_h

    draw.rounded_rectangle([t_x1, t1_y1, t_x2, t1_y2], radius=int(18 * scale), fill=(240, 249, 255), outline=(186, 230, 253), width=int(2 * scale))
    
    # Tier 1 Icon & Title
    draw.rounded_rectangle([t_x1 + int(20 * scale), t1_y1 + int(24 * scale), t_x1 + int(80 * scale), t1_y1 + int(84 * scale)], radius=int(14 * scale), fill=(2, 132, 199))
    draw.text((t_x1 + int(42 * scale), t1_y1 + int(34 * scale)), "1", fill=(255, 255, 255), font=font_left_label)
    
    draw.text((t_x1 + int(96 * scale), t1_y1 + int(22 * scale)), "React 18 + Tailwind Client Portal", fill=(12, 74, 110), font=font_tier_title)
    draw.text((t_x1 + int(96 * scale), t1_y1 + int(58 * scale)), "Citizen Intake UI  •  Lawyer Workspace  •  Live Trust Badges  •  Voice Assistant", fill=c_slate_600, font=font_tier_sub)

    # Connector 1
    c1_y = t1_y2 + int(10 * scale)
    c1_text = "↓ REST API / HTTPS + JWT Authentication"
    bbox = font_conn.getbbox(c1_text)
    ctx = t_x1 + (t_w - (bbox[2]-bbox[0])) // 2
    draw.text((ctx, c1_y), c1_text, fill=c_slate_400, font=font_conn)

    # --- TIER 2: GATEWAY LAYER (Light Emerald Theme) ---
    t2_y1 = c1_y + int(32 * scale)
    t2_h  = int(108 * scale)
    t2_y2 = t2_y1 + t2_h

    draw.rounded_rectangle([t_x1, t2_y1, t_x2, t2_y2], radius=int(18 * scale), fill=(236, 253, 245), outline=(167, 243, 208), width=int(2 * scale))
    
    # Tier 2 Icon & Title
    draw.rounded_rectangle([t_x1 + int(20 * scale), t2_y1 + int(24 * scale), t_x1 + int(80 * scale), t2_y1 + int(84 * scale)], radius=int(14 * scale), fill=(5, 150, 105))
    draw.text((t_x1 + int(40 * scale), t2_y1 + int(34 * scale)), "2", fill=(255, 255, 255), font=font_left_label)
    
    draw.text((t_x1 + int(96 * scale), t2_y1 + int(22 * scale)), "Node.js + Express Application Gateway", fill=(6, 78, 59), font=font_tier_title)
    draw.text((t_x1 + int(96 * scale), t2_y1 + int(58 * scale)), "Granular RBAC  •  Tenant Case Isolation  •  Redis Task Queues  •  Audit Logger", fill=c_slate_600, font=font_tier_sub)

    # Connector 2
    c2_y = t2_y2 + int(10 * scale)
    c2_text = "↓ Microservice Proxy (FastAPI Core)"
    bbox = font_conn.getbbox(c2_text)
    ctx = t_x1 + (t_w - (bbox[2]-bbox[0])) // 2
    draw.text((ctx, c2_y), c2_text, fill=c_slate_400, font=font_conn)

    # --- TIER 3: MULTI-AGENT AI CORE & GUARDRAIL (LIGHT PURPLE/INDIGO THEME - NO DARK BLUE!) ---
    t3_y1 = c2_y + int(32 * scale)
    t3_h  = int(260 * scale)
    t3_y2 = t3_y1 + t3_h

    # Soft light purple/slate container
    draw.rounded_rectangle([t_x1, t3_y1, t_x2, t3_y2], radius=int(20 * scale), fill=(250, 245, 255), outline=(221, 214, 254), width=int(2 * scale))
    
    # Tier 3 Icon & Title
    draw.rounded_rectangle([t_x1 + int(20 * scale), t3_y1 + int(18 * scale), t_x1 + int(68 * scale), t3_y1 + int(66 * scale)], radius=int(12 * scale), fill=c_purple_600)
    draw.text((t_x1 + int(35 * scale), t3_y1 + int(26 * scale)), "3", fill=(255, 255, 255), font=font_left_label)

    draw.text((t_x1 + int(80 * scale), t3_y1 + int(24 * scale)), "Python FastAPI + LangGraph Multi-Agent Engine", fill=(88, 28, 135), font=font_tier_title)

    # 6 Specialized Agent Badges Grid (Clean light pastel chips)
    agents = [
        ("Intake Agent", (255, 255, 255), (51, 65, 85), (203, 213, 225)),
        ("Research Agent", (255, 255, 255), (51, 65, 85), (203, 213, 225)),
        ("Doc AI Agent", (255, 255, 255), (51, 65, 85), (203, 213, 225)),
        ("Risk 1930 Agent", (254, 242, 242), (185, 28, 28), (254, 202, 202)),
        ("Drafting Agent", (255, 255, 255), (51, 65, 85), (203, 213, 225)),
        ("Verifier Agent", (236, 253, 245), (4, 120, 87), (167, 243, 208)),
    ]

    ag_w = int(124 * scale)
    ag_h = int(46 * scale)
    ag_gap = int(9 * scale)
    ag_start_x = t_x1 + int(20 * scale)
    ag_y = t3_y1 + int(82 * scale)

    for idx, (aname, abg, afg, abd) in enumerate(agents):
        ax1 = ag_start_x + idx * (ag_w + ag_gap)
        draw.rounded_rectangle([ax1, ag_y, ax1 + ag_w, ag_y + ag_h], radius=int(12 * scale), fill=abg, outline=abd, width=int(1.5 * scale))
        
        # Center agent text
        bbox = font_agent.getbbox(aname)
        atw = bbox[2] - bbox[0]
        ath = bbox[3] - bbox[1]
        atx = ax1 + (ag_w - atw) // 2
        aty = ag_y + (ag_h - ath) // 2 - int(2 * scale)
        draw.text((atx, aty), aname, fill=afg, font=font_agent)

    # Guardrail Shield Banner inside Tier 3 (Warm Soft Amber)
    gb_x1 = t_x1 + int(20 * scale)
    gb_y1 = t3_y1 + int(144 * scale)
    gb_x2 = t_x2 - int(20 * scale)
    gb_y2 = gb_y1 + int(96 * scale)

    draw.rounded_rectangle([gb_x1, gb_y1, gb_x2, gb_y2], radius=int(16 * scale), fill=(254, 252, 232), outline=(253, 224, 71), width=int(2 * scale))
    draw.text((gb_x1 + int(20 * scale), gb_y1 + int(18 * scale)), "🛡️ Active Guardrail Perimeter (Zero-Trust AI Safety Layer)", fill=(161, 98, 7), font=font_shield)
    draw.text((gb_x1 + int(20 * scale), gb_y1 + int(54 * scale)), "PII Redaction (Aadhaar/PAN)  •  Prompt Injection Shield  •  1930 Emergency Helpline Routing", fill=(133, 77, 14), font=font_shield_sub)
    
    # Active Tag
    act_w = int(95 * scale)
    act_h = int(32 * scale)
    act_x1 = gb_x2 - act_w - int(20 * scale)
    act_y1 = gb_y1 + int(18 * scale)
    draw.rounded_rectangle([act_x1, act_y1, act_x1 + act_w, act_y1 + act_h], radius=int(8 * scale), fill=(5, 150, 105))
    draw.text((act_x1 + int(18 * scale), act_y1 + int(6 * scale)), "ACTIVE", fill=(255, 255, 255), font=font_badge)

    # Connector 3
    c3_y = t3_y2 + int(10 * scale)
    c3_text = "↓ Dense Vectors + BM25 Hybrid Retrieval"
    bbox = font_conn.getbbox(c3_text)
    ctx = t_x1 + (t_w - (bbox[2]-bbox[0])) // 2
    draw.text((ctx, c3_y), c3_text, fill=c_slate_400, font=font_conn)

    # --- TIER 4: STATUTORY GROUNDING BASE (Light Amber/Orange Theme) ---
    t4_y1 = c3_y + int(32 * scale)
    t4_h  = int(108 * scale)
    t4_y2 = t4_y1 + t4_h

    draw.rounded_rectangle([t_x1, t4_y1, t_x2, t4_y2], radius=int(18 * scale), fill=(255, 251, 235), outline=(253, 224, 71), width=int(2 * scale))
    
    # Tier 4 Icon & Title
    draw.rounded_rectangle([t_x1 + int(20 * scale), t4_y1 + int(24 * scale), t_x1 + int(80 * scale), t4_y1 + int(84 * scale)], radius=int(14 * scale), fill=(217, 119, 6))
    draw.text((t_x1 + int(40 * scale), t4_y1 + int(34 * scale)), "4", fill=(255, 255, 255), font=font_left_label)
    
    draw.text((t_x1 + int(96 * scale), t4_y1 + int(22 * scale)), "Tier-1 Statutory Knowledge Base & Gazette Roll", fill=(120, 53, 15), font=font_tier_title)
    draw.text((t_x1 + int(96 * scale), t4_y1 + int(58 * scale)), "India Code  •  Gazette Notifications  •  eCourts Records  •  NALSA Legal Aid Portal", fill=(146, 64, 14), font=font_tier_sub)

    # 4. BOTTOM FOOTER (Matching Hackathon Template)
    foot_y = int(1020 * scale)
    draw.line([int(60 * scale), foot_y, int(1860 * scale), foot_y], fill=c_slate_100, width=int(2 * scale))
    
    # Green Dot + BUILD WITH BHARAT 2.0
    draw.ellipse([int(60 * scale), foot_y + int(18 * scale), int(76 * scale), foot_y + int(34 * scale)], fill=c_emerald_600)
    draw.text((int(88 * scale), foot_y + int(12 * scale)), "BUILD WITH भारत 2.0  •  NATIONAL LEVEL HACKATHON", fill=c_slate_800, font=font_footer)
    
    # Team Info on Right
    team_text = "TEAM CODING CHAMPS  •  BHARATI VIDYAPEETH'S COLLEGE OF ENGINEERING"
    bbox = font_footer.getbbox(team_text)
    tw = bbox[2] - bbox[0]
    draw.text((int(1860 * scale) - tw, foot_y + int(12 * scale)), team_text, fill=c_slate_500, font=font_footer)

    # Save Ultra-HD 4K (3840x2160)
    out_4k = "Tech_Stack_Slide_Revamped_4K.png"
    img.save(out_4k, "PNG", quality=100)
    print(f"4K Image saved to {out_4k}")

    # Save Full HD 1080p (1920x1080)
    out_1080p = "Tech_Stack_Slide_Revamped_1080p.png"
    img_1080p = img.resize((1920, 1080), Image.Resampling.LANCZOS)
    img_1080p.save(out_1080p, "PNG", quality=100)
    print(f"1080p Image saved to {out_1080p}")

if __name__ == "__main__":
    render_revamped_slide(scale=2)
