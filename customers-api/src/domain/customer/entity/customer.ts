import { randomUUID } from 'crypto';

type CustomerProps = {
    id: string;
    name: string;
    email: string;
    phone: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class Customer {
    private constructor(private props: CustomerProps){ }

    public static create(name: string, email: string, phone:string) {
        return new Customer({
            id: randomUUID(),
            name,
            email,
            phone,
        })
    }

    public static with(props: CustomerProps){
        return new Customer(props);
    }

    public get id(){
        return this.props.id;
    }

    public get name(): string {
        return this.props.name;
    }

    public get email(): string {
        return this.props.email;
    }

    public get phone(): string {
        return this.props.phone;
    }

    public get isDeleted(): boolean {
        return this.props.isDeleted ?? false;
    }

    public get createdAt(): string | undefined {
        return this.props.createdAt;
    }

    public get updatedAt(): string | undefined {
        return this.props.updatedAt;
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}