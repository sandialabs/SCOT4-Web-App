import { IRElementType } from "../IRElements/types";

export interface UserState {
    token?: string;
    loginInProgress: boolean;
    loginExpiration: Date;
    user: User | undefined;
    userApiKeys: Array<ApiKey>;
    showQuickSettings: boolean;
    firehose: EventSource | undefined;
    firehoseReconnectTask: number | undefined,
    firehoseRequestsInProgress: Array<any>,
    searchResults: Array<any> | undefined,
    searchText: string,
    showSearchOverlay: boolean,
    notificationsRemaining: number
}

export interface Role {
    name: string
    id: number
    description: string | undefined
    auth_methods: Array<any>
    modified: string
    created: string
}

export interface User {
    id: number,
    email: string
    failed_attempts: number
    fullname: string
    is_active: boolean
    is_superuser: boolean
    last_activity: string
    last_login: string
    preferences: Record<string, any>
    username: string
    roles: Array<Role>
    notifications: Array<Notification>,
}

export enum PriorityEnum {
    High = "high",
    Medium = "medium",
    Low = "low"
}

export interface Notification {
    message: string,
    id: number,
    created: Date,
    modified: Date,
    expires: Date,
    priority: PriorityEnum,
    ack: boolean,
    ref_id: string
}

export interface ApiKey {
    key: string,
    owner: string,
    active: boolean,
    roles: Array<Role>
}

export enum UserLinksEnum {
    favorite = "favorite",
    subscription = "subscription"
}

export interface UserLinks {
    id: number,
    name?: string,
    created: Date,
    modified: Date,
    link_type: UserLinksEnum,
    target_id: number,
    target_type: string,
    parent_target_id?: number,
    parent_target_type?: string
}

export interface UserLinkTab {
    link_type: UserLinksEnum,
    headers: Array<any>,
    table: Array<UserLinks>,
    loading: boolean
}