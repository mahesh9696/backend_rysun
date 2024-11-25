import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { User } from "src/schema/user.schema";
import { Document, Types } from "mongoose";
export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop()
    name: string;
    @Prop()
    description: string;
    @Prop()
    imageUrl: string;
    @Prop({ type: Types.ObjectId, ref: 'User' }) // Add this line
    userId: Types.ObjectId; // Add this line
    @Prop({ default: null }) // Add deletedAt field for soft deletes
    deletedAt: Date;
}
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre('save', function (next) {
    if (!this.deletedAt) {
        this.deletedAt = null;
    }
    next();
});

