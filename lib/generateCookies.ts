import jwt, { JwtPayload } from "jsonwebtoken"

type payloadType = {
    id: string,
    username: string,
    name: string,
    role: string
}

export function generateCookie(payload: payloadType): string{
    const jwtSecret = process.env.JWT_SECRET
    if(!jwtSecret){
        throw new Error("JWT Secret not provided, check environment variables")
    }
    const token = jwt.sign(payload, jwtSecret, {expiresIn: "1d"})
    return token
}

export function verifyCookie(token: string): string | JwtPayload {
    const jwtSecret = process.env.JWT_SECRET
    if(!jwtSecret){
        throw new Error("JWT Secret not provided, check environment variables")
    }
    
    const userData = jwt.verify(token, jwtSecret)
    if(!userData){
        return ""
    }
    return userData
}