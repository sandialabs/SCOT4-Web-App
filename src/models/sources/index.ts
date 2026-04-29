export class ModelSourceRemove {
    target_id: number;
    target_type: string;
    constructor(
        target_id: number,
        target_type: string
    ) {
        this.target_id = target_id;
        this.target_type = target_type;
    }
}

export class NewSource {
    target_id: number;
    target_type: string;
    source_name: string;
    source_description: string;
    constructor(
        target_id: number,
        target_type: string,
        source_name: string,
        source_description: string,
    ) {
        this.target_id = target_id;
        this.target_type = target_type;
        this.source_name = source_name;
        this.source_description = source_description;
    }
}


export class Source {
    id: number;
    name: string;
    description?: string;
    constructor(
        id: number,
        name: string,
        description?: string,
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}
