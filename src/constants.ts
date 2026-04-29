const default_title: string = "SCOT 4.6"
const default_incident_summary: string = "<table><tbody><tr><th>Description</th><td><i>Place description of the incident here</i></td></tr>\
<tr><th>Related Indicators</th><td><i>Place IOCs here</i></td></tr>\
<tr><th>Source Details</th><td><i>Place wource port, ip, protocol, etc. here</i></td></tr>\
<tr><th>Compromised System Details</th><td><i>Place details about compromised system here</i></td></tr>\
<tr><th>Recovery/Mitigation Actions</th><td><i>Place recovery/mitigation details here</i></td></tr>\
<tr><th>Physical Location of System</th><td><i>Place the city and state of system location</i></td></tr>\
<tr><th>Detection Details</th><td><i>Place source, methods, or tools used to identify incident</i></td></tr></tbody></table>"
const plain_alert_columns: Array<string> = ["_raw", "search", "columns"]

export {
    default_title,
    default_incident_summary,
    plain_alert_columns
}