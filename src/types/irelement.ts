import AlertTablePane from '../components/SelectedElementPanes/AlertsTablePane.vue'
import GuidesPane from '../components/SelectedElementPanes/GuidesPane.vue'
import JournalPane from '../components/SelectedElementPanes/JournalPane.vue'
import SignaturesPane from '../components/SelectedElementPanes/SignaturesPane.vue'
import EntitiesPane from '../components/SelectedElementPanes/EntitiesPane.vue'
import FilesPane from '../components/SelectedElementPanes/FilesPane.vue'
import IncidentsDetailsPane from '../components/SelectedElementPanes/IncidentsDetailsPane.vue'
import PromotedAlertsPane from '../components/SelectedElementPanes/PromotedAlertsPane.vue'
import PivotProperties from '@/components/SelectedElementPanes/PivotProperties.vue'
import EntityClasses from '@/components/SelectedElementPanes/EntityClasses.vue'
import SignatureProperties from '@/components/SelectedElementPanes/SignatureProperties.vue'
import FeedPropertiesPane from '@/components/SelectedElementPanes/FeedPropertiesPane.vue'
import EntityAppearancesPane from '@/components/SelectedElementPanes/EntityAppearancesPane.vue'
import SignatureBodyPane from '@/components/SelectedElementPanes/SignatureBodyPane.vue'
import ThreatModelItem from '@/components/SelectedElementPanes/ThreatModelItem.vue'
import ThreatModelItemProperties from '@/components/SelectedElementPanes/ThreatModelItemProperties.vue'

export enum IRElementType {
  Event = 'events',
  Alertgroup = 'alertgroups',
  Incident = 'incidents',
  Intel = 'intels',
  Product = 'products',
  Dispatch = 'dispatches',
  Guide = 'guides',
  Alert = 'alerts',
  Signature = 'signatures',
  ThreatModelItem = 'threat_model_item',
  Link = 'links',
  Entity = 'entities',
  Entry = 'entries',
  Tasks = 'entries',
  File = 'files',
  Feed = 'feeds',
  Tags = 'tags',
  Sources = 'sources',
  Pivot = 'pivots',
  EntityClass = 'entity_classes',
  VulnFeed = 'vuln_feeds',
  VulnTrack = 'vuln_tracks',
  Stats = "stats"
}

export const IRElementTypeSingular: any = {
  [IRElementType.Event]: 'event',
  [IRElementType.Alertgroup]: 'alertgroup',
  [IRElementType.Incident]: 'incident',
  [IRElementType.Intel]: 'intel',
  [IRElementType.Product]: 'product',
  [IRElementType.Dispatch]: 'dispatch',
  [IRElementType.Guide]: 'guide',
  [IRElementType.Alert]: 'alert',
  [IRElementType.Signature]: 'signature',
  [IRElementType.ThreatModelItem]: 'threat_model_item',
  [IRElementType.Link]: 'link',
  [IRElementType.Entity]: 'entity',
  [IRElementType.Entry]: 'entry',
  [IRElementType.File]: 'file',
  [IRElementType.Feed]: 'feed',
  [IRElementType.Tags]: 'tag',
  [IRElementType.Sources]: 'source',
  [IRElementType.Pivot]: 'pivot',
  [IRElementType.EntityClass]: 'entity_class',
  [IRElementType.VulnFeed]: 'vuln_feed',
  [IRElementType.VulnTrack]: 'vuln_track',
  [IRElementType.Stats]: 'stat'
}

export const IRElementAPIPaths: any = {
  [IRElementType.Alertgroup]: '/alertgroup',
  [IRElementType.Event]: '/event',
  [IRElementType.Alert]: '/alert',
  [IRElementType.Signature]: '/signature',
  [IRElementType.Incident]: '/incident',
  [IRElementType.Intel]: '/intel',
  [IRElementType.Product]: '/product',
  [IRElementType.Dispatch]: '/dispatch',
  [IRElementType.Guide]: '/guide',
  [IRElementType.ThreatModelItem]: '/threat_model_item',
  [IRElementType.Link]: '/link',
  [IRElementType.Entity]: '/entity',
  [IRElementType.Entry]: '/entry',
  [IRElementType.Sources]: '/source',
  [IRElementType.Tags]: '/tag',
  [IRElementType.File]: '/file',
  [IRElementType.Feed]: '/feed',
  [IRElementType.Pivot]: '/pivot',
  [IRElementType.EntityClass]: '/entity_class',
  [IRElementType.VulnFeed]: '/vuln_feed',
  [IRElementType.VulnTrack]: '/vuln_track',
}

export const IRElementAPIPathsNoSlash: any = {
  [IRElementType.Alertgroup]: 'alertgroup',
  [IRElementType.Event]: 'event',
  [IRElementType.Alert]: 'alert',
  [IRElementType.Signature]: 'signature',
  [IRElementType.Incident]: 'incident',
  [IRElementType.Intel]: 'intel',
  [IRElementType.Product]: 'product',
  [IRElementType.Dispatch]: 'dispatch',
  [IRElementType.Guide]: 'guide',
  [IRElementType.ThreatModelItem]: 'threat_model_item',
  [IRElementType.Link]: 'link',
  [IRElementType.Entity]: 'entity',
  [IRElementType.Entry]: 'entry',
  [IRElementType.File]: 'file',
  [IRElementType.Feed]: 'feed',
  [IRElementType.Pivot]: 'pivot',
  [IRElementType.EntityClass]: 'entity_class',
  [IRElementType.VulnFeed]: 'vuln_feed',
  [IRElementType.VulnTrack]: 'vuln_track',
}

export const IRElementPaths: any = {
  [IRElementType.Alertgroup]: '/alertgroups',
  [IRElementType.Alert]: '/alert',
  [IRElementType.Event]: '/events',
  [IRElementType.Incident]: '/incidents',
  [IRElementType.Dispatch]: '/dispatches',
  [IRElementType.Intel]: '/intels',
  [IRElementType.Product]: '/products',
  [IRElementType.Feed]: '/feeds',
  [IRElementType.Entity]: '/entities',
  [IRElementType.Entry]: '/tasks',
  [IRElementType.Signature]: '/signatures',
  [IRElementType.Guide]: '/guides',
  [IRElementType.Pivot]: '/pivots',
  [IRElementType.EntityClass]: '/entity-classes',
  [IRElementType.VulnFeed]: '/vuln_feeds',
  [IRElementType.VulnTrack]: '/vuln_tracks',
  [IRElementType.Tags]: '/tags',
  [IRElementType.Sources]: '/sources',
  [IRElementType.ThreatModelItem]: '/threat_model_items',
  [IRElementType.Link]: '/links',
  [IRElementType.File]: '/files',
  [IRElementType.Stats]: '/stats',
}

export enum IRElementStatus {
  Open = 'open',
  Closed = 'closed',
  Promoted = 'promoted'
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
  entry = 'entry',
  summary = 'summary',
  action = 'action',
  task = 'task',
  promotion = 'promotion'
}

export enum PermissionEnum {
  read = 'read',
  modify = 'modify',
  delete = 'delete',
  admin = 'admin'
}

export const IRElementQuickButtons: any = {
  [IRElementType.Alertgroup]: ['favorite', 'flair', 'permissions', 'history', 'export', 'open', 'close', 'reflair', 'delete'],
  [IRElementType.Event]: ['subscribe', 'favorite', 'add_entry', 'popularity', 'flair', 'permissions', 'history', 'export', 'promote', 'delete'],
  [IRElementType.Incident]: ['subscribe', 'favorite', 'add_entry', 'flair', 'permissions', 'history', 'export', 'delete'],
  [IRElementType.Dispatch]: ['subscribe', 'favorite', 'add_entry', 'flair', 'permissions', 'history', 'export', 'promote', 'delete'],
  [IRElementType.Intel]: ['subscribe', 'favorite', 'add_entry', 'popularity', 'flair', 'permissions', 'history', 'export', 'delete'],
  [IRElementType.Product]: ['subscribe', 'favorite', 'add_entry', 'popularity', 'flair', 'permissions', 'history', 'export', 'delete'],
  [IRElementType.Feed]: ['subscribe', 'favorite', 'add_entry', 'flair', 'permissions', 'history', 'export', 'delete'],
  [IRElementType.Entity]: ['subscribe', 'favorite', 'add_entry', 'flair', 'export', 'delete'],
  [IRElementType.Signature]: ['subscribe', 'favorite', 'add_entry', 'flair', 'permissions', 'history', 'export', 'delete'],
  [IRElementType.Guide]: ['subscribe', 'favorite', 'add_entry', 'flair', 'permissions', 'history', 'export', 'delete'],
  [IRElementType.VulnFeed]: ['subscribe', 'favorite', 'add_entry', 'flair', 'permissions', 'history', 'export', 'promote', 'delete'],
  [IRElementType.VulnTrack]: ['subscribe', 'favorite', 'add_entry', 'popularity', 'flair', 'permissions', 'history', 'export', 'delete'],
  [IRElementType.EntityClass]: [],
  [IRElementType.ThreatModelItem]: ['subscribe', 'favorite', 'add_entry', 'flair', 'permissions', 'history', 'export', 'delete'],
}

export const IRElementTabs: Record<string, string[]> = {
  [IRElementType.Alertgroup]: ['Alerts', 'Signatures', 'Guides', 'Entities'],
  [IRElementType.Event]: ['Journal', 'Promoted Alerts', 'Entities', 'Files'],
  [IRElementType.Signature]: ['Journal', 'Signature Properties', 'Signature Body', 'Threat Models'],
  [IRElementType.Incident]: ['Journal', 'Incident Details', 'Entities', 'Files'],
  [IRElementType.Intel]: ['Journal', 'Entities', 'Files'],
  [IRElementType.Product]: ['Journal', 'Entities', 'Files'],
  [IRElementType.Dispatch]: ['Journal', 'Entities', 'Threat Models'],
  [IRElementType.Entity]: ['Journal', 'Entity Appearances'],
  [IRElementType.Feed]: ['Feed Properties', 'Journal'],
  [IRElementType.Guide]: ['Journal', 'Signatures', 'Entities'],
  [IRElementType.Pivot]: ['Pivot Properties'],
  [IRElementType.EntityClass]: ['Entity Class Properties'],
  [IRElementType.Entry]: ['Journal'],
  [IRElementType.VulnFeed]: ['Journal', 'Entities', 'Files'],
  [IRElementType.VulnTrack]: ['Journal', 'Entities', 'Files'],
  [IRElementType.ThreatModelItem]: ['Journal', 'Threat Model Properties', 'Signatures', 'Entities'],
}

export const IRElementPanes: any = {
  [IRElementType.Alertgroup]: ['Alerts'],
  [IRElementType.Event]: ['Journal'],
  [IRElementType.Intel]: ['Journal'],
  [IRElementType.File]: ['File'],
  [IRElementType.Product]: ['Journal'],
  [IRElementType.Incident]: ['Journal', 'Incident Details'],
  [IRElementType.Dispatch]: ['Journal'],
  [IRElementType.Alert]: ['alerts'],
  [IRElementType.Guide]: ['Journal', 'Signatures',],
  [IRElementType.Signature]: ['Journal', 'Signature Properties'],
  [IRElementType.Link]: ['link'],
  [IRElementType.Entity]: ['Journal'],
  [IRElementType.Entry]: ['entry'],
  [IRElementType.Feed]: ['Feed Properties', 'Journal'],
  [IRElementType.Pivot]: ['Pivot Properties'],
  [IRElementType.EntityClass]: ['Entity Class Properties'],
  [IRElementType.VulnFeed]: ['Journal'],
  [IRElementType.VulnTrack]: ['Journal'],
  [IRElementType.ThreatModelItem]: ['Journal', 'Threat Model Properties'],
}

export const IRElementTabComponents: Record<string, any> = {
  'Alerts': AlertTablePane,
  'Guides': GuidesPane,
  'Journal': JournalPane,
  'Signatures': SignaturesPane,
  'Signature Properties': SignatureProperties,
  'Signature Body': SignatureBodyPane,
  'Entities': EntitiesPane,
  'Entity Appearances': EntityAppearancesPane,
  'Files': FilesPane,
  'Signature Insights': 'SignatureStatsPane',
  'Feed Properties': FeedPropertiesPane,
  'Pivot Properties': PivotProperties,
  'Entity Class Properties': EntityClasses,
  'Promoted Alerts': PromotedAlertsPane,
  'Incident Details': IncidentsDetailsPane,
  'Threat Model Properties': ThreatModelItemProperties,
  'Threat Models': ThreatModelItem,
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

export interface TagSourceAppearance {
  target_type: IRElementType,
  target_id: number,
  items: Array<Tag> | Array<Source>
}

export enum PriorityEnum {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

export enum AuthType {
  Local = 'local',
  LDAP = 'ldap',
  AzureAD = 'aad'
}

export enum StorageProviderType {
  Local = 'disk',
  DellEMC = 'emc'
}

export enum ThreatModelNames {
  attack = "MITRE ATTACK",
  kill_chain = "Kill Chain",
  diamond = "Diamond",
  unified = "Unified Kill Chain",
}