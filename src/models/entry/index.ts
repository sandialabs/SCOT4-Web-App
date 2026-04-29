import { EntryClassEnum, IRElementType, TLPCode } from "@/types/irelement"


export class Entry {
    id: number;
    owner: string;
    tlp: TLPCode;
    parent_entry_id: number;
    target_type: IRElementType;
    target_id: number;
    entry_class: EntryClassEnum;
    entry_data_ver: number;
    entry_data: string;
    parsed: boolean;
    created: string;
    modified: string;
    editMode: boolean | string;
    repliesExpanded?: boolean;
    collapsed?: boolean;
    childEntries: Array<Entry> | null | undefined;
    popularity_count?: number
    popularity_voted?: string
    favorite?: boolean
    subscribed?: boolean
    constructor(
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
        childEntries?: Array<Entry> | null | undefined,
        popularity_count?: number,
        popularity_voted?: string,
        favorite?: boolean,
        subscribed?: boolean
    ) {
        this.id = id;
        this.owner = owner;
        this.parent_entry_id = parent_entry_id;
        this.target_type = target_type;
        this.target_id = target_id;
        this.entry_class = entry_class;
        this.entry_data_ver = entry_data_ver;
        this.entry_data = entry_data;
        this.parsed = parsed;
        this.created = created;
        this.modified = modified;
        this.editMode = editMode;
        this.repliesExpanded = repliesExpanded;
        this.collapsed = collapsed;
        this.childEntries = childEntries;
        this.popularity_count = popularity_count;
        this.popularity_voted = popularity_voted;
        this.favorite = favorite;
        this.subscribed = subscribed;
    }
}

export class NewEntry {
    entry_class: string;
    entry_data: any;
    owner: string;
    parent_entry_id: number | null;
    target_id: number;
    target_type: string;
    constructor(
        entry_class: string,
        entry_data: any,
        owner: string,
        parent_entry_id: number | null,
        target_id: number,
        target_type: string
    ) {
        this.entry_class = entry_class;
        this.entry_data = entry_data;
        this.owner = owner;
        this.parent_entry_id = parent_entry_id;
        this.target_id = target_id;
        this.target_type = target_type;
    }
}