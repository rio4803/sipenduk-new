import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"
import { generateCookie } from "@/lib/generateCookies"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 })
    }

    // Authenticate user
    const user = await loginUser(username, password)

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
    }

    const token = generateCookie({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    })

    const res = NextResponse.json({ user })
    res.cookies.set("sipenduk_loginToken", token, {
      maxAge: 60*60*24,
      httpOnly: true,
      path: "/"
    })

    return res
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat login" }, { status: 500 })
  }
}

