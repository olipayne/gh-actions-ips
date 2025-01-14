export default {
    async fetch(request, env) {
        const { searchParams, pathname } = new URL(request.url);

        // Show all results
        if (pathname === "/results") {
            const { results } = await env.github_actions_ips.prepare("SELECT * FROM requests").all();
            return new Response(JSON.stringify(results, null, 2), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // Process secret param
        const secret = searchParams.get("secret");
        if (secret !== "xyz123") {
            return new Response("Missing or incorrect secret", { status: 401 });
        }

        // Get IP - use CF-Connecting-IP or fallback
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";

        // Insert or update record
        const row = await env.github_actions_ips.prepare("SELECT * FROM requests WHERE ip = ?").bind(ip).first();
        if (row) {
            await env.github_actions_ips
                .prepare("UPDATE requests SET count = count + 1, last_seen = ? WHERE ip = ?")
                .bind(new Date().toISOString(), ip)
                .run();
        } else {
            await env.github_actions_ips
                .prepare("INSERT INTO requests (ip, count, last_seen) VALUES (?, ?, ?)")
                .bind(ip, 1, new Date().toISOString())
                .run();
        }

        return new Response("OK");
    },
};
