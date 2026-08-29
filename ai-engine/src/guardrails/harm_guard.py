"""
Harm & Illegal Activity Refusal Guardrail
Detects and blocks intent, planning, or solicitation of illegal acts, crimes, fraud,
cyber attacks, violence, weapons, drugs, financial crime, harassment, and surveillance.
"""

import re
from typing import Dict, Any, List, Tuple


class HarmGuard:
    """
    Multi-category threat and unlawful query detection guardrail.
    Enforces immediate refusal when users seek help committing or facilitating crimes.
    """

    HARM_PATTERNS: List[Tuple[str, str, str]] = [
        # 1. Violence, Murder, Assault & Kidnapping
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i|do\s+i)|help\s+me|want\s+to|planning\s+to|going\s+to)\s+(?:kill|murder|assassinate|poison|strangle|slaughter|shoot|stab|lynch)\b",
            "VIOLENCE",
            "⚠️ Safety Alert: Legal Nexus strictly refuses requests involving violent crimes, murder, or physical harm. For emergency police assistance in India, dial 112."
        ),
        (
            r"(?i)\b(?:hire|find|get|employ)\s+(?:a\s+)?(?:hitman|assassin|contract\s+killer|shooter|gangster)\b",
            "VIOLENCE",
            "⚠️ Safety Alert: Solicitation of contract killers or violent actors is strictly prohibited."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i)|help\s+me|want\s+to)\s+(?:assault|attack|beat\s+up|hurt|injure|harm)\s+(?:someone|a\s+person|my|him|her|them)\b",
            "VIOLENCE",
            "⚠️ Safety Alert: Facilitating physical assault or bodily injury is strictly prohibited."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i)|plan(?:ning)?\s+to)\s+(?:kidnap|abduct|hold\s+hostage)\b",
            "VIOLENCE",
            "⚠️ Safety Alert: Inquiries regarding kidnapping or abduction are strictly prohibited."
        ),

        # 2. Self-Harm & Mental Health Crisis
        (
            r"(?i)\b(?:kill\s+myself|commit\s+suicide|end\s+my\s+life|hang\s+myself|self[- ]harm|want\s+to\s+die)\b",
            "SELF_HARM_CRISIS",
            "⚠️ Mental Health Support: If you are experiencing distress or thoughts of self-harm, free and confidential support is available in India. Call Tele-MANAS at 14416 (or 1800-891-4416) or the KIRAN Helpline at 1800-599-0019 immediately."
        ),

        # 3. Fraud, Forgery & Perjury
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i|do\s+i)|help\s+me|want\s+to|need\s+to)\s+(?:forge|fake|fabricate|falsify|counterfeit)\s+(?:[\w']+\s+)*(?:documents?|signatures?|certificates?|passports?|ids?|identit(?:y|ies)|evidence|wills?|deeds?|contracts?|bills?|invoices?|degrees?)\b",
            "FRAUD_FORGERY",
            "⚠️ Safety Alert: Legal Nexus cannot assist with forging, fabricating, or falsifying documents, signatures, or legal instruments. This platform is exclusively for lawful legal assistance."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:commit|do|carry\s+out|pull\s+off)\s+(?:fraud|scams?|identity\s+theft|insurance\s+fraud|bank\s+fraud|ponzi)\b",
            "FRAUD_FORGERY",
            "⚠️ Safety Alert: Assisting with the planning or execution of fraud or deception is strictly prohibited."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:create|make|produce)\s+(?:[\w']+\s+)*(?:fake|forged|counterfeit|fraudulent)\s+(?:[\w']+\s+)*(?:documents?|ids?|passports?|certificates?|evidence|currency|money|notes?|bills?)\b",
            "FRAUD_FORGERY",
            "⚠️ Safety Alert: Creation of counterfeit documents, identification, or currency is strictly prohibited."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:tamper\s+with|destroy|hide|suppress|alter)\s+(?:evidence|proof|records?|files?)\b",
            "EVIDENCE_TAMPERING",
            "⚠️ Safety Alert: Destruction or tampering with evidence is a criminal offense under Indian law and cannot be assisted."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:commit\s+perjury|lie\s+(?:in|under)\s+(?:court|oath|affidavit))\b",
            "PERJURY",
            "⚠️ Safety Alert: Submitting false evidence or committing perjury is prohibited under Indian procedural and penal law."
        ),

        # 4. Cybercrime, Hacking & Malware
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i|do\s+i)|help\s+me)\s+(?:hack|breach|crack|exploit|compromise)\s+(?:into\s+)?(?:[\w']+\s+)*(?:systems?|servers?|websites?|accounts?|networks?|databases?|computers?|emails?|phones?|banks?)\b",
            "CYBERCRIME",
            "⚠️ Safety Alert: Inquiries regarding unauthorized computer access, hacking, or exploiting systems are prohibited under the Information Technology Act, 2000."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:create|make|write|deploy|spread)\s+(?:a\s+)?(?:virus|malware|ransomware|trojan|worm|spyware|keylogger|rootkit|botnet)\b",
            "CYBERCRIME",
            "⚠️ Safety Alert: Development or deployment of malicious software is strictly prohibited."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:launch|execute|perform|carry\s+out)\s+(?:a\s+)?(?:ddos|denial\s+of\s+service|phishing|sql\s+injection|xss|cyber\s*attack)\b",
            "CYBERCRIME",
            "⚠️ Safety Alert: Executing cyber attacks or deceptive phishing schemes is strictly prohibited."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:steal|extract|scrape|dump)\s+(?:personal\s+)?(?:data|credentials|passwords|credit\s+cards?|bank\s+details)\b",
            "CYBERCRIME",
            "⚠️ Safety Alert: Unauthorized data theft and credential harvesting are prohibited under Indian data privacy and IT laws."
        ),

        # 5. Financial Crime, Tax Evasion & Bribery
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:launder|wash)\s+(?:money|funds|proceeds|black\s+money|cash)\b",
            "FINANCIAL_CRIME",
            "⚠️ Safety Alert: Money laundering and illicit financial structuring are prohibited under the Prevention of Money Laundering Act (PMLA)."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:evade|dodge|cheat\s+on|avoid\s+paying)\s+(?:tax|taxes|gst|income\s+tax)\b",
            "FINANCIAL_CRIME",
            "⚠️ Safety Alert: Inquiries regarding illegal tax evasion or fraudulent concealment of income cannot be fulfilled."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:bribe|pay\s+off|grease)\s+(?:a\s+)?(?:judge|officer|official|police|politician|bureaucrat|inspector)\b",
            "FINANCIAL_CRIME",
            "⚠️ Safety Alert: Bribery and corrupt solicitation are severe offenses under the Prevention of Corruption Act."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:embezzle|misappropriate|siphon)\s+(?:funds?|money|company\s+funds?)\b",
            "FINANCIAL_CRIME",
            "⚠️ Safety Alert: Embezzlement and criminal breach of trust are punishable offenses under Indian law."
        ),

        # 6. Drugs & Narcotics
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:make|manufacture|produce|cook|synthesize|grow)\s+(?:drugs|meth|cocaine|heroin|fentanyl|lsd|mdma|ecstasy)\b",
            "DRUGS",
            "⚠️ Safety Alert: Manufacturing or producing illicit narcotics is strictly prohibited under the NDPS Act."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:traffic|smuggle|distribute|sell|deal)\s+(?:drugs|narcotics|illegal\s+substances|contraband)\b",
            "DRUGS",
            "⚠️ Safety Alert: Trafficking and distribution of illicit substances are strictly prohibited under the NDPS Act."
        ),
        (
            r"(?i)\b(?:where\s+(?:to|can\s+i)|how\s+to\s+buy)\s+(?:buy|get|procure|source)\s+(?:drugs|narcotics|illegal\s+substances|cocaine|heroin|meth)\b",
            "DRUGS",
            "⚠️ Safety Alert: Procurement of prohibited narcotics is unlawful."
        ),

        # 7. Weapons & Explosives
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:make|build|construct|assemble|create)\s+(?:a\s+)?(?:bomb|explosive|ied|detonator|grenade|pipe\s+bomb)\b",
            "WEAPONS_EXPLOSIVES",
            "⚠️ Safety Alert: Manufacturing explosive devices or lethal weapons is strictly prohibited."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:get|buy|obtain|acquire|procure)\s+(?:an?\s+)?(?:illegal\s+)?(?:gun|firearm|weapon|pistol|rifle|ak-?47)\s+(?:without|illegally|black\s+market)\b",
            "WEAPONS_EXPLOSIVES",
            "⚠️ Safety Alert: Procurement of unregistered or illegal firearms is prohibited under the Arms Act."
        ),

        # 8. Harassment, Stalking & Extortion
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:stalk|track|follow|monitor)\s+(?:someone|a\s+person|my\s+(?:ex[-\s]?\w*|wife|husband|girlfriend|boyfriend|partner))\s+(?:[\w']+\s+)*(?:without|secretly|covertly)\b",
            "HARASSMENT",
            "⚠️ Safety Alert: Stalking and non-consensual surveillance are punishable offenses under Indian law."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:blackmail|extort|coerce|threaten)\s+(?:someone|a\s+person|my|him|her|them)\b",
            "HARASSMENT",
            "⚠️ Safety Alert: Blackmail and extortion are criminal offenses."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:take|get|distribute|share|post|upload)\s+(?:revenge\s+porn|intimate\s+images?|private\s+photos?)\s+(?:without\s+consent|of\s+(?:my|someone|her|him))\b",
            "HARASSMENT",
            "⚠️ Safety Alert: Non-consensual distribution of intimate images is a severe offense under the IT Act."
        ),

        # 9. Exploitation & Human Trafficking
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:traffic|smuggle|sell|trade)\s+(?:humans?|people|persons?|children|women|girls?|boys?|organs?)\b",
            "EXPLOITATION",
            "⚠️ Safety Alert: Human and child trafficking are severe criminal offenses."
        ),
        (
            r"(?i)\b(?:child)\s+(?:exploitation|pornography|abuse|trafficking)\b",
            "EXPLOITATION",
            "⚠️ Safety Alert: Any form of child abuse, exploitation, or CSAM is strictly prohibited and subject to immediate legal reporting."
        ),

        # 10. Theft, Robbery & Burglary
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:rob|burgle|steal\s+from|pickpocket|shoplift)\s+(?:a\s+)?(?:bank|store|shop|house|home|person|car|atm)\b",
            "THEFT_ROBBERY",
            "⚠️ Safety Alert: Inquiries regarding the execution of theft, robbery, or burglary cannot be fulfilled."
        ),
        (
            r"(?i)\b(?:how\s+(?:to|can\s+i))\s+(?:break\s+into|hotwire)\s+(?:a\s+)?(?:house|home|apartment|car|vehicle|safe|vault)\b",
            "THEFT_ROBBERY",
            "⚠️ Safety Alert: Inquiries regarding unlawful entry or break-ins are strictly prohibited."
        ),

        # 11. Evading Arrest & Hiding Crimes
        (
            r"(?i)\b(?:how\s+to\s+(?:hide|dispose\s+of)\s+(?:a\s+)?(?:body|corpse)|destroy\s+murder\s+evidence|evade\s+arrest\s+after\s+killing|escape\s+police\s+custody)\b",
            "CRIME_CONCEALMENT",
            "⚠️ Safety Alert: Concealing evidence or evading lawful criminal justice cannot be assisted."
        ),
    ]

    @classmethod
    def inspect(cls, text: str) -> Dict[str, Any]:
        """
        Inspects input text against all harm and unlawful action patterns.
        Returns detection status, matched category, and safety refusal message.
        """
        if not text or not isinstance(text, str):
            return {
                "is_harmful": False,
                "should_block": False,
                "category": None,
                "refusal_message": None,
            }

        for pattern, category, message in cls.HARM_PATTERNS:
            if re.search(pattern, text):
                return {
                    "is_harmful": True,
                    "should_block": True,
                    "category": category,
                    "refusal_message": message,
                }

        return {
            "is_harmful": False,
            "should_block": False,
            "category": None,
            "refusal_message": None,
        }
