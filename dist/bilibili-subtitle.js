import { loadConfig } from "./config.js";
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const config = loadConfig();
function getHeaders() {
    const headers = {
        "User-Agent": userAgent,
    };
    if (config.bilibiliSessdata) {
        headers["Cookie"] = `SESSDATA=${config.bilibiliSessdata}`;
    }
    return headers;
}
function extractBvid(url) {
    const bvMatch = url.match(/BV[a-zA-Z0-9]{10}/);
    if (bvMatch) {
        return bvMatch[0];
    }
    return null;
}
async function fetchVideoInfo(bvid) {
    const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
    const response = await fetch(infoUrl, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch video info: ${response.status}`);
    }
    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`Bilibili API error: ${data.message}`);
    }
    return data.data;
}
async function fetchPlayerInfo(bvid, cid) {
    const playerUrl = `https://api.bilibili.com/x/player/wbi/v2?bvid=${bvid}&cid=${cid}`;
    const response = await fetch(playerUrl, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch player info: ${response.status}`);
    }
    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`Bilibili API error: ${data.message}`);
    }
    return data.data;
}
async function fetchSubtitleJson(subtitleUrl) {
    const response = await fetch(subtitleUrl, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch subtitle: ${response.status}`);
    }
    return await response.json();
}
export async function fetchBilibiliSubtitle(url) {
    try {
        const bvid = extractBvid(url);
        if (!bvid) {
            throw new Error("Invalid Bilibili URL or BV ID");
        }
        console.log(`[read-bili] Fetching Bilibili subtitle for: ${bvid}`);
        const videoInfo = await fetchVideoInfo(bvid);
        const cid = videoInfo.cid;
        const playerInfo = await fetchPlayerInfo(bvid, cid);
        if (!playerInfo.subtitle || !playerInfo.subtitle.subtitles || playerInfo.subtitle.subtitles.length === 0) {
            console.log(`[read-bili] Video has no CC subtitles`);
            return "该视频没有CC字幕";
        }
        const subtitleUrl = playerInfo.subtitle.subtitles[0].subtitle_url;
        const subtitleData = await fetchSubtitleJson(subtitleUrl);
        if (!subtitleData.body || subtitleData.body.length === 0) {
            console.log(`[read-bili] Subtitle content is empty`);
            return "字幕内容为空";
        }
        const contents = subtitleData.body.map((item) => item.content);
        const subtitleText = contents.join('\n');
        console.log(`[read-bili] Successfully fetched ${contents.length} subtitle lines`);
        return subtitleText;
    }
    catch (error) {
        console.error(`[read-bili] Failed to fetch Bilibili subtitle: ${error.message}`);
        throw error;
    }
}
