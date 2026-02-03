import {Schema,model,Document,Types} from 'mongoose'

export interface IUser extends Document {
    _id: Types.ObjectId; 
    name:string,
    email:string,
    passwordHash:string,
    role:"user" | "admin";
    refreshTokens:string[];
    lastLocation?:{type:"Point"; coordinates:[number,number]};
}

const UserSchema=new Schema<IUser>({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true,index:true},
    passwordHash:{type:String,required:true},
    role: {
        type:String, enum:["user","admin"],default:"user"
    },
    refreshTokens:{type:[String],default:[]},
    lastLocation:{
        type:{
            type:String,enum:["Point"],
        },
        coordinates:{type:[Number],index:"2dsphere",required:false}
    }
},{timestamps:true});

UserSchema.index({"lastLocation":"2dsphere"})

export default model<IUser>("User",UserSchema)
