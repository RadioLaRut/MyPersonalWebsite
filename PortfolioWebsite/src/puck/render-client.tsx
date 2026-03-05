"use client";

import { Render, type Data } from "@measured/puck";
import config from "@/puck/config";

export default function PuckRenderClient({ data }: { data: Data }) {
    return <Render config={config} data={data} />;
}
