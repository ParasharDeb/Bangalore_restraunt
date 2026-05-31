'use client'
import {Button} from "@repo/ui/button"
import { Inputbox } from "@repo/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function Signup(){
    const [username,setusername]=useState("")
    const [password,setpassword]=useState("")
    const [email,setemail]=useState("")
    const Router=useRouter()
    return(
        <div className="bg-paper flex w-screen h-screen justify-center items-center">
            <div className="isolate aspect-video w-96 h-fit rounded-xl bg-white/20 shadow-lg ring-1 ring-black/5 px-5 py-10">
                <div className="text-[#ff7a29] font-bold text-4xl font-mono ml-25">Signup</div>
                <Inputbox Changehandler={(e)=>{setusername(e.target.value)}} type="text" placeholder="username" Title="Username"/>
                <Inputbox Changehandler={(e)=>{setpassword(e.target.value)}} type="password" placeholder="password" Title="Password"/>
                <Inputbox Changehandler={(e)=>{setemail(e.target.value)}} type="text" placeholder="Email" Title="Email"/>
                <Button children="Signup" clickhandler={()=>{axios.post(`${API_BASE_URL}/api/v1/user/signup`,{username,password,email}).then(Response=>{
                    Router.push("/signin")
                    console.log(Response)
                }).catch(error=>{
                    console.log(error)
                })}}/>
                {/* SHould have a footer  */}
                <div>

                </div>
            </div>
        </div>
    )
}