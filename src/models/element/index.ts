
export class ModelElementPromote {
    destination: string;
    destination_id: number | undefined;
    source: any[];
    sources: any[];
    tags: any[];
    constructor(
        destination: string,
        destination_id: number | undefined,
        source: any[],
        sources: any[],
        tags: any[],
    ) {
        this.destination = destination;
        this.destination_id = destination_id
        this.source = source;
        this.sources = sources;
        this.tags = tags;
    }
}

