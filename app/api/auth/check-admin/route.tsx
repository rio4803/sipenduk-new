import { NextResponse } from "next/server"
import { checkAdminExists, createDefaultAdmin } from "@/lib/auth"

export async function GET() {
  try {
    console.log("Checking if admin exists...")

    const adminExists = await checkAdminExists()
    if (!adminExists) {
      console.log("Creating default admin...")
      const defaultAdmin = await createDefaultAdmin()
      console.log("Default admin created with username:", defaultAdmin.username)

      return NextResponse.json({
          username: defaultAdmin.username,
          password: defaultAdmin.password,
        })
    }

    // If admin exists, return empty object
    console.log("Admin already exists, no need to create default")
    return NextResponse.json({})
  } catch (error) {
    console.error("Error checking admin:", error)
    return NextResponse.json(
      {
        error: "Error checking admin",
        details: error instanceof Error ? error.message : "",
      },
      { status: 500 },
    )
  }
}

