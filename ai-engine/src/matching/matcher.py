"""
Multi-Factor Transparent Lawyer Matching Engine
Computes match scores (30/25/15/10/10/10 weighting) and transparent itemized explanation breakdowns
"""

from typing import Dict, List, Any

class LawyerMatcher:
    # Exact specification weights:
    WEIGHT_PRACTICE_AREA = 0.30
    WEIGHT_EXPERIENCE = 0.25
    WEIGHT_LOCATION = 0.15
    WEIGHT_LANGUAGE = 0.10
    WEIGHT_BUDGET = 0.10
    WEIGHT_AVAILABILITY = 0.10

    @classmethod
    def score_candidate(cls, lawyer: Dict[str, Any], case_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scores a single lawyer against a case profile and returns match score + transparent explanation
        """
        explanation_items = []
        scores = {}

        # 1. Practice Area Match (30%)
        case_category = case_profile.get("category", "").lower()
        case_issue = case_profile.get("issue", "").lower()
        practice_areas = [p.lower() for p in lawyer.get("practiceAreas", [])]
        
        practice_match = False
        for pa in practice_areas:
            if pa in case_category or any(w in pa for w in case_category.split()) or any(w in pa for w in case_issue.split()):
                practice_match = True
                break

        if practice_match:
            scores["practiceArea"] = 30.0
            explanation_items.append({
                "factor": "Practice Area",
                "points": 30,
                "maxPoints": 30,
                "label": f"Specialized in {case_profile.get('category', 'Required Field')}",
                "matched": True
            })
        else:
            scores["practiceArea"] = 10.0
            explanation_items.append({
                "factor": "Practice Area",
                "points": 10,
                "maxPoints": 30,
                "label": "General practice background (partial match)",
                "matched": False
            })

        # 2. Relevant Experience (25%)
        exp_years = lawyer.get("experienceYears", 1)
        if exp_years >= 8:
            exp_pts = 25.0
            exp_desc = f"{exp_years}+ Years of Legal Experience"
        elif exp_years >= 4:
            exp_pts = 20.0
            exp_desc = f"{exp_years} Years of Practice Experience"
        else:
            exp_pts = 14.0
            exp_desc = f"{exp_years} Years of Early Career Practice"

        scores["experience"] = exp_pts
        explanation_items.append({
            "factor": "Relevant Experience",
            "points": exp_pts,
            "maxPoints": 25,
            "label": exp_desc,
            "matched": exp_pts >= 20.0
        })

        # 3. Location / Court Jurisdiction (15%)
        case_location = case_profile.get("jurisdiction", "").lower()
        lawyer_city = lawyer.get("location", {}).get("city", "").lower() if isinstance(lawyer.get("location"), dict) else str(lawyer.get("location", "")).lower()
        
        if case_location and (case_location in lawyer_city or lawyer_city in case_location):
            scores["location"] = 15.0
            explanation_items.append({
                "factor": "Location & Jurisdiction",
                "points": 15,
                "maxPoints": 15,
                "label": f"Local Court Jurisdiction ({lawyer_city.title()})",
                "matched": True
            })
        else:
            scores["location"] = 8.0
            explanation_items.append({
                "factor": "Location & Jurisdiction",
                "points": 8,
                "maxPoints": 15,
                "label": "National / Cross-Jurisdiction Virtual Practice",
                "matched": False
            })

        # 4. Language Match (10%)
        case_lang = case_profile.get("language", "English").lower()
        lawyer_langs = [l.lower() for l in lawyer.get("languages", ["English", "Hindi"])]
        
        if case_lang in lawyer_langs or "english" in lawyer_langs:
            scores["language"] = 10.0
            explanation_items.append({
                "factor": "Language Compatibility",
                "points": 10,
                "maxPoints": 10,
                "label": f"Fluent in {', '.join(lawyer.get('languages', ['English', 'Hindi']))}",
                "matched": True
            })
        else:
            scores["language"] = 5.0
            explanation_items.append({
                "factor": "Language Compatibility",
                "points": 5,
                "maxPoints": 10,
                "label": "Primary language support available",
                "matched": False
            })

        # 5. Budget / Fee Structure (10%)
        case_amount = case_profile.get("financialDetails", {}).get("disputedAmount", 0)
        is_pro_bono = lawyer.get("proBonoAvailable", True)
        
        if is_pro_bono or case_amount > 50000:
            scores["budget"] = 10.0
            explanation_items.append({
                "factor": "Budget Fit",
                "points": 10,
                "maxPoints": 10,
                "label": "Fee model aligns with claim quantum / Pro Bono support",
                "matched": True
            })
        else:
            scores["budget"] = 7.0
            explanation_items.append({
                "factor": "Budget Fit",
                "points": 7,
                "maxPoints": 10,
                "label": "Standard consultation fee model",
                "matched": False
            })

        # 6. Current Availability (10%)
        is_available = lawyer.get("isAvailable", True)
        if is_available:
            scores["availability"] = 10.0
            explanation_items.append({
                "factor": "Availability",
                "points": 10,
                "maxPoints": 10,
                "label": "Available for immediate case intake",
                "matched": True
            })
        else:
            scores["availability"] = 3.0
            explanation_items.append({
                "factor": "Availability",
                "points": 3,
                "maxPoints": 10,
                "label": "Limited consultation slots this week",
                "matched": False
            })

        total_score = sum(scores.values())

        return {
            "lawyerId": lawyer.get("id") or lawyer.get("_id"),
            "fullName": lawyer.get("fullName") or lawyer.get("user", {}).get("email", "Advocate"),
            "matchScore": round(total_score, 1),
            "matchPercentage": int(round(total_score)),
            "isVerified": lawyer.get("verificationStatus") == "VERIFIED" or lawyer.get("isVerified", False),
            "practiceAreas": lawyer.get("practiceAreas", []),
            "location": lawyer.get("location"),
            "experienceYears": exp_years,
            "explanationBreakdown": explanation_items,
            "summaryExplanation": f"{int(round(total_score))}% Match based on {case_profile.get('category', 'case')} practice area and local court experience.",
        }

    @classmethod
    def match_lawyers(cls, lawyers: List[Dict[str, Any]], case_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        scored = []
        for l in lawyers:
            scored.append(cls.score_candidate(l, case_profile))

        # Sort descending by match percentage and experience
        scored.sort(key=lambda x: (x["matchScore"], x["isVerified"]), reverse=True)
        return scored
