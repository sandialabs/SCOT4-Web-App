export const fieldNames: Record<string, string> = {
    "type": "Incident Type",
    "threat_vector": "Threat Vectors",
    "sensitivity": "Incident Sensitivity",
    "information_impact": "Information Impact",
    "recoverability": "Recoverability",
    "occurred": "Date/Time Occurred",
    "cia": "Confidentiality/Integrity/Availability",
    "functional_impact": "Functional Impact",
    "assistance": "External Assistance Requested",
    "category": "Incident Category",
    "security_category": "Incident Security Category",
    "discovered": "Date/Time Discovered",
    "closed": "Date/Time Closed",
    "reported": "Date/Time Reported"
}
export const incidentChoices: any = {
    "type": [
        "NONE",
        "FYI",
        "Type 1 : Root Compromise",
        "Type 1 : User Compromise",
        "Type 1 : Loss/Theft/Missing Desktop",
        "Type 1 : Loss/Theft/Missing Laptop",
        "Type 1 : Loss/Theft/Missing Media",
        "Type 1 : Loss/Theft/Missing Other",
        "Type 1 : Malicious Code Trojan",
        "Type 1 : Malicious Code Virus",
        "Type 1 : Malicious Code Worm",
        "Type 1 : Web Site Defacement",
        "Type 1 : Denial of Service",
        "Type 1 : Critical Infrastructure Protection",
        "Type 1 : Unauthorized Use",
        "Type 1 : Information Compromise",
        "Type 2 : Attempted Intrusion",
        "Type 2 : Reconnaissance Activity"
    ],
    "category": ["NONE", "IMI-1", "IMI-2", "IMI-3", "IMI-4"],
    "sensitivity": ["NONE", "OUO", "PII", "SUI", "UCNI", "Other"],
    "security_category": ["NONE", "Low", "Moderate", "High"],
    "critical_infrastructure": ["NO", "Yes"]
}
export const incidentChoicesV2: any = {
    "type": [
        "NONE",
        "Malicious Code",
        "Loss, Theft, or Missing",
        "PII", "Phishing",
        "Attempted Intrusion",
        "Classified Spillage",
        "Denial of Service",
        "Compromise or Intrusion",
        "Unauthorized Use"
    ],
    "threat_vector": [
        "OTHER",
        "Attrition",
        "Web",
        "Email",
        "External Removable Media",
        "Impersonation",
        "Improper Use",
        "Loss or Theft",
        "Unknown"
    ],
    "sensitivity": ["NONE", "OUO", "PII", "SUI", "UCNI", "Other"],
    "functional_impact": ["NONE", "HIGH", "MEDIUM", "LOW"],
    "information_impact": ["NONE", "Classified", "Proprietary", "Privacy", "Integrity"],
    "recoverability": [
        "NONE",
        "Regular",
        "Supplemented",
        "Extended",
        "not recoverable",
        "not applicable",
        "none"
    ],
    "assistance": ["no", "yes"]
}
export const ciaChoices = ["Confidentiality", "Integrity", "Availability"]
export const v1Fields = ["type", "category", "sensitivity", "security_category", "critical_infrastructure"]
export const v2Fields = ["type", "threat_vector", "sensitivity", "functional_impact", "information_impact", "recoverability", "assistance"]
