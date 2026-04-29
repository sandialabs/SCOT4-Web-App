<template>
    <div class="v-system-bar"
        :class="{ 'task-open': entry?.entry_class == 'task' && entry.entry_data.status != 'closed', 'task-closed': entry?.entry_class == 'task' && entry.entry_data.status == 'closed' }"
        v-if="!isLoading">
        <v-btn density="compact" variant="text" class="bg-transparent" elevation="0" @click="expand()"
            v-tooltip:bottom="isEntryExpanded ? 'Collapse Entry' : 'Expand Entry'">
            <FontAwesomeIcon v-if="isEntryExpanded" :icon="faChevronCircleDown" />
            <FontAwesomeIcon v-else :icon="faChevronCircleRight" />
        </v-btn>
        [<router-link class="match-color" v-if="entry.id != -1"
            :to="`/${TextPipe.PluralizeString(entry.target_type)}/${entry.target_id}/${entry.id}`">{{ entry.id
            }}</router-link>]
        <span class="entry-title" v-if="entry.id != -1">{{ entry.owner + (entry?.entry_class == 'task' ? " --assignedto"
            + entry.entry_data.assignee : "")
            }} @ {{
                DatePipe.ConvertDate(entry.created) }} (Modified {{ DatePipe.ConvertDate(entry.modified) }}) </span>
        <v-chip class="ma-2" color="orange" size="x-small" variant="flat" small v-if="type == 'promotion'"
            text="Promoted Entry" />
        <v-chip class="ma-2" variant="flat" color="red" size="x-small"
            v-if="!entry?.entry_data?.flaired_html && entry.id != -1 && type != 'promotion'" text="Unflaired Entry" />
        <v-spacer />
        <v-btn v-if="entry.id != -1" class="bg-transparent" :elevation="0" @click="Subscribe(entry.subscribed)"
            v-tooltip:bottom="'Subscribe'">
            <FontAwesomeIcon :icon="faBell" :color="entry.subscribed ? 'blue' : ''" />
        </v-btn>
        <v-btn v-if="entry.id != -1" class="bg-transparent" :elevation="0" @click="Favorite()"
            v-tooltip:bottom="'Favorite'">
            <FontAwesomeIcon :icon="faHeart" :color="entry.favorite ? 'red' : ''" />
        </v-btn>
        <PopularityElement v-if="UserPreferences?.showPopularity && entry.id != -1" :voted="entry['popularity_voted']"
            class="mx-2" :count="entry.popularity_count == null ? 0 : entry.popularity_count" :elementID="entry.id"
            :elementType="entry.entry_class" :queueView="false" />
        <span class="mt-n1">
            <TLPPicker v-if="entry.tlp && !isEntryEditing" :obj="entry" :data="entry.tlp" :targetType="'entry'"
                :targetId="entry.id" />
        </span>
        <v-btn class="bg-transparent" elevation="0" @click="edit()" v-if="!isEntryEditing && type !== 'promotion'"
            v-tooltip:bottom="'Edit'">
            <FontAwesomeIcon :icon="faEdit" />
        </v-btn>
        <v-btn class="bg-transparent" elevation="0" v-if="!isEntryEditing" @click="AddReply()"
            v-tooltip:bottom="'Reply'">
            <FontAwesomeIcon :icon="faReply" />
        </v-btn>
        <v-menu v-if="!isEntryEditing">
            <template v-slot:activator="{ props }">
                <v-btn size="small" v-bind="props" variant="plain" elevation="0" v-tooltip:bottom="'More Options'">
                    <FontAwesomeIcon :icon="faEllipsis" />
                </v-btn>
            </template>
            <v-list>
                <v-list-item @click="ToggleSummary('summary')" v-if="type == 'entry'" title="Make Summary" />
                <v-list-item @click="ToggleSummary('entry')" v-if="type == 'summary'" title="Remove Summary" />
                <v-list-item @click="ToggleTask('task')" v-if="type == 'entry'" title="Make Task" />
                <v-list-item @click="updateTask('closed')"
                    v-if="type == 'task' && entry?.entry_data?.status != 'closed' && entry?.entry_data?.assignee == user.username"
                    title="Mark Complete" />
                <v-list-item @click="updateTask('open')" v-if="type == 'task' && entry?.entry_data?.status == 'closed'"
                    title="Reopen Task" />
                <v-list-item @click="assignTaskToMe"
                    v-if="type == 'task' && entry?.entry_data?.status != 'closed' && entry?.entry_data?.assignee != user.username"
                    title="Assign Task to Me" />
                <v-list-item @click="ToggleTask('entry')" v-if="type == 'task'" title="Remove Task" />
                <v-list-item @click="Dialog.ToggleDialog('permissions', { targetType: 'entries', targetId: entry?.id })"
                    v-if="type != 'promotion'" title="Permissions" />
                <v-list-item @click="Dialog.ToggleDialog('entry-entities-click', { targetId: entry?.id })"
                    v-if="entry?.entry_class != 'promotion'" title="View Entities" />
                <v-list-item @click="Delete()" v-if="type != 'promotion'" title="Delete Entry" />
                <v-list-item @click="Reflair()" title="Reflair Entry" />
            </v-list>
        </v-menu>
        <v-btn class="bg-transparent" elevation="0"
            @click="Dialog.ToggleDialog('journal', { entryData: entry, entities: incomingProps.entities })"
            v-if="!Dialog.GetDialogActive" v-tooltip:bottom="'Expand'">
            <FontAwesomeIcon :icon="faExpand" />
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue';
import { useNotificationStore, usePOST_APIStore, useGET_APIStore, useDELETE_APIStore, usePUT_APIStore, useAuthStore, useDialogStore, useModalStore } from '@/stores';
import { NewEntry } from '@/models';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronCircleRight, faChevronCircleDown, faEdit, faEllipsis, faExpand, faReply, faHeart, faBell } from '@fortawesome/free-solid-svg-icons'
import TLPPicker from '@/components/Pickers/TLPPicker.vue';
import { useDatePipe, useTextPipe } from '@/pipes';
import PopularityElement from '../QueueElements/PopularityElement.vue';

let incomingProps = defineProps(['type', 'entry', 'entities', 'expanded', 'editing', 'isNotModal'])
const emit = defineEmits(['expand', 'edit', 'delete', 'reply'])
const API_POST = usePOST_APIStore()
const API_GET = useGET_APIStore()
const API_DELETE = useDELETE_APIStore()
const API_PUT = usePUT_APIStore()
const Modal = useModalStore()
const DatePipe = useDatePipe()
const Dialog = useDialogStore()
const Auth = useAuthStore()
const Notifications = useNotificationStore()
const TextPipe = useTextPipe()
let isLoading = ref(true)
let isEntryExpanded = ref(incomingProps?.expanded)
let isEntryEditing = ref(incomingProps?.editing)
let entry = reactive(incomingProps?.entry)
let type = ref(incomingProps?.type)
let user = reactive(Auth.GetUser)
const UserPreferences = ref(Auth.GetUser.preferences)

onMounted(() => {
    isEntryExpanded = ref(incomingProps.expanded)
    isEntryEditing = ref(incomingProps.editing)
    entry = reactive(incomingProps.entry)
    type = ref(incomingProps.type)
    isLoading.value = false
})

watch(
    () => Auth.GetUser,
    () => UserPreferences.value = Auth.GetUser.preferences,
)

watch(
    () => incomingProps.editing,
    () => isEntryEditing.value = incomingProps.editing
)

watch(
    () => incomingProps.expanded,
    () => {
        isEntryExpanded.value = incomingProps.expanded
    }
)

function expand() {
    isEntryExpanded.value = !isEntryExpanded.value
    emit('expand', isEntryExpanded.value)
}

function edit() {
    isEntryEditing.value = !isEntryEditing.value
    emit('edit', isEntryEditing.value)
}

async function Favorite() {
    await API_POST.POST_Favorite("/entry", entry.id)
        .then((v: any) => {
            if (incomingProps.isNotModal) {
                // v ? Bus.ToggleReloadSelectedView() : null
            } else {
                v ? Modal.ToggleRefreshModalEntity() : null
            }

        })
        .then(() => {
            entry.favorite = !entry.favorite
        })
}

async function Subscribe(subscribed: boolean) {
    if (subscribed) {
        await Notifications.POST_unSubscribe({ target_type: entry.entry_class, target_id: entry.id })
            .then(() => {
                entry.subscribed = !entry.subscribed
            })
    }
    else {
        await Notifications.POST_Subscribe({ target_type: entry.entry_class, target_id: entry.id })
            .then(() => {
                entry.subscribed = !entry.subscribed
            })
    }
}

async function AddReply() {
    const dummyEntry = new NewEntry("entry", { html: "" }, Auth.GetUser.username, entry.id, parseInt(entry.target_id), entry.target_type)
    dummyEntry.id = -1
    emit('reply', dummyEntry)
}

async function ToggleSummary(classType) {
    await API_PUT.UpdateElementById("/entry", entry?.id, { entry_class: classType })
        .then((v: any) => {
            Object.assign(entry, v)
        })
}

async function ToggleTask(classType) {
    let newData: any
    if (classType == 'task') {
        newData = {
            ...entry.entry_data,
            "status": "open",
            "task_time": new Date().toISOString(),
            "assignee": user.username
        }
    } else {
        let { status, task_time, assignee, ...newData } = entry.entry_data
        newData = newData
    }

    await API_PUT.UpdateElementById("/entry", entry?.id, { entry_class: classType, entry_data: newData })
        .then((v: any) => {
            Object.assign(entry, v)
        })
}

async function Reflair() {
    await API_GET.GET_ReflairElementById("/entry", entry?.id)
}

async function Delete() {
    API_DELETE.DeleteElementById("entry", entry?.id)
        .then((v: any) => {
            // Raise all of this entry's children to the next parent up (the API mirrors this on the backend)
            if (entry.children) {
                for (const child of entry.children) {
                    child.parent_entry_id = entry.parent_entry_id
                }
            }
            emit('delete')
        })
}

async function updateTask(status: string) {
    const newData = {
        ...entry.entry_data,
        "status": status,
        "task_time": new Date().toISOString()
    }

    await API_PUT.UpdateEntry(entry.id, { entry_data: newData }).then((v: any) => {
        Object.assign(entry, v)
    })
}

async function assignTaskToMe() {
    const newData = {
        ...entry.entry_data,
        "assignee": user.username,
        "task_time": new Date().toISOString()
    }

    await API_PUT.UpdateEntry(entry.id, { entry_data: newData }).then((v: any) => {
        Object.assign(entry, v)
    })

}
</script>

<style>
.entry-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 5px;
}

.v-system-bar.task-open {
    background-color: #CD5C5C;
}

.v-system-bar.task-closed {
    background-color: #00A500;
}

.v-system-bar {
    font-size: 0.8rem;
}

.v-system-bar button {
    font-size: 1.1rem;
    margin-left: 3px;
    margin-right: 3px;
    min-width: 5px !important;
    padding: 4px !important;
    height: 100% !important;
}
</style>