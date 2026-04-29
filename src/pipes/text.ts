import { IRElementType, IRElementPaths, IRElementAPIPaths, IRElementTypeSingular } from '@/types/irelement';
import { defineStore } from 'pinia'

export const useTextPipe = defineStore('text', () => {
    function CapitalizeString(stringForConversion: string): string {
        if (typeof stringForConversion == "string") {
            if (stringForConversion.includes(" ")) {
                return stringForConversion.split(" ").map(s => CapitalizeString(s)).join(" ")
            }
            return stringForConversion.charAt(0).toUpperCase() + stringForConversion.slice(1);
        } else {
            return ""
        }
    }

    function IRElementTitle(irelement: IRElementType): string {
          return IRElementTypeSingular[irelement].replace(
                /\w\S*/g,
                (text: string) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
            );
    }

    function PluralizeString(stringForConversion: string): string {
        if (stringForConversion == "entity") {
            return "entities"
        }
        else if (stringForConversion == "dispatch") {
            return "dispatches"
        }
        else if (stringForConversion == "entity_class") {
            return "entity_classes"
        }
        else if (stringForConversion == "entry") {
            return "entries"
        }
        else {
            return stringForConversion + "s"
        }
    }

    function enumFromStringValue<T> (enm: { [s: string]: T}, value: string): T | undefined {
        return (Object.values(enm) as unknown as string[]).includes(value)
            ? value as unknown as T
            : undefined;
    }

    function toIRElementType(target_type: string) {
        if (target_type == "vuln_feed") {
            return IRElementType.VulnFeed
        }
        else if (target_type == "vuln_track") {
            return IRElementType.VulnTrack
        }
        else if (target_type == "events") {
            return IRElementType.Event
        }
        else {
            //sometimes target_type is either plural or singular
            let type = IRElementType[target_type]
            if (type === undefined) {
                type = IRElementType[CapitalizeString(target_type)]
            }

            if (type === undefined) {
                type = IRElementType[CapitalizeString(PluralizeString(target_type))]
            }

            if (type === undefined) {
                type = enumFromStringValue(IRElementType, target_type)
            }
            return type
        }
    }

    function toIRElementPath(target_type: string) {
        return IRElementPaths[toIRElementType(target_type)]
    }

    function toIRElementAPIPath(target_type: string) {
        return IRElementAPIPaths[toIRElementType(target_type)]
    }

    function GetRelativeTime(timestamp: Date) {
        timestamp = new Date(timestamp)
        const relativeTimeMs = new Date().valueOf() - timestamp.valueOf()
        if (relativeTimeMs < 0) {
            return "In the future"
        }
        else if (relativeTimeMs <= 5000) {
            return "Just now"
        }
        else if (relativeTimeMs < 60000) {
            return Math.floor(relativeTimeMs / 1000) + " seconds ago"
        }
        else if (relativeTimeMs < 2 * 60 * 1000) {
            return "1 minute ago"
        }
        else if (relativeTimeMs < 60 * 60 * 1000) {
            return Math.floor(relativeTimeMs / (1000 * 60)) + " minutes ago"
        }
        else if (relativeTimeMs < 2 * 60 * 60 * 1000) {
            return "1 hour ago"
        }
        else if (relativeTimeMs < 24 * 60 * 60 * 1000) {
            return Math.floor(relativeTimeMs / (1000 * 60 * 60)) + " hours ago"
        }
        else if (relativeTimeMs < 2 * 24 * 60 * 60 * 1000) {
            return "1 day ago"
        }
        else if (relativeTimeMs < 7 * 24 * 60 * 60 * 1000) {
            return Math.floor(relativeTimeMs / (1000 * 60 * 60 * 24)) + " days ago"
        }
        else if (relativeTimeMs < 366 * 24 * 60 * 60 * 1000) {
            return timestamp.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        }
        else {
            return timestamp.getFullYear().toString()
        }
    }

    function TransformDateString(dateString: string) {
        const date: any = new Date(dateString)
        const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
        return { date: date.toLocaleDateString(undefined, options), time: date.toLocaleTimeString('en-US') }
    }

    return { CapitalizeString, IRElementTitle, PluralizeString, toIRElementType, toIRElementPath, toIRElementAPIPath, GetRelativeTime, TransformDateString }
})