
export class EntryGeoLocation {
    id: number;
    city: string;
    country: string;
    latitude: string;
    longitude: string;
    isp: string;
    value: number;
    label: string;
    constructor(
        id: number,
        city: string,
        country: string,
        latitude: string,
        longitude: string,
        isp: string,
        value: number,
        label: string
    ) {
        this.id = id;
        this.city = city;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isp = isp;
        this.value = value;
        this.label = label;
    }
}