import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/PD/matches?status=SCHEDULED", {
      headers: {
        "X-Auth-Token": "4d10b18df7541e6bdad6e76cbb3d392",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
