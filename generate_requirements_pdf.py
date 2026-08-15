import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 45, 572, 45)
        self.drawString(40, 30, "Project Delivery Dashboard — Software Requirements Specification (SRS)")
        self.drawRightString(572, 30, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def generate_pdf():
    pdf_filename = "requirement.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=45,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1e293b")
    brand_blue = colors.HexColor("#2563eb")
    brand_purple = colors.HexColor("#7c3aed")
    text_dark = colors.HexColor("#0f172a")
    text_muted = colors.HexColor("#475569")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=brand_blue,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=brand_purple,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=brand_blue,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        leftIndent=12,
        spaceAfter=3
    )

    table_header_style = ParagraphStyle(
        'THStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TDStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )

    story = []

    # Title & Metadata Header
    story.append(Paragraph("PROJECT DELIVERY DASHBOARD", title_style))
    story.append(Paragraph("Software Requirements Specification (SRS) & System Architecture", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceBefore=0, spaceAfter=12))

    meta_data = [
        [Paragraph("<b>Project Name:</b>", table_cell_style), Paragraph("Project Delivery Dashboard", table_cell_style),
         Paragraph("<b>Version:</b>", table_cell_style), Paragraph("1.0.0 (Production Candidate)", table_cell_style)],
        [Paragraph("<b>AI Engine:</b>", table_cell_style), Paragraph("Groq API (Llama 3.3 70B)", table_cell_style),
         Paragraph("<b>Date:</b>", table_cell_style), Paragraph("August 2026", table_cell_style)],
        [Paragraph("<b>Frontend:</b>", table_cell_style), Paragraph("React + TypeScript + Vite", table_cell_style),
         Paragraph("<b>Backend:</b>", table_cell_style), Paragraph("Python FastAPI + SQLite", table_cell_style)]
    ]
    t_meta = Table(meta_data, colWidths=[80, 180, 70, 202])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # 1. Executive Summary & Problem Statement
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "<b>The Challenge:</b> Customer delivery operations across onboarding, hardware integrations, and milestone deliverables are frequently tracked internally across siloed channels (emails, Slack threads, client calls). Status updates become scattered, leading to visibility bottlenecks, human overhead, and misaligned client expectations.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Solution:</b> A unified Project Delivery Dashboard powered by the ultra-low latency <b>Groq API (Llama 3.3 70B)</b> that automatically synthesizes unstructured communications into structured milestone statuses while strictly isolating internal technical blockers from customer-safe client portals.",
        body_style
    ))

    # 2. Scope & Target Audience
    story.append(Paragraph("2. Scope & Dual-Persona Architecture", h1_style))
    story.append(Paragraph(
        "The system enforces strict view-layer segregation across two core user roles:",
        body_style
    ))
    story.append(Paragraph("• <b>Internal Delivery Team View:</b> Full operational control. Displays raw technical blocker causes, root-cause analyses, developer assignment matrices, activity feeds, and real-time Linear issue webhook synchronizations.", bullet_style))
    story.append(Paragraph("• <b>Customer Client View:</b> Sanitized, executive-level delivery portal. Obfuscates internal friction and credentials issues, displaying verified progress percentages, high-level milestone timelines, and professional status updates.", bullet_style))

    # 3. Functional Requirements
    story.append(Paragraph("3. Functional Requirements (FR)", h1_style))
    
    fr_data = [
        [Paragraph("Req ID", table_header_style), Paragraph("Module", table_header_style), Paragraph("Requirement Description", table_header_style), Paragraph("Priority", table_header_style)],
        [Paragraph("FR-01", table_cell_style), Paragraph("Project Portfolio", table_cell_style), Paragraph("Display multi-project portfolio with health status (ON_TRACK, AT_RISK, BLOCKED, COMPLETED), multi-owner avatars, progress rings, and target delivery dates.", table_cell_style), Paragraph("Critical", table_cell_style)],
        [Paragraph("FR-02", table_cell_style), Paragraph("Milestones & Tasks", table_cell_style), Paragraph("Interactive milestone progression pipeline supporting Open, In Progress, Blocked, and Done states with automatic completion recalculations.", table_cell_style), Paragraph("Critical", table_cell_style)],
        [Paragraph("FR-03", table_cell_style), Paragraph("Groq AI Ingestion", table_cell_style), Paragraph("Process unstructured emails, Slack messages, and call transcripts via Groq LLM API. Extract structured JSON updates, task statuses, blockers, and customer summaries.", table_cell_style), Paragraph("Critical", table_cell_style)],
        [Paragraph("FR-04", table_cell_style), Paragraph("Dual-View Isolation", table_cell_style), Paragraph("Toggle between Internal View and Customer View with client tenant isolation ensuring no confidential internal notes leak to customers.", table_cell_style), Paragraph("Critical", table_cell_style)],
        [Paragraph("FR-05", table_cell_style), Paragraph("NL Query Assistant", table_cell_style), Paragraph("Conversational portfolio query assistant powered by Groq LLM to answer delivery status questions and highlight relevant projects.", table_cell_style), Paragraph("High", table_cell_style)],
        [Paragraph("FR-06", table_cell_style), Paragraph("Issues Management", table_cell_style), Paragraph("Track project issues with categories (Bug, Feature Request, Question, Support, Implementation) and internal-only access tags.", table_cell_style), Paragraph("High", table_cell_style)],
        [Paragraph("FR-07", table_cell_style), Paragraph("Linear Integration", table_cell_style), Paragraph("Simulate and receive Linear webhook payloads to automatically update project tasks and recalculate overall progress.", table_cell_style), Paragraph("Medium", table_cell_style)],
        [Paragraph("FR-08", table_cell_style), Paragraph("Stale Detection", table_cell_style), Paragraph("Automatically detect and trigger banner alerts for stale projects with no movement for > 7 days.", table_cell_style), Paragraph("Medium", table_cell_style)]
    ]
    t_fr = Table(fr_data, colWidths=[45, 95, 332, 60])
    t_fr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), brand_blue),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_fr)
    story.append(Spacer(1, 10))

    # 4. AI & Groq LLM Technical Specifications
    story.append(Paragraph("4. AI Engine & Groq LLM Integration", h1_style))
    story.append(Paragraph(
        "<b>Primary LLM Engine:</b> Official Groq Python SDK (<code>groq>=0.9.0</code>) with model <code>llama-3.3-70b-versatile</code> utilizing JSON mode (<code>response_format={'type': 'json_object'}</code>) for sub-second structured entity extraction.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Multi-Tier Fallback Cascade:</b>",
        body_style
    ))
    story.append(Paragraph("1. <b>Tier 1 (Groq API):</b> Lightning-fast cloud inference with Llama 3.3 70B (Primary).", bullet_style))
    story.append(Paragraph("2. <b>Tier 2 (Google Gemini API):</b> Secondary cloud LLM fallback.", bullet_style))
    story.append(Paragraph("3. <b>Tier 3 (Local NLP Engine):</b> Zero-dependency offline fallback using Scikit-Learn TF-IDF semantic task matching and sentiment regex classification.", bullet_style))

    story.append(Spacer(1, 8))

    # 5. Non-Functional Requirements
    story.append(Paragraph("5. Non-Functional Requirements (NFR)", h1_style))
    story.append(Paragraph("• <b>Performance:</b> AI entity extraction response time < 1.5 seconds via Groq hardware acceleration. Frontend bundle load time < 300ms.", bullet_style))
    story.append(Paragraph("• <b>Security & Privacy:</b> Zero credentials leakage. API keys stored strictly in <code>backend/.env</code> and excluded from source control via <code>.gitignore</code>.", bullet_style))
    story.append(Paragraph("• <b>Reliability:</b> Offline resilience ensuring the application operates seamlessly even without active external API access through local NLP.", bullet_style))
    story.append(Paragraph("• <b>Compatibility:</b> Fully responsive modern glassmorphic interface supporting dark and light themes across modern desktop browsers.", bullet_style))

    # 6. Verification & Test Suite Summary
    story.append(Paragraph("6. Verification & Quality Assurance", h1_style))
    qa_data = [
        [Paragraph("Test Suite", table_header_style), Paragraph("Target Component", table_header_style), Paragraph("Result", table_header_style)],
        [Paragraph("FastAPI Endpoints Suite", table_cell_style), Paragraph("All 9 REST endpoints (/api/health, /api/projects, /api/nl-query, etc.)", table_cell_style), Paragraph("100% PASS (9/9)", table_cell_style)],
        [Paragraph("Groq Live Extraction Test", table_cell_style), Paragraph("Multi-channel unstructured text parsing & JSON formatting", table_cell_style), Paragraph("100% PASS", table_cell_style)],
        [Paragraph("NL Query Assistant Test", table_cell_style), Paragraph("Portfolio-wide question answering and project ID filtering", table_cell_style), Paragraph("100% PASS", table_cell_style)],
        [Paragraph("TypeScript & Vite Build", table_cell_style), Paragraph("Frontend compilation and type verification", table_cell_style), Paragraph("0 Errors (Clean)", table_cell_style)]
    ]
    t_qa = Table(qa_data, colWidths=[130, 292, 110])
    t_qa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_qa)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Generated {pdf_filename}")

if __name__ == '__main__':
    generate_pdf()
