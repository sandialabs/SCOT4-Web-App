export class ModelTagRemove {
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
export class NewTag {
    target_id: number;
    target_type: string;
    tag_name: string;
    tag_description: string;
    constructor(
        target_id: number,
        target_type: string,
        tag_name: string,
        tag_description: string,
    ) {
        this.target_id = target_id;
        this.target_type = target_type;
        this.tag_name = tag_name;
        this.tag_description = tag_description;
    }
}

export class Tag {
    id: number;
    name: string;
    description?: string
    constructor(
        id: number,
        name: string,
        description?: string
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}

