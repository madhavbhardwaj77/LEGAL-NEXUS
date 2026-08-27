"""
Smart Legal Draft Generator
Generates 7 standard Indian legal draft documents populated with structured case facts and statutory citations
"""

from typing import Dict, Any
from datetime import datetime, timezone

class DraftGenerator:
    DISCLAIMER = "⚠️ AI-generated draft — requires user/professional review before submission."

    @classmethod
    def generate_draft(cls, draft_type: str, case_data: Dict[str, Any], variables: Dict[str, Any] = None) -> Dict[str, Any]:
        vars_merged = dict(variables or {})
        
        # Extract case parameters
        case_num = case_data.get("caseNumber", "NS-DRAFT")
        category = case_data.get("category", "General")
        issue = case_data.get("issue", "Legal Dispute")
        jurisdiction = case_data.get("jurisdiction", "Delhi")
        parties = case_data.get("parties", {})
        plaintiff = vars_merged.get("plaintiffName") or parties.get("plaintiff") or "Complainant / Claimant"
        defendant = vars_merged.get("defendantName") or parties.get("employer") or parties.get("landlord") or parties.get("merchant") or parties.get("defendant") or "Opposite Party"
        defendant_org = vars_merged.get("defendantOrg") or defendant
        amount = vars_merged.get("disputedAmount") or case_data.get("financialDetails", {}).get("disputedAmount") or 0
        date_today = datetime.now(timezone.utc).strftime("%d-%B-%Y")

        content = ""
        title = ""

        # 1. Statutory Legal Notice (15-Day Demand Notice)
        if draft_type in ["STATUTORY_LEGAL_NOTICE", "LEGAL_NOTICE"]:
            title = f"Statutory 15-Day Legal Demand Notice - {issue}"
            content = f"""# STATUTORY DEMAND NOTICE
*(Under Registered Post A.D. / Speed Post / Email)*

**Date:** {date_today}  
**Case Ref:** {case_num}

**TO:**  
{defendant}  
{defendant_org}  
{jurisdiction}, India

**FROM:**  
{plaintiff}  
Through Legal Representative / Advocate on Record  
{jurisdiction}, India

---

### SUBJECT: LEGAL DEMAND NOTICE UNDER INDIAN LAW FOR {issue.upper()}

Sir/Madam,

Under instructions and on behalf of my client, **{plaintiff}** (hereinafter referred to as the "Client"), I hereby serve upon you this formal Statutory Demand Notice:

1. **FACTUAL BACKGROUND:**  
   That my client was engaged in a lawful transaction / employment with you at {jurisdiction}. In the course of said dealings, you were under a legal and contractual obligation to fulfill agreed covenants and financial settlements.

2. **CAUSE OF ACTION & DEFAULT:**  
   Contrary to statutory provisions and agreed terms, you have defaulted on your obligations regarding: **{issue}**.  
   Specifically, an outstanding sum of **INR {amount:,.2f}** remains wrongfully withheld / unpaid despite repeated requests and formal communications.

3. **STATUTORY VIOLATION:**  
   Your failure to clear the legitimate dues constitutes an actionable statutory default under the applicable laws of India (including provisions for recovery of dues, interest, and penalty damages).

4. **FINAL DEMAND:**  
   You are hereby formally called upon to pay and remit the outstanding amount of **INR {amount:,.2f}** along with interest @ 18% per annum within **fifteen (15) days** from the date of receipt of this notice.

5. **LEGAL CONSEQUENCES OF NON-COMPLIANCE:**  
   Please take notice that in the event of your failure to comply within the stipulated 15-day timeline, my client has given peremptory instructions to initiate appropriate legal proceedings before the competent Court / Tribunal / Labour Authority at your sole risk, cost, and consequence.

Yours faithfully,

**Advocate on behalf of {plaintiff}**

---
*{cls.DISCLAIMER}*
"""

        # 2. Consumer Forum Complaint (e-Daakhil Format)
        elif draft_type in ["CONSUMER_FORUM_COMPLAINT", "CONSUMER_COMPLAINT"]:
            title = f"Consumer Complaint Petition under Section 35 CPA 2019 - {issue}"
            content = f"""# BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION AT {jurisdiction.upper()}

**CONSUMER COMPLAINT NO. ________ / 2026**

**IN THE MATTER OF:**

**{plaintiff}**  
Residing at: {jurisdiction}, India  
... **COMPLAINANT**

**VERSUS**

**{defendant}**  
Having office at: {jurisdiction}, India  
... **OPPOSITE PARTY**

---

### COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE AND UNFAIR TRADE PRACTICE

**MOST RESPECTFULLY SHOWETH:**

1. **JURISDICTION & STATUS:**  
   That the Complainant is a 'Consumer' within the meaning of Section 2(7) of the Consumer Protection Act, 2019, having availed goods/services from the Opposite Party for valuable consideration of INR {amount:,.2f}.

2. **FACTS CONSTITUTING CAUSE OF ACTION:**  
   That the Complainant suffered significant financial loss and mental harassment due to {issue} by the Opposite Party. The Opposite Party committed gross 'Deficiency in Service' under Section 2(11) and engaged in 'Unfair Trade Practice' under Section 2(47).

3. **PRAYER / RELIEFS SOUGHT:**  
   In view of the above facts, the Complainant respectfully prays that this Hon'ble Commission may be pleased to:
   - (a) Direct the Opposite Party to refund the full consideration amount of **INR {amount:,.2f}** along with interest @ 18% p.a.
   - (b) Award compensation of **INR 50,000/-** towards mental agony, hardship, and harassment suffered by the Complainant.
   - (c) Award litigation expenses of **INR 15,000/-** in favor of the Complainant.
   - (d) Pass any other order deemed fit and proper in the interest of justice.

**COMPLAINANT**  
Through Counsel / In Person  
Date: {date_today} | Place: {jurisdiction}

**VERIFICATION:**  
I, the Complainant above-named, do hereby verify that the contents of paragraphs 1 to 3 are true and correct to my personal knowledge. Verified at {jurisdiction} on this {date_today}.

---
*{cls.DISCLAIMER}*
"""

        # 3. Employer Wage Grievance / Section 15 Application
        elif draft_type in ["EMPLOYER_WAGE_GRIEVANCE", "WAGE_GRIEVANCE"]:
            title = f"Application under Section 15 Payment of Wages Act - {issue}"
            content = f"""# BEFORE THE AUTHORITY APPOINTED UNDER THE PAYMENT OF WAGES ACT, 1936 AT {jurisdiction.upper()}

**APPLICATION NO. ________ / 2026**

**IN THE MATTER OF:**  
**{plaintiff}** (Employee / Workman)  
Versus  
**{defendant}** (Employer / Management)

### CLAIM APPLICATION UNDER SECTION 15(2) FOR RECOVERY OF DELAYED WAGES AND STATUTORY COMPENSATION

1. **APPLICANT PARTICULARS:**  
   The Applicant was employed with the Opposite Party at their establishment in {jurisdiction}.

2. **NATURE OF CLAIM:**  
   Contrary to Section 5 of the Payment of Wages Act, 1936, the Opposite Party has unlawfully delayed and withheld earned wages amounting to **INR {amount:,.2f}**.

3. **PRAYER:**  
   The Applicant prays that this Authority issue a direction under Section 15(3) ordering payment of the delayed wages together with statutory compensation (up to 10 times the amount withheld) and costs.

Applicant: **{plaintiff}**  
Date: {date_today}

---
*{cls.DISCLAIMER}*
"""

        # 4. Landlord Security Deposit Notice
        elif draft_type in ["LANDLORD_SECURITY_DEPOSIT_NOTICE", "RENT_NOTICE"]:
            title = f"Notice for Refund of Security Deposit under Model Tenancy Act - {case_num}"
            content = f"""# FORMAL NOTICE FOR REFUND OF TENANCY SECURITY DEPOSIT
*(Under Section 10 of the Model Tenancy Act & Section 108 Transfer of Property Act)*

**Date:** {date_today}  
**To:** {defendant} (Landlord / Lessor)  
**From:** {plaintiff} (Former Tenant / Lessee)  
**Location:** {jurisdiction}

**SUBJECT: URGENT DEMAND FOR IMMEDIATE REFUND OF SECURITY DEPOSIT (INR {amount:,.2f})**

Dear Sir/Madam,

I had leased premises from you and have vacated the property in clean and tenable condition after fulfilling all monthly rent obligations.

1. Under Section 10 of the Model Tenancy Act, you are statutorily required to refund the security deposit of **INR {amount:,.2f}** upon handover.
2. Despite vacating and providing bank details, the said security deposit has not been refunded.
3. You are hereby called upon to transfer the amount of **INR {amount:,.2f}** within **seven (7) days**, failing which I shall approach the Rent Authority for recovery with 18% p.a. interest.

Sincerely,  
**{plaintiff}**

---
*{cls.DISCLAIMER}*
"""

        # 5. Police Cyber Crime Incident Complaint
        elif draft_type in ["POLICE_CYBER_CRIME_COMPLAINT", "CYBER_COMPLAINT"]:
            title = f"Cyber Financial Fraud Incident Complaint - Section 66D IT Act"
            content = f"""# COMPLAINT FOR CYBER FINANCIAL FRAUD & CHEATING BY PERSONATION
*(To Station House Officer / Cyber Crime Police Station / Portal cybercrime.gov.in)*

**Date:** {date_today}  
**Complainant:** {plaintiff} | {jurisdiction}  
**Alleged Offence:** Section 66C & 66D of Information Technology Act, 2000 & Section 420 IPC / BNS

**INCIDENT PARTICULARS:**
1. **Financial Loss:** INR {amount:,.2f}
2. **Details:** The Complainant was defrauded through unauthorized digital transactions following impersonation.
3. **1930 Helpline Reporting:** Immediate reporting initiated for transaction lien.
4. **PRAYER:** Register FIR and freeze beneficiary mule accounts.

Complainant: **{plaintiff}**

---
*{cls.DISCLAIMER}*
"""

        # 6. RTI Application
        elif draft_type in ["RTI_APPLICATION", "RTI"]:
            title = f"Application under Section 6(1) of the Right to Information Act, 2005"
            content = f"""# APPLICATION UNDER SECTION 6(1) OF THE RTI ACT, 2005

**To:**  
The Public Information Officer (PIO)  
Concerned Public Authority / Department  
{jurisdiction}, India

**1. Name of Applicant:** {plaintiff}  
**2. Address for Communication:** {jurisdiction}, India  
**3. Information Sought:**  
- (a) Certified copies of official records, file notings, and action-taken reports regarding {issue}.  
- (b) Current processing status and designated nodal officer responsible for resolution.

**4. Application Fee:** Enclosed via Postal Order / Online Payment.

Date: {date_today} | Signature: **{plaintiff}**

---
*{cls.DISCLAIMER}*
"""

        # 7. Legal Information Summary
        else:
            draft_type = "LEGAL_INFORMATION_SUMMARY"
            title = f"Case Facts & Legal Strategy Summary - {case_num}"
            content = f"""# CASE INTELLIGENCE & LEGAL STRATEGY SUMMARY

**Case Reference:** {case_num}  
**Dispute Domain:** {category}  
**Primary Issue:** {issue}  
**Jurisdiction:** {jurisdiction}  
**Financial Claim:** INR {amount:,.2f}  
**Parties:** {plaintiff} vs {defendant}  
**Prepared On:** {date_today}

### 1. SUMMARY OF RELEVANT FACTS:
Citizen reports {issue} with an outstanding disputed amount of INR {amount:,.2f} in {jurisdiction}.

### 2. RELEVANT STATUTORY FRAMEWORK:
Governed by authoritative Indian statutes and statutory dispute redressal commissions.

### 3. RECOMMENDED PROCEDURAL PATH:
1. Issue 15-day statutory demand notice.
2. File digital pre-litigation grievance before designated authority.
3. Approach competent Tribunal / Court if settlement is unfulfilled.

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
