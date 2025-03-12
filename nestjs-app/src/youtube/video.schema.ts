import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface Stream {
    quality: string;
    url: string;
}

@Schema()
export class Video extends Document {
    @Prop({ required: true, unique: true })
    videoId: string;

    @Prop({ type: [Object], required: true })
    streams: Stream[];
}

export const VideoSchema = SchemaFactory.createForClass(Video); 