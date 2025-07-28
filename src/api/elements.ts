import {AxiosStatic} from "axios"
import { IRElementType, IRElementStatus, PermissionEnum } from "@/store/modules/IRElements/types"
import { convertToSnakeCase } from '@/utils/elementUtils'
 
const IRElementAPIPaths: {[key in IRElementType]?: string} = {
    [IRElementType.Alertgroup]: "/alertgroup",
    [IRElementType.Event]: "/event",
    [IRElementType.Alert]: "/alert",
    [IRElementType.Signature]: "/signature",
    [IRElementType.Incident]: "/incident",
    [IRElementType.Intel]: "/intel",
    [IRElementType.Product]: "/product",
    [IRElementType.Dispatch]: "/dispatch",
    [IRElementType.Guide]: "/guide",
    [IRElementType.ThreatModelItem]: "/threat_model_item",
    [IRElementType.Link]: "/link",
    [IRElementType.Entity]: "/entity",
    [IRElementType.Entry]: "/entry",
    [IRElementType.File]: "/file",
    [IRElementType.Feed]: "/feed",
    [IRElementType.Pivot]: "/pivot",
    [IRElementType.EntityClass]: "/entity_class",
    [IRElementType.VulnFeed]: "/vuln_feed",
    [IRElementType.VulnTrack]: "/vuln_track",
}

export function getExportURL(elementType: IRElementType, elementID: number, format: string) {
    return `${IRElementAPIPaths[elementType]}/export?id=${elementID}&format=${format}`
}

export default (axios: AxiosStatic) => ({
      async retrieveElements(elementType: IRElementType): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        return axios({
        url: `${path}/`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        params: { 'limit': 25 }, // Default parameters for static fetch
        withCredentials: true
    })
    },

    async retrieveElementsWithFilter(elementType: IRElementType, filterDict: any, abortController: AbortController): Promise<any> {
        //const queryString = Object.keys(filterDict).map(key => key + '=' + filterDict[key]).join('&');
        const path = IRElementAPIPaths[elementType] + '/'
        return axios({
        url: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        params: filterDict,
        withCredentials: true,
        signal: abortController?.signal
    })
    },

    async retrieveElementbyID(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        let fullPath:string = ""
        fullPath = path + '/' + elementID
        
        return axios({
        url: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        signal: abortController?.signal
        
    })
    },

    async retrieveEntityAppearancesbyID(elementID: number, params: any = {}, abortController: AbortController | undefined = undefined): Promise<any> {
        const path = IRElementAPIPaths[IRElementType.Entity]
        let fullPath:string = ""
        fullPath = path + '/' + elementID + '/' + 'flair_appearances'
        return axios({
        url: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        signal: abortController?.signal,
        params: params
    })
    },

    async retrieveEntityPivotsbyID(elementID: number, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[IRElementType.Entity]
        let fullPath:string = ""
        fullPath = path + '/' + elementID + '/' + 'pivot'
        return axios({
        url: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        signal: abortController?.signal
        
    })
    },

    async retrieveEntityEnrichmentsbyID(elementID: number, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[IRElementType.Entity]
        let fullPath:string = ""
        fullPath = path + '/' + elementID + '/' + 'enrichment'
        return axios({
        url: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        signal: abortController?.signal
        
    })
    },
    async requestEntityReEnrichmentbyID(elementID: number): Promise<any> {
        const path = IRElementAPIPaths[IRElementType.Entity]
        let fullPath:string = ""
        fullPath = path + '/' + elementID + '/' + 'enrich_request'
        return axios({
        url: fullPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    })
    },
    async createElement(elementType: IRElementType, createData: any, extraData: any): Promise<any> {
        let postData = {}
        const elementName = convertToSnakeCase(elementType)
        if (extraData && elementName)
        {
            postData = { [elementName]: createData, ...extraData }
        }
        else{
            postData = createData
        }
        return axios({
            url: IRElementAPIPaths[elementType] + '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: postData
        })
    },
    
    async submitFile(formData: FormData, targetType: string, targetId: string, description: string | null = null): Promise<any> {
        return axios({
            url: '/file/',
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                'target_type': convertToSnakeCase(targetType),
                'target_id': targetId,
                'description': description
            },
            withCredentials: true,
            data: formData
        })
    },

    async updateElementById(elementId: number, elementType: IRElementType, updateData: any): Promise<any> {
        const path = IRElementAPIPaths[elementType] + '/' + elementId
        return axios({
            url: path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
            withCredentials: true
        })
    },

    async deleteElementById(elementId: number, elementType: IRElementType) {
        const path = IRElementAPIPaths[elementType] + '/' + elementId
        return axios({
            url: path,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
    },


    async deleteFileById(fileId:number, targetId:number, targetType:IRElementType) {
        const path = 'file' + '/' + fileId
        return axios({
            url: path,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: { target_type: convertToSnakeCase(targetType), target_id: targetId }
        })
    },

    async updateFileById(fileId: number, filename: string | null, description: string | null) {
        const path = 'file' + '/' + fileId
        const data: any = {}
        if (filename) {
            data["filename"] = filename
        }
        if (description) {
            data["description"] = description
        }
        return axios({
            url: path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: data
        })
    },

    async undeleteElementById(elementId: number, elementType: IRElementType, keep_id: boolean = true) {
        const path = IRElementAPIPaths[elementType] + '/undelete'
        return axios({
            url: path,
            method: 'POST',
            params: { 'target_id': elementId, 'keep_ids': keep_id },
            withCredentials: true
        })
    },

    async updateEntityClassDescriptionById(elementId: number, updateData: any): Promise<any> {
        const path = 'entity_class' + '/' + elementId + '/'
        return axios({
            url: path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
            withCredentials: true
        })
    },

    async updateOrCreateEntry(entryID: number, entryCreateOrUpdateAttributes: any): Promise<any> {
        if (entryCreateOrUpdateAttributes.target_type) {
            entryCreateOrUpdateAttributes.target_type = convertToSnakeCase(entryCreateOrUpdateAttributes.target_type)
        }
        if (entryID == -1){
            if (entryCreateOrUpdateAttributes.entry_class == 'notebook')
            {
                const fullPutPath = 'entry' + '/' + 'notebook'
                return axios({
                url: fullPutPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials:true,
                data: {entry: entryCreateOrUpdateAttributes}
            })
        }
            const fullPutPath = 'entry' + '/'
            return axios({
            url: fullPutPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: {entry: entryCreateOrUpdateAttributes}
        })

        }
        else{
            const fullPutPath = 'entry' +'/' + entryID
            return axios({
            url: fullPutPath,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: entryCreateOrUpdateAttributes
        })
        }
    
    },


    async downloadFilesbyId(fileIds:Array<number>): Promise<any>{
            let fullPath:string = ""
            
                 fullPath = 'file' + '/' + 'download' + `?ids=${fileIds}`
                 return axios({
                    url: fullPath,
                    method: 'GET',
                    withCredentials: true
                    
                })
            
         
    },
    async retrieveElementEntriesbyID(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        let fullPath:string = ""
        if (elementType === IRElementType.Alertgroup){
            fullPath = path + '/' + elementID + '/' + 'alerts'
        }
        else{
             fullPath = path + '/' + elementID + '/' + 'entry'
        }
        return axios({
        url: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        params: { limit: -1 },  // Get all entries, no matter how many there are
        withCredentials: true,
        signal: abortController?.signal
    })
    },


    async retrieveElementEntitiesbyID(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        let fullPath:string = ""
       
        fullPath = path + '/' + elementID + '/' + 'entity'
        return axios({
        url: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        signal: abortController?.signal
    })
    },

    async reflairSelectedElementById(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        let fullPath: string = ""
       
        fullPath = path + '/' + elementID + '/' + 'reflair'
        return axios({
        url: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        signal: abortController?.signal
    })
    },

    async retrieveElementFilesbyID(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        let fullPath: string = ""

        fullPath = path + '/' + elementID + '/' + 'files'
        return axios({
            url: fullPath,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            signal: abortController?.signal

        })
    },

    async retrieveElementSignaturesByID(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        let fullPath: string = ""

        fullPath = path + '/' + elementID + '/' + 'signatures'
        return axios({
            url: fullPath,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            signal: abortController?.signal
        })
    },

    async retrieveElementPermissions(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        return axios({
            url: '/permissions/getroles',
            method: 'GET',
            params: { target_type: convertToSnakeCase(IRElementType[elementType]), target_id: elementID },
            withCredentials: true,
            signal: abortController?.signal
        })
    },

    async retrieveElementHistory(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        const fullPath: string = path + '/' + elementID + '/' + 'history'
        return axios({
            url: fullPath,
            method: 'GET',
            withCredentials: true,
            signal: abortController?.signal
        })
    },

    async grantElementPermission(elementID: number, elementType: IRElementType, roleID: number, permission: PermissionEnum): Promise<any> {
        return axios({
            url: '/permissions/grant',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                target_type: convertToSnakeCase(IRElementType[elementType]),
                target_id: elementID,
                role_id: roleID,
                permission: PermissionEnum[permission].toLowerCase()
            },
            withCredentials: true
        })
    },

    async revokeElementPermission(elementID: number, elementType: IRElementType, roleID: number, permission: PermissionEnum): Promise<any> {
        return axios({
            url: '/permissions/revoke',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                target_type: convertToSnakeCase(IRElementType[elementType]),
                target_id: elementID,
                role_id: roleID,
                permission: PermissionEnum[permission].toLowerCase()
            },
            withCredentials: true
        })
    },

    async setElementPermissions(elementID: number, elementType: IRElementType, permissions: { [key in PermissionEnum]?: Array<number> }): Promise<any> {
        return axios({
            url: '/permissions/set',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                target_type: convertToSnakeCase(IRElementType[elementType]),
                target_id: elementID,
                permissions: permissions
            },
            withCredentials: true
        })
    },

    async changeElementStatus(elementID: number, elementType: IRElementType, newElementStatus: IRElementStatus): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        const fullPath:string = path + "/" + elementID
        return axios({
        url: fullPath,
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json'
            },
            data: { status: newElementStatus.toLowerCase() },
        withCredentials:true
    })

    },


    async promoteElements(elementIDs: Array<number>, elementType: IRElementType, new_tags: Array<string> = [], new_sources: Array<string> = []): Promise<any> {
        const fullPath: string = "promotion/"
        const promotionTargetMap: Record<string, string> = {
            "alert": "event",
            "event": "incident",
            "dispatch": "intel",
            "vuln_feed": "vuln_track"
        }
        const sourceString = convertToSnakeCase(IRElementType[elementType])
        const targetElement = promotionTargetMap[sourceString || "undefined"]
        const sources = elementIDs.map(element => {
            return { type: convertToSnakeCase(IRElementType[elementType]), id: element }
        })
        return axios({
            url: fullPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { source: sources, destination: targetElement, sources: new_sources, tags: new_tags },
            withCredentials: true
        })

    },
    
    async promoteElementsToExisting(elementIDs: Array<number>, elementType: IRElementType, existingEventId: number, new_tags: Array<string> = [], new_sources: Array<string> = []): Promise<any> {
        const fullPath: string = "promotion/"
        const promotionTargetMap: Record<string, string> = {
            "alert": "event",
            "event": "incident",
            "dispatch": "intel",
            "vuln_feed": "vuln_track"
        }
        const sourceString = convertToSnakeCase(IRElementType[elementType])
        const targetElement = promotionTargetMap[sourceString || "undefined"]
        const sources = elementIDs.map(element => {
            return { type: convertToSnakeCase(IRElementType[elementType]), id: element }
        })
        const promoteTo = existingEventId
        return axios({
            url: fullPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { source: sources, destination: targetElement, destination_id: promoteTo, sources: new_sources, tags: new_tags },
            withCredentials: true
        })
    },

    async retrieveTags(filterDict: object): Promise<any> {
        return axios({
            url: "/tag/",
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: filterDict,
            withCredentials:true
        })
    },

    async deleteTag(id: number): Promise<any> {
        return axios({
            url: `/tag/${id}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true
        })
    },

    async replaceTag(id: number, replaceId: number): Promise<any> {
        return axios({
            url: `/tag/${id}/replace/${replaceId}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true
        })
    },

    async tagAppearances(filterDict: any): Promise<any> {
        return axios({
            url: `/tag/target_appearance`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: filterDict,
            withCredentials:true
        })
    },

    async retrieveAllEntityClasses(): Promise<any> {
        const filterDict = { limit: -1 }
        return axios({
        url: "/entity_class/",
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        params: filterDict,
        withCredentials:true
    })
    },

    async retrieveAllEntityTypes(): Promise<any> {
        const filterDict = { limit: -1 }
        return axios({
            url: "/entity_type/",
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: filterDict,
            withCredentials:true
        })
    },

    async retrieveSources(filterDict: any): Promise<any> {
        return axios({
            url: "/source/",
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: filterDict,
            withCredentials:true
        })
    },

    async deleteSource(id: number): Promise<any> {
        return axios({
            url: `/source/${id}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true
        })
    },

    async replaceSource(id: number, replaceId: number): Promise<any> {
        return axios({
            url: `/source/${id}/replace/${replaceId}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true
        })
    },

    async sourceAppearances(filterDict: any): Promise<any> {
        return axios({
            url: `/source/target_appearance`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: filterDict,
            withCredentials:true
        })
    },


    async addSource(sourceToAdd: any): Promise<any> {
        if (sourceToAdd.target_type) {
            sourceToAdd.target_type = convertToSnakeCase(sourceToAdd.target_type)
        }
        return axios({
        url: "/source/source_by_name",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials:true,
        data: sourceToAdd
    })
    },
    async addTag(tagToAdd: any): Promise<any> {
        if (tagToAdd.target_type) {
            tagToAdd.target_type = convertToSnakeCase(tagToAdd.target_type)
        }
        return axios({
        url: "/tag/tag_by_name",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials:true,
        data: tagToAdd
    })
    },

    async submitPivotEntityClasses(pivotId:number, entityClasses:any): Promise<any> {
        return axios({
        url: `/pivot/${pivotId}/entity_class`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials:true,
        data: {'entity_classes': entityClasses}
    })
    },
    async submitPivotEntityTypes(pivotId:number, entityTypes:any): Promise<any> {
        return axios({
        url: `/pivot/${pivotId}/entity_type`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials:true,
        data: {'entity_types': entityTypes}
    })
    },

    async addEntityClass(entityId:number, entityClassesToAdd:any): Promise<any> {
        return axios({
            url: `/entity/${entityId}/entity_class`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: {'entity_class_ids': entityClassesToAdd}
        })
    },

    async addEntityTag(entityId:number, tagToAdd:any): Promise<any> {
        return axios({
            url: `/entity/${entityId}/tag`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: {'id': tagToAdd}
        })
    },

    async removeEntityClass(entityId:number, entityClassesToRemove:any): Promise<any> {
        return axios({
            url: `/entity/${entityId}/entity_class/remove`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: {'entity_class_ids': entityClassesToRemove}
        })
    },

    async removeEntityTag(entityId:number, tagToRemove:any): Promise<any> {
        return axios({
            url: `/entity/${entityId}/untag`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: {'id': tagToRemove}
        })
    },

    async removeTag(tagId: any, removeBody: any): Promise<any> {
        if (removeBody.target_type) {
            removeBody.target_type = convertToSnakeCase(removeBody.target_type)
        }
        return axios({
            url: `/tag/${tagId}/untag`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: removeBody
        })
    },

    async removeSource(sourceId: any, removeBody: any): Promise<any> {
        if (removeBody.target_type) {
            removeBody.target_type = convertToSnakeCase(removeBody.target_type)
        }
        return axios({
            url: `/source/${sourceId}/remove`,
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: removeBody
        })
    },
    
    async updateSource(sourceId:any, updateBody:any): Promise<any> {
        return axios({
            url: `/source/${sourceId}`,
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: updateBody
        })
    },

    async updateTag(tagId:any, updateBody:any): Promise<any> {
        return axios({
            url: `/tag/${tagId}`,
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials:true,
            data: updateBody
        })
    },
    
    async deleteElementByID(elementID: number, elementType: IRElementType): Promise<any> {
        const path = IRElementAPIPaths[elementType]
        let fullPath:string = ""
        fullPath = path + '/' + elementID
        return axios({
        url: fullPath,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials:true
        
    })
    },
    async deleteEntryByID(elementID: number): Promise<any> {
        
        let fullPath:string = ""
        fullPath = 'entry' + '/' + elementID
        return axios({
        url: fullPath,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials:true
        
    })
    },

    async deleteLinksBetweenElements(elementType0: IRElementType, elementId0: number, elementType1: IRElementType, elementId1: number, bidirectional: boolean = false) {
        const path = IRElementAPIPaths[IRElementType.Link]
        const fullPath: string = path + '/deletebetween'
        return axios({
            url: fullPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                v0_type: elementType0,
                v0_id: elementId0,
                v1_type: elementType1,
                v1_id: elementId1,
                bidirectional: bidirectional
            },
            withCredentials: true

        })
    },

    async retrieveSignatureBodies(signatureId: number): Promise<any> {
        return axios({
            url: 'signature/' + signatureId + '/sigbodies',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
    },

    async upvoteElement(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        return axios({
            url: `${IRElementAPIPaths[elementType]}/${elementID}/upvote`,
            method: 'POST',
            withCredentials: true,
            signal: abortController?.signal
        })
    },

    async downvoteElement(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        return axios({
            url: `${IRElementAPIPaths[elementType]}/${elementID}/downvote`,
            method: 'POST',
            withCredentials: true,
            signal: abortController?.signal
        })
    },

    async favoriteElement(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        return axios({
            url: `${IRElementAPIPaths[elementType]}/${elementID}/favorite`,
            method: 'POST',
            withCredentials: true,
            signal: abortController?.signal
        })
    },

    async subscribeElement(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        return axios({
            url: `notification/subscribe`,
            method: 'POST',
            withCredentials: true,
            data: {
                target_type: convertToSnakeCase(elementType),
                target_id: elementID
            },
            signal: abortController?.signal
        })
    },

    async unsubscribeElement(elementID: number, elementType: IRElementType, abortController: AbortController): Promise<any> {
        return axios({
            url: `notification/unsubscribe`,
            method: 'POST',
            withCredentials: true,
            data: {
                target_type: convertToSnakeCase(elementType),
                target_id: elementID
            },
            signal: abortController?.signal
        })
    },
});