import io
from urllib.parse import quote
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode import qr
from backend.app.models.invoice import Invoice
from backend.app.models.settings import SystemSettings

PT_PER_MM = 72.0 / 25.4 # ~2.83465 points per mm

def get_upi_qr_drawing(upi_id: str, payee_name: str, amount: float, invoice_number: str, size: float = 70):
    if not upi_id:
        return None
    try:
        pn_clean = quote(payee_name or "Store")
        tn_clean = quote(f"Invoice {invoice_number}")
        upi_uri = f"upi://pay?pa={upi_id.strip()}&pn={pn_clean}&am={amount:.2f}&cu=INR&tn={tn_clean}"
        qr_widget = qr.QrCodeWidget(upi_uri)
        b = qr_widget.getBounds()
        bw = b[2] - b[0]
        bh = b[3] - b[1]
        d = Drawing(size, size, transform=[size / bw, 0, 0, size / bh, 0, 0])
        d.add(qr_widget)
        return d
    except Exception:
        return None

def get_format_dimensions(format_name: str, item_count: int = 1):
    fmt = (format_name or "a4").lower()
    if fmt == "50mm":
        width = 50 * PT_PER_MM # ~141.73 pt
        # Dynamic height estimated based on lines + QR
        height = max(410.0, 240.0 + item_count * 28.0)
        margin = 6
        return (width, height), margin
    elif fmt == "80mm":
        width = 80 * PT_PER_MM # ~226.77 pt
        height = max(520.0, 290.0 + item_count * 30.0)
        margin = 10
        return (width, height), margin
    else: # a4
        return A4, 36

def generate_invoice_pdf(invoice: Invoice, settings: SystemSettings, format_name: str = "a4") -> bytes:
    """
    Generates customer-facing invoice PDF in 50mm, 80mm, or A4 format.
    STRICT PRIVACY: NEVER reveals purchase rates, landed cost, or profit margins.
    NO GST: Cleanly calculates and displays selling rates and discounts only.
    """
    buffer = io.BytesIO()
    fmt = (format_name or "a4").lower()
    pagesize, margin = get_format_dimensions(fmt, len(invoice.items))

    doc = SimpleDocTemplate(
        buffer,
        pagesize=pagesize,
        rightMargin=margin,
        leftMargin=margin,
        topMargin=margin,
        bottomMargin=margin,
        pageCompression=0
    )

    styles = getSampleStyleSheet()
    primary_color = colors.HexColor("#4338ca")
    slate_dark = colors.HexColor("#0b1c30")
    slate_muted = colors.HexColor("#565e74")
    border_color = colors.HexColor("#cbd5e1")
    light_bg = colors.HexColor("#f8f9ff")

    # Format specific styling parameters
    if fmt == "50mm":
        header_text = getattr(settings, "template_50mm_header", None) or "INVOICE / BILL"
        footer_text = getattr(settings, "template_50mm_footer", None) or "Thank you! Visit again."
        show_logo = getattr(settings, "template_50mm_show_logo", False)
        base_font = getattr(settings, "template_50mm_font_size", None) or 7
    elif fmt == "80mm":
        header_text = getattr(settings, "template_80mm_header", None) or "CASH MEMO / INVOICE"
        footer_text = getattr(settings, "template_80mm_footer", None) or "Thank you for your business!"
        show_logo = getattr(settings, "template_80mm_show_logo", True)
        base_font = getattr(settings, "template_80mm_font_size", None) or 8
    else: # a4
        header_text = getattr(settings, "template_a4_header", None) or settings.bill_header or "INVOICE / CASH MEMO"
        footer_text = getattr(settings, "template_a4_footer", None) or settings.bill_footer or "Thank you for your business!"
        show_logo = getattr(settings, "template_a4_show_logo", None) if getattr(settings, "template_a4_show_logo", None) is not None else settings.show_logo
        base_font = getattr(settings, "template_a4_font_size", None) or 9

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=base_font,
        leading=base_font + 3,
        textColor=slate_dark,
    )
    cell_regular = ParagraphStyle(
        'CellRegular',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=base_font,
        leading=base_font + 3,
        textColor=slate_dark,
    )
    cell_muted = ParagraphStyle(
        'CellMuted',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=max(6, base_font - 1),
        leading=base_font + 1,
        textColor=slate_muted,
    )

    story = []

    # ==========================
    # 50mm Compact Thermal Roll
    # ==========================
    if fmt == "50mm":
        printable_w = pagesize[0] - (2 * margin) # ~130 pt

        title_style = ParagraphStyle('T50', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=11, alignment=1, textColor=primary_color)
        sub_style = ParagraphStyle('S50', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=9, alignment=1, textColor=slate_muted)
        
        story.append(Paragraph(f"<b>{settings.store_name}</b>", title_style))
        story.append(Paragraph(f"{settings.phone} | {settings.branch_name}", sub_style))
        story.append(Spacer(1, 3))
        story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=2, spaceAfter=4))
        
        meta_p = Paragraph(f"<b>{header_text}</b><br/><b>Inv:</b> {invoice.invoice_number}<br/><b>Date:</b> {invoice.created_at.strftime('%d-%b-%y %I:%M%p')}<br/><b>Cust:</b> {invoice.customer_name}", cell_regular)
        story.append(meta_p)
        story.append(Spacer(1, 4))

        # Compact items table: Item (w=68) | Qty (w=26) | Total (w=36)
        t_data = [[Paragraph("<b>Item</b>", cell_bold), Paragraph("<b>Qty</b>", cell_bold), Paragraph("<b>Amt</b>", cell_bold)]]
        for it in invoice.items:
            t_data.append([
                Paragraph(f"{it.product_name[:18]}", cell_regular),
                Paragraph(f"{it.quantity:g}", cell_regular),
                Paragraph(f"{it.total_amount:.1f}", cell_bold)
            ])
        it_table = Table(t_data, colWidths=[66, 26, 38])
        it_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ]))
        story.append(it_table)
        story.append(Spacer(1, 4))

        # Totals
        summary_rows = [
            [Paragraph("Subtotal:", cell_regular), Paragraph(f"₹ {invoice.subtotal:,.2f}", cell_regular)],
        ]
        if invoice.discount_amount > 0:
            summary_rows.append([Paragraph("Disc:", cell_regular), Paragraph(f"- ₹ {invoice.discount_amount:,.2f}", cell_regular)])
        summary_rows.append([Paragraph("<b>Total:</b>", cell_bold), Paragraph(f"<b>₹ {invoice.total_amount:,.2f}</b>", cell_bold)])
        if invoice.balance_amount > 0:
            summary_rows.append([Paragraph("Due:", cell_regular), Paragraph(f"₹ {invoice.balance_amount:,.2f}", cell_bold)])
        
        sm_table = Table(summary_rows, colWidths=[60, 70])
        sm_table.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('TOPPADDING', (0,0), (-1,-1), 1),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ]))
        story.append(sm_table)

        if getattr(settings, "template_50mm_show_qr", True) and getattr(settings, "show_qr", True) and getattr(settings, "upi_id", None):
            qr_draw = get_upi_qr_drawing(settings.upi_id, getattr(settings, "upi_payee_name", settings.store_name), invoice.total_amount, invoice.invoice_number, size=52)
            if qr_draw:
                story.append(Spacer(1, 3))
                qr_cell = Table([[qr_draw], [Paragraph("<b>Scan UPI to Pay</b>", ParagraphStyle('QR50', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6, leading=7, alignment=1, textColor=slate_dark))]], colWidths=[printable_w])
                qr_cell.setStyle(TableStyle([
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('TOPPADDING', (0,0), (-1,-1), 1),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 1),
                ]))
                story.append(qr_cell)

        story.append(Spacer(1, 4))
        story.append(Paragraph(f"{footer_text}", ParagraphStyle('F50', parent=styles['Normal'], fontName='Helvetica', fontSize=6, leading=8, alignment=1, textColor=slate_muted)))

    # ==========================
    # 80mm Standard POS Thermal Roll
    # ==========================
    elif fmt == "80mm":
        printable_w = pagesize[0] - (2 * margin) # ~206 pt

        title_style = ParagraphStyle('T80', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=14, alignment=1, textColor=primary_color)
        sub_style = ParagraphStyle('S80', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10, alignment=1, textColor=slate_muted)

        if show_logo:
            story.append(Paragraph(f"<b>[ {settings.store_name} ]</b>", title_style))
        else:
            story.append(Paragraph(f"<b>{settings.store_name}</b>", title_style))
            
        story.append(Paragraph(f"{settings.branch_name}<br/>{settings.phone}", sub_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=border_color, spaceBefore=4, spaceAfter=6))

        meta_text = f"""
        <b>{header_text}</b><br/>
        <b>Invoice:</b> {invoice.invoice_number}<br/>
        <b>Date:</b> {invoice.created_at.strftime('%d-%b-%Y %I:%M %p')}<br/>
        <b>Customer:</b> {invoice.customer_name} ({invoice.customer_phone or 'Walk-in'})<br/>
        <b>Payment:</b> {invoice.payment_mode} ({invoice.payment_status})
        """
        story.append(Paragraph(meta_text, cell_regular))
        story.append(Spacer(1, 6))

        # Items Table: Item & SKU (w=96) | Qty (w=30) | Rate (w=38) | Total (w=42)
        t_data = [
            [
                Paragraph("<b>Item Description</b>", cell_bold),
                Paragraph("<b>Qty</b>", cell_bold),
                Paragraph("<b>Rate</b>", cell_bold),
                Paragraph("<b>Total</b>", cell_bold)
            ]
        ]
        for it in invoice.items:
            t_data.append([
                Paragraph(f"<b>{it.product_name}</b><br/><font size='6' color='#565e74'>{it.sku}</font>", cell_regular),
                Paragraph(f"{it.quantity:g} {it.unit}", cell_regular),
                Paragraph(f"{it.unit_rate:.2f}", cell_regular),
                Paragraph(f"{it.total_amount:.2f}", cell_bold)
            ])
        it_table = Table(t_data, colWidths=[96, 32, 36, 42])
        it_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), light_bg),
            ('GRID', (0,0), (-1,-1), 0.5, border_color),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(it_table)
        story.append(Spacer(1, 6))

        # Summary
        summary_rows = [
            [Paragraph("Gross Subtotal:", cell_regular), Paragraph(f"₹ {invoice.subtotal:,.2f}", cell_regular)],
        ]
        if invoice.discount_amount > 0:
            summary_rows.append([Paragraph("Discount:", cell_regular), Paragraph(f"- ₹ {invoice.discount_amount:,.2f}", cell_regular)])
        summary_rows.append([Paragraph("<b>Grand Total:</b>", cell_bold), Paragraph(f"<b>₹ {invoice.total_amount:,.2f}</b>", cell_bold)])
        summary_rows.append([Paragraph("Amount Paid:", cell_regular), Paragraph(f"₹ {invoice.paid_amount:,.2f}", cell_regular)])
        if invoice.balance_amount > 0:
            summary_rows.append([Paragraph("<b>Balance Due:</b>", cell_bold), Paragraph(f"<b>₹ {invoice.balance_amount:,.2f}</b>", cell_bold)])

        sm_table = Table(summary_rows, colWidths=[100, 106])
        sm_table.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LINEBELOW', (0, -2), (1, -2), 0.5, primary_color),
        ]))
        story.append(sm_table)

        if getattr(settings, "template_80mm_show_qr", True) and getattr(settings, "show_qr", True) and getattr(settings, "upi_id", None):
            qr_draw = get_upi_qr_drawing(settings.upi_id, getattr(settings, "upi_payee_name", settings.store_name), invoice.total_amount, invoice.invoice_number, size=65)
            if qr_draw:
                story.append(Spacer(1, 4))
                qr_cell = Table([
                    [qr_draw],
                    [Paragraph(f"<b>Scan UPI to Pay ₹{invoice.total_amount:,.2f}</b>", ParagraphStyle('QR80', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7, leading=9, alignment=1, textColor=slate_dark))],
                    [Paragraph(f"UPI ID: {settings.upi_id}", ParagraphStyle('QRS80', parent=styles['Normal'], fontName='Helvetica', fontSize=6, leading=8, alignment=1, textColor=slate_muted))]
                ], colWidths=[printable_w])
                qr_cell.setStyle(TableStyle([
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('TOPPADDING', (0,0), (-1,-1), 1),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 1),
                ]))
                story.append(qr_cell)

        story.append(Spacer(1, 6))
        story.append(Paragraph(footer_text, ParagraphStyle('F80', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=9, alignment=1, textColor=slate_muted)))

    # ==========================
    # A4 Full Sheet Standard Invoice
    # ==========================
    else:
        # Header Table: Store Info on Left, Invoice Details on Right
        store_info_text = f"""
        <b><font size="14" color="#4338ca">{settings.store_name}</font></b><br/>
        <font size="9" color="#565e74">{settings.branch_name}</font><br/>
        <font size="8" color="#565e74">{settings.address}</font><br/>
        <font size="8" color="#565e74">Phone: {settings.phone} | Email: {settings.email}</font>
        """

        invoice_meta_text = f"""
        <b><font size="13" color="#0b1c30">{header_text}</font></b><br/>
        <b>Invoice No:</b> <font color="#4338ca"><b>{invoice.invoice_number}</b></font><br/>
        <b>Date:</b> {invoice.created_at.strftime('%d-%b-%Y %I:%M %p')}<br/>
        <b>Payment Mode:</b> {invoice.payment_mode} ({invoice.payment_status})
        """

        header_table = Table(
            [
                [Paragraph(store_info_text, styles['Normal']), Paragraph(invoice_meta_text, styles['Normal'])]
            ],
            colWidths=[320, 203]
        )
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(header_table)
        story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=4, spaceAfter=12))

        # Bill To / Customer Details
        customer_info_text = f"""
        <b>Billed To:</b><br/>
        <font size="10" color="#0b1c30"><b>{invoice.customer_name}</b></font><br/>
        <font size="8" color="#565e74">Phone: {invoice.customer_phone or 'N/A'}</font>
        """
        if invoice.shop:
            customer_info_text += f"<br/><font size=\"8\" color=\"#565e74\">Shop: {invoice.shop.name}</font>"

        cust_table = Table([[Paragraph(customer_info_text, styles['Normal'])]], colWidths=[523])
        cust_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), light_bg),
            ('BOX', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(cust_table)
        story.append(Spacer(1, 14))

        # Line Items Table (NO GST COLUMNS - purely selling price & discount)
        # Columns: # (25) | Item Description & SKU (228) | Pack (65) | Qty (55) | Selling Rate (75) | Discount (75)
        table_data = [
            [
                Paragraph("<b>#</b>", cell_bold),
                Paragraph("<b>Item Description & SKU</b>", cell_bold),
                Paragraph("<b>Pack Size</b>", cell_bold),
                Paragraph("<b>Quantity</b>", cell_bold),
                Paragraph("<b>Rate (₹)</b>", cell_bold),
                Paragraph("<b>Disc (₹)</b>", cell_bold),
                Paragraph("<b>Total (₹)</b>", cell_bold),
            ]
        ]

        for idx, item in enumerate(invoice.items, start=1):
            item_title = f"<b>{item.product_name}</b><br/><font color='#565e74' size='7'>{item.sku}</font>"
            item_disc = getattr(item, "discount_amount", 0.0) or 0.0
            table_data.append([
                Paragraph(str(idx), cell_regular),
                Paragraph(item_title, cell_regular),
                Paragraph(item.pack_size or "1 unit", cell_regular),
                Paragraph(f"{item.quantity:.1f} {item.unit}", cell_regular),
                Paragraph(f"{item.unit_rate:.2f}", cell_regular),
                Paragraph(f"{item_disc:.2f}", cell_regular),
                Paragraph(f"{item.total_amount:.2f}", cell_bold),
            ])

        items_table = Table(table_data, colWidths=[25, 203, 65, 55, 60, 55, 60])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), light_bg),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(items_table)
        story.append(Spacer(1, 14))

        # Totals Summary (NO GST / TAX ROW)
        totals_data = [
            [Paragraph("<b>Subtotal:</b>", cell_regular), Paragraph(f"₹ {invoice.subtotal:,.2f}", cell_bold)],
        ]
        if invoice.discount_amount > 0:
            totals_data.append([Paragraph("<b>Discount:</b>", cell_regular), Paragraph(f"- ₹ {invoice.discount_amount:,.2f}", cell_regular)])
        totals_data.extend([
            [Paragraph("<b>Grand Total:</b>", cell_bold), Paragraph(f"<b><font size='11' color='#4338ca'>₹ {invoice.total_amount:,.2f}</font></b>", cell_bold)],
            [Paragraph("<b>Amount Paid:</b>", cell_regular), Paragraph(f"₹ {invoice.paid_amount:,.2f}", cell_regular)],
            [Paragraph("<b>Balance Due:</b>", cell_bold), Paragraph(f"₹ {invoice.balance_amount:,.2f}", cell_bold)],
        ])

        totals_table = Table(totals_data, colWidths=[120, 100])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LINEBELOW', (0, -3), (1, -3), 1, primary_color),
        ]))

        left_cell_content = [
            Paragraph(f"<b>Payment Mode:</b> {invoice.payment_mode}<br/><b>Status:</b> {invoice.payment_status}<br/><b>UPI ID:</b> {settings.upi_id or 'N/A'}", cell_muted)
        ]

        if getattr(settings, "template_a4_show_qr", True) and getattr(settings, "show_qr", True) and getattr(settings, "upi_id", None):
            qr_draw = get_upi_qr_drawing(settings.upi_id, getattr(settings, "upi_payee_name", settings.store_name), invoice.total_amount, invoice.invoice_number, size=70)
            if qr_draw:
                pay_text = f"<b>Scan to Pay Exact Amount:</b><br/>₹ {invoice.total_amount:,.2f}<br/><font color='#565e74' size='7'>Payee: {getattr(settings, 'upi_payee_name', settings.store_name)}</font>"
                left_table = Table([[qr_draw, Paragraph(pay_text, cell_regular)]], colWidths=[76, 224])
                left_table.setStyle(TableStyle([
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('TOPPADDING', (0,0), (-1,-1), 0),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ]))
                left_cell_content.append(Spacer(1, 6))
                left_cell_content.append(left_table)

        summary_container = Table(
            [
                [
                    left_cell_content,
                    totals_table
                ]
            ],
            colWidths=[303, 220]
        )
        summary_container.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(summary_container)
        story.append(Spacer(1, 16))

        # Terms & Footer
        terms_raw = settings.terms_and_conditions or "1. Goods once sold will not be returned without original invoice."
        terms_text = f"<b>Terms & Conditions:</b><br/>{terms_raw.replace(chr(10), '<br/>')}"
        story.append(Paragraph(terms_text, cell_muted))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=4, spaceAfter=8))
        story.append(Paragraph(f"<font color='#565e74' size='8'>{footer_text}</font>", ParagraphStyle('Footer', parent=styles['Normal'], alignment=1)))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


def generate_profit_report_pdf(invoice: Invoice, settings: SystemSettings, format_name: str = "a4") -> bytes:
    """
    Generates confidential internal profitability audit statement for an invoice.
    EXACT FORMULAS:
    - Profit/Unit = Selling Rate - Purchase Rate
    - Total Item Profit = Profit/Unit * Quantity - Item Discount
    - Net Invoice Profit = sum of item profits
    Shows: Purchase Rate, Selling Rate, Quantity, Item Profit, Discount, Net Profit.
    """
    buffer = io.BytesIO()
    fmt = (format_name or "a4").lower()
    pagesize, margin = get_format_dimensions(fmt, len(invoice.items))

    doc = SimpleDocTemplate(
        buffer,
        pagesize=pagesize,
        rightMargin=margin,
        leftMargin=margin,
        topMargin=margin,
        bottomMargin=margin,
        pageCompression=0
    )

    styles = getSampleStyleSheet()
    primary_color = colors.HexColor("#0f766e") # Teal green for profit audit
    danger_color = colors.HexColor("#b91c1c")
    slate_dark = colors.HexColor("#0f172a")
    slate_muted = colors.HexColor("#64748b")
    border_color = colors.HexColor("#cbd5e1")
    light_bg = colors.HexColor("#f0fdf4")

    cell_bold = ParagraphStyle(
        'ProfitBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=slate_dark,
    )
    cell_regular = ParagraphStyle(
        'ProfitRegular',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=slate_dark,
    )
    cell_green = ParagraphStyle(
        'ProfitGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=primary_color,
    )

    story = []

    # Title & Confidential Notice
    story.append(Paragraph(
        f"<b><font size='13' color='#0f766e'>INTERNAL AUDIT: PROFITABILITY STATEMENT</font></b><br/>"
        f"<font size='8' color='#b91c1c'><b>STRICTLY CONFIDENTIAL — NOT FOR CUSTOMER DISTRIBUTION</b></font>",
        styles['Normal']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=8))

    # Meta info
    meta_info = f"""
    <b>Invoice #:</b> {invoice.invoice_number} &nbsp;|&nbsp; 
    <b>Date:</b> {invoice.created_at.strftime('%d-%b-%Y %I:%M %p')} &nbsp;|&nbsp; 
    <b>Customer:</b> {invoice.customer_name} {f'({invoice.shop.name})' if invoice.shop else ''}
    """
    story.append(Paragraph(meta_info, cell_regular))
    story.append(Spacer(1, 10))

    # Profit Table
    # Columns: # | Product SKU & Name | Qty | Landed Cost | Selling Rate | Profit/Unit | Disc | Total Profit
    table_data = [
        [
            Paragraph("<b>#</b>", cell_bold),
            Paragraph("<b>Product & SKU</b>", cell_bold),
            Paragraph("<b>Qty</b>", cell_bold),
            Paragraph("<b>Cost Rate (₹)</b>", cell_bold),
            Paragraph("<b>Selling Rate (₹)</b>", cell_bold),
            Paragraph("<b>Profit/Unit (₹)</b>", cell_bold),
            Paragraph("<b>Disc (₹)</b>", cell_bold),
            Paragraph("<b>Net Profit (₹)</b>", cell_bold),
        ]
    ]

    total_cogs = 0.0
    total_revenue = 0.0
    total_net_profit = 0.0

    for idx, item in enumerate(invoice.items, start=1):
        unit_cost = getattr(item, "landed_cost", getattr(item, "unit_cost", 0.0)) or 0.0
        unit_rate = getattr(item, "unit_rate", 0.0) or 0.0
        unit_profit = unit_rate - unit_cost
        item_revenue = unit_rate * item.quantity
        item_cost = unit_cost * item.quantity
        item_disc = getattr(item, "discount_amount", 0.0) or 0.0
        item_net_profit = (unit_profit * item.quantity) - item_disc

        total_cogs += item_cost
        total_revenue += item.total_amount
        total_net_profit += item_net_profit

        table_data.append([
            Paragraph(str(idx), cell_regular),
            Paragraph(f"<b>{item.product_name}</b><br/><font size='6' color='#64748b'>{item.sku}</font>", cell_regular),
            Paragraph(f"{item.quantity:g} {item.unit}", cell_regular),
            Paragraph(f"{unit_cost:,.2f}", cell_regular),
            Paragraph(f"{unit_rate:,.2f}", cell_regular),
            Paragraph(f"{unit_profit:,.2f}", cell_green),
            Paragraph(f"{item_disc:,.2f}", cell_regular),
            Paragraph(f"<b>{item_net_profit:,.2f}</b>", cell_green),
        ])

    col_widths = [20, 163, 45, 55, 60, 60, 55, 65] if fmt == "a4" else [15, 65, 25, 25, 25, 25, 20, 26]
    profit_table = Table(table_data, colWidths=col_widths)
    profit_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ALIGN', (2,0), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(profit_table)
    story.append(Spacer(1, 12))

    # Profit Summary Box
    margin_pct = round((total_net_profit / total_revenue * 100), 2) if total_revenue > 0 else 0.0

    summary_data = [
        [Paragraph("<b>Total Revenue (Gross - Disc):</b>", cell_regular), Paragraph(f"₹ {total_revenue:,.2f}", cell_bold)],
        [Paragraph("<b>Total Cost of Goods Sold (COGS):</b>", cell_regular), Paragraph(f"₹ {total_cogs:,.2f}", cell_regular)],
        [Paragraph("<b>Net Invoice Profit:</b>", cell_bold), Paragraph(f"<b><font size='10' color='#0f766e'>₹ {total_net_profit:,.2f}</font></b>", cell_green)],
        [Paragraph("<b>Net Profit Margin:</b>", cell_bold), Paragraph(f"<b><font size='10' color='#0f766e'>{margin_pct}%</font></b>", cell_green)],
    ]
    summary_table = Table(summary_data, colWidths=[200, 120])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, primary_color),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(summary_table)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
