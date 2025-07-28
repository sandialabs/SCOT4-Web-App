

export interface TeamState {
    calendarEvents:Array<any>
    currentIH: Array<any>
    usernames: Array<string>
    globalSettings: Settings
    entityClassesList: Array<any>
    auditEntries: Array<Audit>
    totalAuditCount: number
    gameResults: Array<any>
    metricResults: Array<any>
    specialMetric: Array<any>
    userActivity: any
}

export interface Settings {
    site_name: string
    environment_level: string
    it_contact: string | null
    time_zone: string | null
    default_permissions: any
}

export interface Audit {
    id: number,
    when_date: Date,
    username: string | null,
    what: string,
    thing_type: string | null,
    thing_id: number | null,
    src_ip: string | null,
    user_agent: string | null,
    audit_data_ver: string | null,
    audit_data: any
}

export interface Popularity {
    id: number,
    target_type: string,
    target_id: number,
    metric_type: string,
    created: Date,
    modified: Date,
}