import { Role } from "../user/types";
import { Audit } from "../team/types"

export enum IRElementType {
    Event = "Event",
    Alertgroup = "Alertgroup",
    Incident = "Incident",
    Intel = "Intel",
    Product = "Product",
    Dispatch = "Dispatch",
    Guide = "Guide",
    Alert = "Alert",
    Signature = "Signature",
    ThreatModelItem = "ThreatModelItem",
    Link = "Link",
    Entity = "Entity",
    Entry = "Entry",
    File = "File",
    Feed = "Feed",
    Pivot = "Pivot",
    EntityClass = "EntityClass",
    VulnFeed = "VulnFeed",
    VulnTrack = "VulnTrack"
}

export enum IRElementStatus {
    Open = "open",
    Closed = "closed",
    Promoted = "promoted"
}

export enum TLPCode {
    unset = 'unset',
    clear = 'clear',
    white = 'white',
    green = 'green',
    amber = 'amber',
    amber_strict = 'amber_strict',
    red = 'red'
}

export enum EntryClassEnum {
    entry = "entry",
    summary = "summary",
    action = "action",
    task = "task",
    promotion = "promotion",
}

export enum PermissionEnum {
    read = "read",
    modify = "modify",
    delete = "delete",
    admin = "admin"
}

export interface Tag {
    id: number,
    name: string,
    description?: string,
    link_count?: number
}

export interface Source {
    id: number,
    name: string,
    description?: string,
    link_count?: number
}

export interface IRElement extends Record<string, any> {
    id: number | null,
    ElementType: IRElementType | null
    elementListIndex: number,
    owner: string | null,
    status: IRElementStatus | null,
    tlp: TLPCode | null,
    subject: string | null,
    view_count?: number | null,
    entry_count?: number | null,
    created: Date | null,
    updated: Date | null,
    tags?: Array<Tag> | null,
    sources?: Array<Source> | null,
    description?: string | null,
    full_alert_data?: Array<Record<string, any>> | null,
    full_alert_data_flaired?: Array<Record<string, any>> | null,
    alert_count?: number | null,
    open_count?: number | null,
    promoted_count?: number | null,
    closed_count?: number | null,
    message_id?: string | null,
    file_count?: number | null,
    selectedAlertIds?: Array<string>,
    full_column_names?: Array<string> | null,
    full_column_types?: Array<string> | null,
    autoCompleteSources?: Array<string>,
    autoCompleteTags?: Array<string>,
    autoCompleteEntityClasses?: Array<any>,
    associated_sig_guide_map?: Record<number, Array<number>>
    linkedElements?: { [key in IRElementType]: Array<LinkedElement> }
    popularity_count?: number | null,
    popularity_voted?: string | null,
    favorite?: boolean | null,
    subscribed?: boolean | null,
}

export interface LinkedElement {
    element: IRElement,
    entries: Array<Entry>
}

export interface IRElementMeta {
    id: number | null,
    ElementType: IRElementType | null,
    owner: string | null,
    status: IRElementStatus | null,
    tlp: TLPCode | null,
    subject: string | null,
    view_count?: number | null,
    entry_count?: number | null,
    created: number | null,
    updated: number | null,
    alert_count?: number | null,
    open_count?: number | null,
    promoted_count?: number | null,
    closed_count?: number | null,
    tags?: Array<Tag> | null,
    sources?: Array<Source> | null,
    stats?: any | null,
    popularity_count?: number | null
    popularity_voted?: string | null
}

export interface IRElementsListState {
    ElementType: IRElementType | null,
    SelectedElement: IRElement | null,
    linkedEntriesChanged: boolean,
    SelectedElementEntries: Array<Entry | NewEntry>,
    SelectedElementEntities: Array<Entity>,
    SelectedElementFiles: Array<ScotFile>,
    SelectedElementHistory: Array<Audit>,
    SelectedElementAbortController: AbortController | null,
    ElementListAbortController: AbortController | null,
    ElementList: Array<IRElementMeta> | null
    SelectedElementPermissions: { [key in PermissionEnum]?: Array<Role> },
    view_count: number | null,
    totalElementListCount: number,
    loading: boolean,
    entitiesLoaded: boolean,
    numEntitiesLoading: number,
    SelectedElementFlairedEntities: Array<any>,
    flairVisible: boolean,
    flairDialog: boolean,
    flairMenuVisible: boolean,
    flairMenuX: number,
    flairMenuY: number,
    flairMenuEntity: Entity | null,
    fileDialog: boolean,
    elementPaneHeight: null | number,
    selectedElementSize: number,
    retrievingElements: boolean,
    elementListPage: number,
    elementListItemsPerPage: number,
    elementListSortBy: string | undefined,
    elementListSortDesc: boolean,
    elementListFilter: any
    flairedEnrichmentsandPivotsLoaded: any,
}

export interface Entity {
    id: number
    classes: Array<string>
    status?: string
    value?: string
    type_name?: string
    data_ver?: string
    data?: Record<string, any>
    entity_count: number
    appearances?: Array<any>
    pivots?: Array<any>
    enrichments?: Array<any>
}

export interface ScotFile {
    id: number,
    owner: string,
    filename: string,
    filesize: number,
    content_type: string,
    created: string,
    description?: string,
}

export interface Entry {
    id: number,
    owner: string,
    tlp: TLPCode,
    parent_entry_id: number,
    target_type: IRElementType,
    target_id: number,
    entry_class: EntryClassEnum,
    entry_data_ver: number,
    entry_data: string,
    parsed: boolean,
    created: string,
    modified: string,
    editMode: boolean | string,
    repliesExpanded?: boolean,
    collapsed?: boolean,
    childEntries: Array<Entry | NewEntry> | null | undefined,
    popularity_count?: number
    popularity_voted?: string
    favorite?: boolean
    subscribed?: boolean
}

export interface NewEntry {
    id: number,
    owner: string,
    tlp: TLPCode,
    parent_entry_id: number,
    target_type: IRElementType,
    target_id: number,
    entry_class: EntryClassEnum,
    entry_data_ver: number,
    entry_data: string,
    created: string,
    parsed: boolean,
    repliesExpanded?: boolean,
    collapsed?: boolean,
    editMode: boolean | string,
    modified: string,
    childEntries: Array<Entry | NewEntry> | null | undefined
    popularity_count?: number
    popularity_voted?: string
}

export interface Permission {
    id: number,
    role_id: number,
    target_type: IRElementType,
    target_id: number,
    permission: PermissionEnum,
}

export interface IRElementQuickButton {
    text: string,
    icon?: string,
    iconColor?: string,
    cssClass?: string,
    onClick: CallableFunction,
    args?: Array<any>,
    subActions?: Array<IRElementQuickButton>
    subActionSlider?: any
}

export interface TagSourceAppearance {
    target_type: IRElementType,
    target_id: number,
    items: Array<Tag> | Array<Source>
}
