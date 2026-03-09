"use client";

import { Render, type Data } from "@measured/puck";
import { normalizePuckData } from "@/lib/puck-data-normalization";
import config from "@/puck/config";

export default function PuckRenderClient({ data }: { data: Data }) {
    return <Render config={config} data={normalizePuckData(data)} />;
}
