import { defineStore } from 'pinia'
import { IRElementType } from '../types/irelement'

export const useTableHeadersPipe = defineStore('headers', () => {
    function IRElementHeaders(display_name: any) {
        const statusColumnWidth = '9em'
        const idColumnWidth = '8em' // This is about 6 numeric digits in the search bar and 10 in the field itself
        const popularityColumnWidth = '4em'
        const dateColumnWidth = '1%'
        let usernameColumnWidth = '10em'
        let sourceTagColumnWidth = '15em'

        if (['xs', 'sm', 'md'].includes(display_name)) {
            sourceTagColumnWidth = '8em'
            usernameColumnWidth = '9em'
        }
        else if (display_name == 'lg') {
            sourceTagColumnWidth = '12em'
        }

        return {
        [IRElementType.Alertgroup]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'sortable': false },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Views', 'value': 'view_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ],
        [IRElementType.Event]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'sortable': true, 'nowrap': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'sortable': true, 'nowrap': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'sortable': true, 'nowrap': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Entries', 'value': 'entry_count', 'align': 'center', 'width': '1%', 'sortable': true, 'nowrap': true },
            { 'title': 'Views', 'value': 'view_count', 'align': 'center', 'width': '1%', 'sortable': true, 'nowrap': true },
        ],
        [IRElementType.Intel]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Entries', 'value': 'entry_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ],
        [IRElementType.Product]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Entries', 'value': 'entry_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ],
        [IRElementType.Incident]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'sortable': true },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'sortable': true },
            { 'title': 'When', 'value': 'created', 'align': 'center', 'width': '1%', 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Views', 'value': 'view_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ],
        [IRElementType.Dispatch]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Entries', 'value': 'entry_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ],
        [IRElementType.Alert]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'sortable': true },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'sortable': true },
        ],
        [IRElementType.Guide]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Applies To', 'value': 'application', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
        ],
        [IRElementType.Signature]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'sortable': true },
            { 'title': 'Name', 'value': 'name', 'align': 'center', 'width': '12%', 'sortable': true },
            { 'title': 'Type', 'value': 'type', 'align': 'center', 'width': '12em', 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'sortable': true },
            { 'title': 'Group', 'value': 'signature_group', 'align': 'center', 'width': '12em', 'sortable': true },
            { 'title': 'Description', 'value': 'description', 'align': 'center', 'width': '26%', 'sortable': true },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
        ],
        [IRElementType.ThreatModelItem]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'sortable': true },
            { 'title': 'Model Name', 'value': 'threat_model_name', 'align': 'center', 'sortable': true },
            { 'title': 'Model ID', 'value': 'threat_model_id', 'align': 'center', 'sortable': true },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
        ],
        [IRElementType.Link]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'sortable': true },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'sortable': true },
        ],
        [IRElementType.Entity]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'sortable': true },
            { 'title': 'Entity Name', 'value': 'value', 'align': 'center', 'sortable': true },
            { 'title': 'Entity Type', 'value': 'type_name', 'align': 'center', 'width': '15em', 'sortable': true },
            { 'title': 'Entity Classes', 'value': 'classes', 'align': 'center', 'width': '15em', 'sortable': true },
            { 'title': 'Occurrences', 'value': 'entity_count', 'align': 'center', 'width': '9em', 'sortable': false },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
        ],
        // This is for tasks
        [IRElementType.Entry]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'sortable': true },
            { 'title': 'Subject', 'value': 'parent_subject', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Type', 'value': 'target_type', 'align': 'center', 'width': '12em', 'sortable': true },
            { 'title': 'Target ID', 'value': 'target_id', 'align': 'center', 'width': '12em', 'sortable': true },
            { 'title': 'Task Assignee', 'value': 'task_assignee', 'align': 'center', 'width': '12em', 'sortable': true },
            { 'title': 'Task Status', 'value': 'task_status', 'align': 'center', 'width': statusColumnWidth, 'sortable': true },
            { 'title': 'Task Summary', 'value': 'task_summary', 'align': 'center', 'width': '40em', 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
        ],
        [IRElementType.File]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'field': 'id', 'headerFilter': 'input', 'formatter': 'textarea', 'sortable': true },
            { 'title': 'File Name', 'field': 'filename', 'headerFilter': 'input', 'formatter': 'textarea', 'sortable': true },
            { 'title': 'Description', 'field': 'description', 'headerFilter': 'input', 'formatter': 'textarea', 'sortable': true },
            { 'title': 'Created', 'field': 'created', 'headerFilter': 'input', 'formatter': 'textarea', 'sortable': true },
            { 'title': 'Sources', 'field': 'sources', 'headerFilter': 'input', 'formatter': 'textarea', 'sortable': true },
            { 'title': 'Tags', 'field': 'tags', 'headerFilter': 'input', 'formatter': 'textarea', 'sortable': true },
        ],
        [IRElementType.Feed]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'sortable': true },
            { 'title': 'Name', 'value': 'name', 'align': 'center', 'width': '15em', 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'sortable': true },
            { 'title': 'Type', 'value': 'type', 'align': 'center', 'width': '12em', 'sortable': true },
            { 'title': 'URI', 'value': 'uri', 'align': 'center', 'width': '', 'sortable': true },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Last Attempt', 'value': 'last_attempt', 'align': 'center', 'width': '1%', 'sortable': true },
            { 'title': 'Last Article', 'value': 'last_article', 'align': 'center', 'width': '1%', 'sortable': true },
            { 'title': 'Articles', 'value': 'article_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
            { 'title': 'Promotions', 'value': 'promotions_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ],
        [IRElementType.Pivot]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Title', 'value': 'title', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
        ],
        [IRElementType.EntityClass]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Name', 'value': 'display_name', 'align': 'center', 'width': '15%', 'nowrap': true, 'sortable': true },
            { 'title': 'Description', 'value': 'description', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Icon', 'value': 'icon', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
        ],
        [IRElementType.VulnFeed]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Entries', 'value': 'entry_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
            { 'title': 'Views', 'value': 'view_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ],
        [IRElementType.VulnTrack]: [
            { 'title': '', 'value': 'popularity_count', 'align': 'center', 'width': popularityColumnWidth, 'nowrap': true, 'sortable': false },
            { 'title': 'ID', 'value': 'id', 'align': 'center', 'width': idColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Status', 'value': 'status', 'align': 'center', 'width': statusColumnWidth, 'nowrap': true, 'sortable': true },
            { 'title': 'Subject', 'value': 'subject', 'align': 'center', 'width': '', 'nowrap': true, 'sortable': true },
            { 'title': 'Created', 'value': 'created', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Updated', 'value': 'modified', 'align': 'center', 'width': dateColumnWidth, 'sortable': true },
            { 'title': 'Sources', 'value': 'sources', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Tags', 'value': 'tags', 'align': 'center', 'width': sourceTagColumnWidth, 'sortable': false },
            { 'title': 'Owner', 'value': 'owner', 'align': 'center', 'width': usernameColumnWidth, 'sortable': true },
            { 'title': 'Entries', 'value': 'entry_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
            { 'title': 'Views', 'value': 'view_count', 'align': 'center', 'width': '1%', 'nowrap': true, 'sortable': true },
        ]}
    }

    return { IRElementHeaders }
})