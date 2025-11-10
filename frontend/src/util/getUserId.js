export const getUserId=(u)=>{

    if(!u) return ""

    if(typeof u==="string") return u.toLowerCase()
    if(typeof u==="object"){
        if(u._id) return String(u._id).toLocaleLowerCase()
        if(u.id) return String(u.id).toLocaleLowerCase()
    }

    return String(u).toLowerCase()
}