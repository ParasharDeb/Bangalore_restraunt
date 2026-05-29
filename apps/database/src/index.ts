import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
const schema=mongoose.Schema;
const ObjectId=schema.ObjectId;
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.DATABASE_URL ;
  console.log(uri)
  if(!uri){
    console.log("db not found")
    return
  }
  await mongoose.connect(uri)
  console.log("Mongo connected");
}
const admin=new schema({
    name:{type:String,required:true},
    password:{type:String,required:true}
})
const dish=new schema({
    name:{type:String,required:true},
    category:{type:String,required:true},
    description:{type:String},
    available:{type:Boolean,required:true,default:true},
    price:{type:Number,required:true},
    image:{type:String,required:true}
})

const cartItem=new schema({
    dishId:{type:ObjectId,ref:'dish',required:true},
    quantity:{type:Number,required:true,default:1},
    price:{type:Number,required:true}
})

const cart=new schema({
    sessionId:{type:String,required:true,unique:true},
    items:[cartItem],
    createdAt:{type:Date,default:Date.now},
    expiresAt:{type:Date,default:()=>new Date(Date.now()+24*60*60*1000)}
})
cart.index({expiresAt:1},{expireAfterSeconds:0})

const order=new schema({
    orderId:{type:String,required:true,unique:true},
    sessionId:{type:String,required:true},
    items:[{
        dishId:{type:ObjectId,ref:'dish'},
        dishName:{type:String,required:true},
        quantity:{type:Number,required:true},
        price:{type:Number,required:true}
    }],
    totalAmount:{type:Number,required:true},
    status:{type:String,enum:['pending','confirmed','preparing','completed','cancelled'],default:'pending'},
    paymentId:{type:String,required:true},
    paymentStatus:{type:String,enum:['pending','completed','failed'],default:'pending'},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

export const adminModel=mongoose.model('admin',admin);
export const dishModel=mongoose.model('dish',dish);
export const cartModel=mongoose.model('cart',cart);
export const orderModel=mongoose.model('order',order);