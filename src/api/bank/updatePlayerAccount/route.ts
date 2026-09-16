export async function POST(req: Request) {
    // userId: playerId, type: type, amount: amount

    const body = await req.json();

    const { userId, type, amount } = await req.json();

    console.log(body)
}