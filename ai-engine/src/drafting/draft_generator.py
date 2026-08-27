"""
Smart Legal Draft Generator
Generates 7 highly structured, professional Indian legal draft documents populated with structured case facts, statutory citations, and formal legal formatting.
"""

from typing import Dict, Any
from datetime import datetime, timezone

class DraftGenerator:
    DISCLAIMER = "⚠️ AI-generated draft — requires user/professional review before submission."

    @classmethod
    def generate_draft(cls, draft_type: str, case_data: Dict[str, Any], variables: Dict[str, Any] = None) -> Dict[str, Any]:
        vars_merged = dict(variables or {})
        
        # Extract case parameters
        case_num = case_data.get("caseNumber", "NS-2026-DRAFT")
        category = case_data.get("category", "General Dispute")
        issue = case_data.get("issue", "Breach of Contract & Financial Default")
        jurisdiction = vars_merged.get("jurisdiction") or case_data.get("jurisdiction", "Delhi")
        parties = case_data.get("parties", {})
        plaintiff = vars_merged.get("plaintiffName") or parties.get("plaintiff") or "Complainant / Claimant"
        defendant = vars_merged.get("defendantName") or parties.get("employer") or parties.get("landlord") or parties.get("merchant") or parties.get("defendant") or "Opposite Party"
        defendant_org = vars_merged.get("defendantOrg") or defendant
        amount = vars_merged.get("disputedAmount") or case_data.get("financialDetails", {}).get("disputedAmount") or 0
        date_today = datetime.now(timezone.utc).strftime("%d %B, %Y")

        content = ""
        title = ""

        # 1. Statutory Legal Notice (15-Day Demand Notice)
        if draft_type in ["STATUTORY_LEGAL_NOTICE", "LEGAL_NOTICE"]:
            title = f"15-Day Statutory Legal Demand Notice — {issue}"
            content = f"""# STATUTORY LEGAL DEMAND NOTICE
**(Dispatched via Registered Post A.D. / Speed Post / Electronic Mail)**

**Date:** {date_today}  
**Legal Notice Reference:** {case_num}/LN/{datetime.now(timezone.utc).year}  
**Place of Origin:** {jurisdiction}, India

---

### PARTIES TO THE NOTICE:

**TO (OPPOSITE PARTY):**  
**{defendant}**  
{defendant_org}  
Principal Office / Residence: {jurisdiction}, India  
*(Hereinafter referred to as the "Noticee / Opposite Party")*

**FROM (SENDER / CLAIMANT):**  
**{plaintiff}**  
Through: Advocate & Legal Counsel on Record  
Chamber Address / Jurisdiction: {jurisdiction}, India  
*(Hereinafter referred to as "My Client / Claimant")*

---

### SUBJECT:
**LEGAL DEMAND NOTICE UNDER SECTIONS 73 & 74 OF THE INDIAN CONTRACT ACT, 1872 AND RELEVANT STATUTES FOR {issue.upper()} AMOUNTING TO INR {amount:,.2f}**

---

**Sir / Madam,**

Under explicit instructions and on behalf of my client, **{plaintiff}**, residing/operating at {jurisdiction}, I hereby serve upon you this formal **Statutory Legal Demand Notice**:

#### 1. FACTUAL MATRIX & BACKGROUND
1.1. That my Client entered into a binding legal and contractual relationship with you, the Noticee, at {jurisdiction}.  
1.2. That my Client duly performed and discharged all contractual obligations, duties, and covenants in good faith, with utmost diligence and professionalism.  
1.3. That as per the agreed covenants, you were legally bound to make timely disbursements and fulfill statutory obligations in favor of my Client.

#### 2. NATURE OF BREACH & CAUSE OF ACTION
2.1. That contrary to statutory mandates and contractual representations, you have committed willful default and breach of trust regarding: **{issue}**.  
2.2. That a legitimate, legally recoverable amount of **INR {amount:,.2f}** (Rupees in Words) remains wrongfully withheld and unpaid by you despite multiple written reminders and communications.  
2.3. That your persistent failure to release the said amount has caused severe financial loss, hardship, and mental distress to my Client.

#### 3. STATUTORY GROUNDING & LEGAL VIOLATIONS
3.1. That your actions constitute a clear breach of contract under Section 73 and Section 74 of the Indian Contract Act, 1872, rendering you liable for the principal claim, statutory interest, and consequential damages.  
3.2. That withholding legitimate dues without statutory cause violates fundamental principles of natural justice and fair commercial conduct.

#### 4. PEREMPTORY DEMAND & MANDATORY TIMELINE
You are hereby called upon to:
- **(a) Remit & Pay:** Transfer the entire outstanding principal sum of **INR {amount:,.2f}** to my Client's bank account within **fifteen (15) days** from receipt of this notice.
- **(b) Interest:** Pay commercial interest @ 18% per annum from the due date until the date of realization.
- **(c) Legal Costs:** Pay a sum of **INR 10,000/-** towards the costs of this legal notice.

#### 5. NOTICE OF PEREMPTORY LEGAL ACTION
Please take note that in the event of your failure to comply with the requisitions of this notice within the stipulated **15 days**, my Client has issued strict instructions to initiate:
- Appropriate Civil Suits for Recovery of Money with costs and pendente lite interest;
- Formal claims before competent Statutory Tribunals / Authorities / Consumer Commissions;
- Any applicable criminal proceedings under Indian law at your sole risk, cost, and legal consequence.

---

**Yours faithfully,**

*(Counsel for {plaintiff})*  
Advocate, High Court / District Bar Association  
{jurisdiction}, India  

---
**Enclosures & Annexures:**
1. Copy of Invoice / Engagement Contract / Relevant Proof of Debt
2. Bank Statement showing default and unpaid dues
3. Record of Prior Correspondence & Reminders

---
*{cls.DISCLAIMER}*
"""

        # 2. Consumer Forum Complaint (e-Daakhil Format)
        elif draft_type in ["CONSUMER_FORUM_COMPLAINT", "CONSUMER_COMPLAINT"]:
            title = f"Consumer Complaint Petition under Section 35 CPA 2019 — {issue}"
            content = f"""# BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION AT {jurisdiction.upper()}

**CONSUMER COMPLAINT PETITION NO. ________ OF 2026**
*(Filed Online via e-Daakhil Portal under Section 35 of the Consumer Protection Act, 2019)*

---

### IN THE MATTER OF:

**{plaintiff}**  
Residing at: {jurisdiction}, India  
Contact / Email: [Complainant Contact]  
... **COMPLAINANT**

**VERSUS**

**{defendant}**  
{defendant_org}  
Having its Office / Branch at: {jurisdiction}, India  
... **OPPOSITE PARTY**

---

### COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE, DEFECT IN GOODS, AND UNFAIR TRADE PRACTICES

---

**MOST RESPECTFULLY SHOWETH:**

#### 1. JURISDICTION & CONSUMER STATUS
1.1. That the Complainant is a 'Consumer' within the statutory definition of Section 2(7) of the Consumer Protection Act, 2019, having purchased goods / availed services from the Opposite Party against valuable consideration of **INR {amount:,.2f}**.  
1.2. That the Opposite Party carries on business and provides services within the territorial and pecuniary jurisdiction of this Hon'ble District Commission at {jurisdiction}.

#### 2. STATEMENT OF FACTS CONSTITUTING CAUSE OF ACTION
2.1. That the Complainant transacted with the Opposite Party for {issue}.  
2.2. That the Opposite Party delivered defective goods / rendered grossly deficient services in clear violation of Section 2(11) of the Act.  
2.3. That despite timely notification and submission of grievance on the National Consumer Helpline / Customer Care, the Opposite Party arbitrarily rejected the claim and refused refund / replacement.

#### 3. STATUTORY DEFICIENCY & UNFAIR TRADE PRACTICE
3.1. That the refusal to rectify the deficiency constitutes an 'Unfair Trade Practice' under Section 2(47) of the Consumer Protection Act, 2019.  
3.2. That the Complainant has suffered direct financial loss, grave harassment, and disruption of daily affairs.

---

### PRAYER / SPECIFIC RELIEFS SOUGHT:
In the premises aforesaid, the Complainant most respectfully prays that this Hon'ble Commission may graciously be pleased to:
- **(a) Order Full Refund:** Direct the Opposite Party to refund the full consideration amount of **INR {amount:,.2f}** along with interest @ 18% per annum from the date of payment.
- **(b) Compensation for Mental Agony:** Award compensation of **INR 50,000/-** towards hardship, mental agony, and deficiency in service.
- **(c) Litigation Expenses:** Award litigation costs of **INR 15,000/-** incurred in pursuing this complaint.
- **(d) General Relief:** Pass any such further orders as this Hon'ble Commission may deem just and proper in the interest of justice.

---

**COMPLAINANT**  
*(Through Advocate / In Person)*  
Date: {date_today} | Place: {jurisdiction}

---

### VERIFICATION:
I, **{plaintiff}**, the Complainant above named, do hereby verify and declare on solemn affirmation that the contents of Paragraphs 1 to 3 of the accompanying complaint are true and correct to my knowledge and based on records believed to be true. No part of it is false and nothing material has been concealed therefrom.

Verified at **{jurisdiction}** on this **{date_today}**.

**DEPONENT / COMPLAINANT**

---
*{cls.DISCLAIMER}*
"""

        # 3. Employer Wage Grievance / Section 15 Claim
        elif draft_type in ["EMPLOYER_WAGE_GRIEVANCE", "WAGE_GRIEVANCE"]:
            title = f"Statutory Claim Application under Section 15 Payment of Wages Act — {issue}"
            content = f"""# BEFORE THE AUTHORITY UNDER THE PAYMENT OF WAGES ACT, 1936 AT {jurisdiction.upper()}

**APPLICATION NO. ________ OF 2026**

---

### IN THE MATTER OF:
**{plaintiff}**  
Employed as: Workman / Employee  
Address: {jurisdiction}, India  
... **APPLICANT / EMPLOYEE**

**VERSUS**

**{defendant}**  
{defendant_org}  
Establishment Address: {jurisdiction}, India  
... **OPPOSITE PARTY / EMPLOYER**

---

### CLAIM APPLICATION UNDER SECTION 15(2) OF THE PAYMENT OF WAGES ACT, 1936 FOR RECOVERY OF UNLAWFULLY WITHHELD WAGES AND STATUTORY COMPENSATION

---

**THE APPLICANT RESPECTFULLY SUBMITS AS FOLLOWS:**

#### 1. APPLICANT EMPLOYMENT RECORD
1.1. That the Applicant was duly employed with the Opposite Party establishment at {jurisdiction}.  
1.2. That the Applicant discharged all assigned duties faithfully and maintained an unblemished service record.

#### 2. WITHHOLDING OF EARNED WAGES
2.1. That contrary to the mandatory provisions of Section 5 of the Payment of Wages Act, 1936, the Opposite Party has unlawfully withheld and failed to disburse earned wages amounting to **INR {amount:,.2f}**.  
2.2. That the deduction and non-payment does not fall under any authorized deductions enumerated under Section 7 of the Act.

#### 3. PRAYER FOR DIRECTION & STATUTORY PENALTY
The Applicant respectfully prays that this Hon'ble Authority may be pleased to:
- **(a)** Issue directions under Section 15(3) of the Act ordering the Opposite Party to pay the unpaid wages of **INR {amount:,.2f}**;
- **(b)** Award statutory compensation up to **10 times the amount withheld** as prescribed under Section 15(3) for willful default;
- **(c)** Award litigation costs and penal interest @ 18% p.a.

---

**APPLICANT / WORKMAN ({plaintiff})**  
Date: {date_today} | Place: {jurisdiction}

---
*{cls.DISCLAIMER}*
"""

        # 4. Landlord Security Deposit Refund Notice
        elif draft_type in ["LANDLORD_SECURITY_DEPOSIT_NOTICE", "RENT_NOTICE"]:
            title = f"Notice for Refund of Tenancy Security Deposit under Model Tenancy Act — {case_num}"
            content = f"""# FORMAL LEGAL NOTICE FOR REFUND OF TENANCY SECURITY DEPOSIT
**(Under Section 10 of the Model Tenancy Act, 2021 & Section 108 Transfer of Property Act, 1882)**

**Date:** {date_today}  
**Notice ID:** {case_num}/TENANCY/{datetime.now(timezone.utc).year}  

---

**TO (LANDLORD / LESSOR):**  
**{defendant}**  
Demised Premises / Owner Address: {jurisdiction}, India  

**FROM (TENANT / LESSEE):**  
**{plaintiff}**  
Former Tenant at Demised Premises  
Current Address: {jurisdiction}, India  

---

### SUBJECT:
**PEREMPTORY DEMAND FOR IMMEDIATE REFUND OF SECURITY DEPOSIT OF INR {amount:,.2f} FOR DEMISED PREMISES AT {jurisdiction.upper()}**

---

**Dear Sir / Madam,**

I hereby issue this formal notice regarding the tenancy security deposit wrongfully withheld by you:

#### 1. VACATION & HANDOVER OF PREMISES
1.1. That I had leased the residential premises from you and duly vacated the same on after serving the requisite contractual notice.  
1.2. That the physical keys and vacant possession were handed over in clean, undamaged condition with all electricity and water utility bills settled up to date.

#### 2. STATUTORY MANDATE FOR REFUND
2.1. Under Section 10 of the Model Tenancy Act, 2021, the Landlord is statutorily mandated to refund the advance security deposit of **INR {amount:,.2f}** to the tenant within the prescribed period after handover.  
2.2. That withholding the deposit under arbitrary pretexts of general wear and tear or repainting is unlawful and impermissible in law.

#### 3. FINAL 7-DAY DEMAND
You are hereby called upon to transfer the full security deposit sum of **INR {amount:,.2f}** to my designated bank account within **seven (7) days** from the receipt of this notice, failing which I shall immediately approach the **Rent Authority / Rent Court** under Section 21 of the Model Tenancy Act for recovery of the deposit with 18% per annum penal interest and damages.

---

**Sincerely,**

**{plaintiff}**  
Tenant / Claimant  
Place: {jurisdiction} | Date: {date_today}

---
*{cls.DISCLAIMER}*
"""

        # 5. Police Cyber Crime Incident Complaint
        elif draft_type in ["POLICE_CYBER_CRIME_COMPLAINT", "CYBER_COMPLAINT"]:
            title = f"Cyber Financial Fraud Complaint under Section 66D IT Act — {issue}"
            content = f"""# FORMAL COMPLAINT FOR CYBER FINANCIAL FRAUD & CHEATING BY PERSONATION
**(To the Station House Officer / Cyber Crime Police Station / National Cyber Crime Reporting Portal)**

**Date:** {date_today}  
**Jurisdiction / Police Station:** {jurisdiction}, India  
**Complaint Subject:** Financial Cyber Fraud & Online Cheating under Section 66C & 66D of Information Technology Act, 2000 & Section 318(4) Bharatiya Nyaya Sanhita (BNS) / Section 420 IPC

---

### COMPLAINANT PARTICULARS:
**Name:** {plaintiff}  
**Residence / City:** {jurisdiction}, India  
**Contact:** [Complainant Mobile / Email]

---

### ACCUSED / SUSPECT PARTICULARS:
**Name / Entity:** {defendant} ({defendant_org})  
**Beneficiary Bank Details / UPI ID / Phone:** [Transaction Suspect Records]

---

### INCIDENT DETAILS & FINANCIAL LOSS:
1. **Total Defrauded Amount:** **INR {amount:,.2f}** (Rupees in Words)  
2. **Date & Modus Operandi:** The Complainant was deceived and induced into fraudulent digital transactions involving {issue}.  
3. **National Cyber Crime Helpline (1930):** Incident reported under National Cybercrime Reporting Portal (cybercrime.gov.in) with acknowledgment receipt generated.

---

### PRAYER:
1. Register a formal First Information Report (FIR) under Section 66D IT Act and relevant provisions.  
2. Issue urgent directions to concerned nodal banks / payment gateways to freeze the beneficiary account / UPI mule handles.  
3. Investigate the money trail and initiate steps for recovery of **INR {amount:,.2f}**.

---

**COMPLAINANT**  
**{plaintiff}**  
Date: {date_today} | Place: {jurisdiction}

---
*{cls.DISCLAIMER}*
"""

        # 6. RTI Application
        elif draft_type in ["RTI_APPLICATION", "RTI"]:
            title = f"Application under Section 6(1) of the Right to Information Act, 2005"
            content = f"""# APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

**Date:** {date_today}  
**Place:** {jurisdiction}, India  

---

**TO:**  
The Public Information Officer (PIO) / Assistant PIO  
Name of Public Authority / Department: {defendant_org}  
Office Address: {jurisdiction}, India  

---

### 1. FULL NAME OF APPLICANT:
**{plaintiff}**

### 2. ADDRESS FOR CORRESPONDENCE:
{jurisdiction}, India  
Contact No. / Email: [Applicant Contact Details]

---

### 3. PARTICULARS OF INFORMATION SOUGHT:
The Applicant respectfully seeks certified information and official records concerning: **{issue}** (Claim Quantum / Value: INR {amount:,.2f}):

- **(a)** Certified copies of all file notings, official orders, and internal correspondence relating to the subject matter.
- **(b)** Action-taken reports (ATR) on representations and formal complaints submitted by the Applicant.
- **(c)** Certified copies of circulars, guidelines, and statutory provisions governing the resolution of this matter.
- **(d)** Name, designation, and contact details of the appellate authority designated under Section 19(1) of the Act.

---

### 4. APPLICATION FEE:
An application fee of **INR 10/-** is enclosed herewith via Indian Postal Order (IPO) / Demand Draft / Online Payment Gateway receipt as prescribed under RTI Rules.

### 5. DECLARATION:
I hereby state that I am a citizen of India and the information sought falls within the scope of Section 2(f) and Section 2(j) of the RTI Act, 2005.

---

**APPLICANT**  
**{plaintiff}**  
Date: {date_today} | Place: {jurisdiction}

---
*{cls.DISCLAIMER}*
"""

        # 7. Legal Information Summary
        else:
            draft_type = "LEGAL_INFORMATION_SUMMARY"
            title = f"Case Facts & Legal Strategy Summary — {case_num}"
            content = f"""# CASE INTELLIGENCE & LEGAL STRATEGY BRIEF

**Case Reference ID:** {case_num}  
**Dispute Domain:** {category}  
**Primary Issue / Cause of Action:** {issue}  
**Governing Jurisdiction:** {jurisdiction}, India  
**Disputed Financial Quantum:** INR {amount:,.2f}  
**Parties Identified:** {plaintiff} (Claimant) vs {defendant} (Opposite Party)  
**Date of Assessment:** {date_today}

---

### 1. EXECUTIVE SUMMARY OF FACTS
The Client, **{plaintiff}**, reports a significant legal dispute regarding **{issue}** involving an actionable financial quantum of **INR {amount:,.2f}** at **{jurisdiction}**.

---

### 2. APPLICABLE STATUTORY FRAMEWORK & PRECEDENTS
- **Governing Acts:** Relevant Indian statutory enactments and state rules applicable to {category}.
- **Legal Recourse:** Remedies available through statutory pre-litigation notices, consumer commissions, or labour conciliation authorities.

---

### 3. STRATEGIC PROCEDURAL ROADMAP
1. **Phase 1 — Formal Pre-Litigation Notice:** Serve a formal 15-day Statutory Demand Notice with interest claim.
2. **Phase 2 — Grievance Escalation:** Register digital grievance on designated government portals (SAMADHAN / e-Daakhil / NCH 1915).
3. **Phase 3 — Judicial Petition:** File recovery suit or petition before the competent court / commission if default continues.

---
*{cls.DISCLAIMER}*
"""

        return {
            "draftType": draft_type,
            "title": title,
            "contentMarkdown": content,
            "caseNumber": case_num,
            "generatedAt": date_today,
            "disclaimer": cls.DISCLAIMER,
            "status": "DRAFT",
        }
