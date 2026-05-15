import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { createAccessToken } from "@/lib/db-helpers";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();

    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase());

    if (queryError) {
      return NextResponse.json({ detail: "DB error: " + queryError.message }, { status: 500 });
    }

    const user = users?.[0] || null;
    if (!user) return NextResponse.json({ detail: "User tidak ditemukan: " + email.toLowerCase() }, { status: 401 });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return NextResponse.json({ detail: "Email atau password salah" }, { status: 401 });

    const token = createAccessToken(user.id, user.email);
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
      },
    });

    response.cookies.set("sppg_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 43200,
      sameSite: "lax",
    });

    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
