"""
Legal Knowledge Base & RAG Retrieval Benchmark Script
Evaluates Domain Classification, Recall@K, Exact Section Grounding, and Citation Validity
"""

import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai-engine")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.rag_service import LegalRAGService
from src.domain_classifier import LegalDomainClassifier

# Comprehensive Legal Test Set across 5 Domains
BENCHMARK_SCENARIOS = [
    # 1. Employment & Labour
    {
        "query": "My employer did not pay salary for last 3 months and stopped responding to emails",
        "expectedDomain": "Employment & Labour Law",
        "expectedAct": "Payment of Wages",
        "expectedSection": "Section 15"
    },
    {
        "query": "Full and final settlement not cleared after resignation 45 days ago",
        "expectedDomain": "Employment & Labour Law",
        "expectedAct": "Payment of Wages",
        "expectedSection": "Section 5"
    },
    {
        "query": "Company terminated me without giving 1 month notice or retrenchment compensation",
        "expectedDomain": "Employment & Labour Law",
        "expectedAct": "Industrial Disputes",
        "expectedSection": "Section 25F"
    },
    {
        "query": "Woman employee fired during maternity leave absence in 7th month",
        "expectedDomain": "Employment & Labour Law",
        "expectedAct": "Maternity Benefit",
        "expectedSection": "Section 12"
    },
    {
        "query": "Section 15 Payment of Wages Act recovery petition procedure",
        "expectedDomain": "Employment & Labour Law",
        "expectedAct": "Payment of Wages",
        "expectedSection": "Section 15"
    },

    # 2. Consumer Protection
    {
        "query": "Bought a refrigerator on Amazon which stopped working in 2 weeks and seller refuses warranty refund",
        "expectedDomain": "Consumer Protection Law",
        "expectedAct": "Consumer Protection",
        "expectedSection": "Section 2(11)"
    },
    {
        "query": "E-commerce platform refused return for counterfeit shoes delivered instead of original brand",
        "expectedDomain": "Consumer Protection Law",
        "expectedAct": "Consumer Protection",
        "expectedSection": "Section 2(47)"
    },
    {
        "query": "How to file an electronic consumer complaint on e-Daakhil portal under Section 35",
        "expectedDomain": "Consumer Protection Law",
        "expectedAct": "Consumer Protection",
        "expectedSection": "Section 35"
    },
    {
        "query": "District Commission order for refund and compensation for mental harassment",
        "expectedDomain": "Consumer Protection Law",
        "expectedAct": "Consumer Protection",
        "expectedSection": "Section 39"
    },
    {
        "query": "Limitation period time limit to file consumer court complaint",
        "expectedDomain": "Consumer Protection Law",
        "expectedAct": "Consumer Protection",
        "expectedSection": "Section 69"
    },

    # 3. Landlord & Tenant
    {
        "query": "Landlord refusing to refund 2 months security deposit after vacating flat in clean condition",
        "expectedDomain": "Landlord & Tenant / Rental Law",
        "expectedAct": "Model Tenancy",
        "expectedSection": "Section 10"
    },
    {
        "query": "Landlord cut electricity and water supply to forcefully evict tenant",
        "expectedDomain": "Landlord & Tenant / Rental Law",
        "expectedAct": "Model Tenancy",
        "expectedSection": "Section 14"
    },
    {
        "query": "Landlord threatened arbitrary eviction without 15 days written notice to quit",
        "expectedDomain": "Landlord & Tenant / Rental Law",
        "expectedAct": "Transfer of Property",
        "expectedSection": "Section 106"
    },
    {
        "query": "मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा 50000 रुपये",
        "expectedDomain": "Landlord & Tenant / Rental Law",
        "expectedAct": "Model Tenancy",
        "expectedSection": "Section 10"
    },

    # 4. Cybercrime & Privacy
    {
        "query": "Lost 75000 in online UPI phishing scam after fake bank KYC phone call",
        "expectedDomain": "Cybercrime & Data Privacy",
        "expectedAct": "Information Technology",
        "expectedSection": "Section 66D"
    },
    {
        "query": "Someone hacked Instagram account, stole password and blackmailed with morphed photos",
        "expectedDomain": "Cybercrime & Data Privacy",
        "expectedAct": "Information Technology",
        "expectedSection": "Section 66C"
    },
    {
        "query": "Bank database breached and customer financial details leaked online",
        "expectedDomain": "Cybercrime & Data Privacy",
        "expectedAct": "Information Technology",
        "expectedSection": "Section 43A"
    },
    {
        "query": "1930 cyber fraud helpline golden hour account freeze process",
        "expectedDomain": "Cybercrime & Data Privacy",
        "expectedAct": "Government Grievance",
        "expectedSection": "1930"
    },

    # 5. Civil Law & Legal Aid
    {
        "query": "Dispossessed from ancestral land plot without legal due process",
        "expectedDomain": "Civil Law & Legal Aid",
        "expectedAct": "Specific Relief",
        "expectedSection": "Section 6"
    },
    {
        "query": "Need free legal aid advocate from DLSA because annual income is below 2 lakhs",
        "expectedDomain": "Civil Law & Legal Aid",
        "expectedAct": "Legal Services",
        "expectedSection": "Section 12"
    }
]

def run_benchmark():
    print("===============================================================")
    print("      NYAYA SETU -- LEGAL RETRIEVAL & RAG BENCHMARK EVAL      ")
    print("===============================================================\n")

    rag = LegalRAGService()

    total = len(BENCHMARK_SCENARIOS)
    domain_correct = 0
    act_retrieved = 0
    section_retrieved = 0
    citation_valid_count = 0

    start_time = time.time()

    for idx, item in enumerate(BENCHMARK_SCENARIOS, 1):
        q = item["query"]
        exp_domain = item["expectedDomain"]
        exp_act = item["expectedAct"]
        exp_sec = item["expectedSection"]

        res = rag.conduct_research(q)
        det_domain = res.get("detectedDomain")
        provisions = res.get("legalBasis", [])

        # Check domain
        is_dom_correct = (det_domain == exp_domain)
        if is_dom_correct:
            domain_correct += 1

        # Check target act retrieved in top 3
        acts_in_top = [p.get("act", "") for p in provisions[:3]]
        is_act_ret = any(exp_act.lower() in a.lower() for a in acts_in_top)
        if is_act_ret:
            act_retrieved += 1

        # Check target section retrieved in top 3
        sections_in_top = [p.get("section", "") for p in provisions[:3]]
        is_sec_ret = any(exp_sec.lower() in s.lower() for s in sections_in_top)
        if is_sec_ret:
            section_retrieved += 1

        # Check citation verification
        if provisions:
            top_prov = provisions[0]
            verif = rag.verifier.verify_citation(top_prov.get("act"), top_prov.get("section"))
            if verif.get("valid"):
                citation_valid_count += 1

        safe_q = q[:45].encode("ascii", "replace").decode("ascii")
        status_flag = "[PASS]" if (is_dom_correct and is_act_ret) else "[WARN]"
        print(f"{status_flag} Q{idx:02d}: \"{safe_q}...\"")
        print(f"       Domain: {det_domain} | Target Act: {is_act_ret} | Section: {is_sec_ret}")

    elapsed = time.time() - start_time
    dom_acc = (domain_correct / total) * 100
    act_recall = (act_retrieved / total) * 100
    sec_recall = (section_retrieved / total) * 100
    cit_validity = (citation_valid_count / total) * 100

    print("\n===============================================================")
    print("                     BENCHMARK SUMMARY RESULTS                 ")
    print("===============================================================")
    print(f" Total Scenarios Evaluated:       {total}")
    print(f" Domain Detection Accuracy:       {dom_acc:.1f}% ({domain_correct}/{total})")
    print(f" Statutory Act Recall@3:          {act_recall:.1f}% ({act_retrieved}/{total})")
    print(f" Exact Section Precision@3:       {sec_recall:.1f}% ({section_retrieved}/{total})")
    print(f" Citation Grounding & Validity:   {cit_validity:.1f}% ({citation_valid_count}/{total})")
    print(f" Total Latency:                   {elapsed:.2f}s (Avg {elapsed/total*1000:.1f}ms/query)")
    print("===============================================================\n")

    if dom_acc >= 90 and act_recall >= 90:
        print("[OK] Benchmark criteria PASSED successfully!")
        return 0
    else:
        print("[FAIL] Benchmark fell below acceptable threshold.")
        return 1

if __name__ == "__main__":
    exit_code = run_benchmark()
    sys.exit(exit_code)
