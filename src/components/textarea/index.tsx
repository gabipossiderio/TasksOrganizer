import { HTMLProps } from "react";

export function Textarea({...rest}: HTMLProps<HTMLTextAreaElement>){
  return(
    <textarea className="w-full resize-none h-40 p-2 outline-none rounded-lg border-2 leading-normal border-neutral-500" {...rest}></textarea>
  )
}